import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Channel } from '../models';

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly http = inject(HttpClient);

  private readonly _channels = signal<Channel[]>([]);
  private readonly _activeChannel = signal<Channel | null>(null);

  readonly channels = this._channels.asReadonly();
  readonly activeChannel = this._activeChannel.asReadonly();

  loadChannels() {
    return this.http
      .get<Channel[]>(`${environment.apiUrl}/channels`)
      .pipe(tap((channels) => this._channels.set(channels)));
  }

  setActiveChannel(channel: Channel): void {
    this._activeChannel.set(channel);
  }

  createChannel(name: string, description: string, isPrivate: boolean) {
    return this.http
      .post<Channel>(`${environment.apiUrl}/channels`, { name, description, isPrivate })
      .pipe(
        tap((channel) => this._channels.update((cs) => [...cs, channel]))
      );
  }
}
