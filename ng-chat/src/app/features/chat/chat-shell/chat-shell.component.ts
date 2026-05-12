import { Component, inject, OnInit } from '@angular/core';
import { ChannelSidebarComponent } from '../components/channel-sidebar/channel-sidebar.component';
import { MessageListComponent } from '../components/message-list/message-list.component';
import { MessageInputComponent } from '../components/message-input/message-input.component';
import { ChannelService } from '../../../core/services/channel.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-chat-shell',
  standalone: true,
  imports: [ChannelSidebarComponent, MessageListComponent, MessageInputComponent],
  template: `
    <div class="shell">
      <app-channel-sidebar />
      <main class="chat-area">
        @if (channelService.activeChannel(); as channel) {
          <header class="chat-header">
            <div class="channel-info">
              <span class="channel-hash">#</span>
              <span class="channel-name">{{ channel.name }}</span>
              @if (channel.description) {
                <span class="channel-divider">—</span>
                <span class="channel-desc">{{ channel.description }}</span>
              }
            </div>
            <div class="header-actions">
              <span class="member-count">
                <span class="online-dot"></span>
                {{ channel.memberCount }} members
              </span>
            </div>
          </header>
          <app-message-list />
          <app-message-input />
        } @else {
          <div class="empty-state">
            <div class="empty-icon">◈</div>
            <h2>Select a channel</h2>
            <p>Choose a channel from the sidebar to start chatting</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-base);
    }

    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-base);
    }

    .chat-header {
      align-items: center;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      height: 56px;
      flex-shrink: 0;
    }

    .channel-info {
      align-items: center;
      display: flex;
      gap: 8px;
    }

    .channel-hash {
      color: var(--text-muted);
      font-size: 20px;
      font-weight: 300;
    }

    .channel-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .channel-divider {
      color: var(--text-muted);
    }

    .channel-desc {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .member-count {
      align-items: center;
      color: var(--text-secondary);
      display: flex;
      font-size: 12px;
      gap: 6px;
    }

    .online-dot {
      background: var(--success);
      border-radius: 50%;
      display: inline-block;
      height: 7px;
      width: 7px;
    }

    .empty-state {
      align-items: center;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 12px;
      justify-content: center;
      color: var(--text-secondary);
    }

    .empty-icon {
      color: var(--accent);
      font-size: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .empty-state h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .empty-state p {
      font-size: 14px;
    }
  `],
})
export class ChatShellComponent implements OnInit {
  readonly channelService = inject(ChannelService);
  private readonly ws = inject(WebSocketService);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.ws.connect();
    this.messageService.listenForNewMessages();
    this.messageService.listenForEdits();
    this.messageService.listenForDeletes();
    this.channelService.loadChannels().subscribe();
  }
}
