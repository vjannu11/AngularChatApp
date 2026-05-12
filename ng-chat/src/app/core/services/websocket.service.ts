import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  Subject,
  Observable,
  timer,
  EMPTY,
  share,
  switchMap,
  takeUntil,
  retry,
  tap,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { WsEvent } from '../models';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  private socket$!: WebSocketSubject<WsEvent>;
  private readonly messages$ = new Subject<WsEvent>();

  // ── Connection ───────────────────────────────────────────────────────────────
  connect(): void {
    const token = this.auth.getToken();
    if (!token) return;

    this.socket$ = webSocket<WsEvent>({
      url: `${environment.wsUrl}?token=${token}`,
      openObserver: {
        next: () => console.log('[WS] Connected'),
      },
      closeObserver: {
        next: () => console.log('[WS] Disconnected'),
      },
    });

    this.socket$
      .pipe(
        retry({ delay: (_, count) => timer(Math.min(count * 1000, 10_000)) }),
        takeUntil(this.destroy$),
        tap({ error: (e) => console.error('[WS] Error:', e) })
      )
      .subscribe({
        next: (event) => this.messages$.next(event),
        error: (e) => console.error('[WS] Fatal:', e),
      });
  }

  disconnect(): void {
    this.socket$?.complete();
  }

  // ── Outgoing ─────────────────────────────────────────────────────────────────
  send<T>(type: string, payload: T): void {
    this.socket$?.next({ type: type as WsEvent['type'], payload });
  }

  // ── Incoming stream ───────────────────────────────────────────────────────────
  on<T>(eventType: WsEvent['type']): Observable<T> {
    return this.messages$.pipe(
      switchMap((event) =>
        event.type === eventType ? [event.payload as T] : EMPTY
      ),
      share()
    );
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
