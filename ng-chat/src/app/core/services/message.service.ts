import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models';
import { WebSocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly ws = inject(WebSocketService);

  private readonly _messages = signal<Message[]>([]);
  readonly messages = this._messages.asReadonly();

  // ── Load history ──────────────────────────────────────────────────────────────
  loadMessages(channelId: string) {
    return this.http
      .get<Message[]>(`${environment.apiUrl}/channels/${channelId}/messages`)
      .pipe(tap((msgs) => this._messages.set(msgs)));
  }

  // ── Send ──────────────────────────────────────────────────────────────────────
  sendMessage(channelId: string, content: string): void {
    this.ws.send('message:new', { channelId, content });
  }

  // ── Real-time listeners ───────────────────────────────────────────────────────
  listenForNewMessages(): void {
    this.ws.on<Message>('message:new').subscribe((msg) => {
      this._messages.update((msgs) => [...msgs, msg]);
    });
  }

  listenForEdits(): void {
    this.ws.on<Message>('message:edit').subscribe((updated) => {
      this._messages.update((msgs) =>
        msgs.map((m) => (m.id === updated.id ? updated : m))
      );
    });
  }

  listenForDeletes(): void {
    this.ws.on<{ id: string }>('message:delete').subscribe(({ id }) => {
      this._messages.update((msgs) => msgs.filter((m) => m.id !== id));
    });
  }

  clearMessages(): void {
    this._messages.set([]);
  }
}
