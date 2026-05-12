import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ChannelService } from '../../../../core/services/channel.service';
import { MessageService } from '../../../../core/services/message.service';

@Component({
  selector: 'app-channel-sidebar',
  standalone: true,
  template: `
    <aside class="sidebar">
      <!-- Workspace Header -->
      <div class="sidebar-header">
        <div class="workspace-name">
          <span class="workspace-icon">◈</span>
          NgChat
        </div>
        <button class="icon-btn" title="Settings" (click)="logout()">⏻</button>
      </div>

      <!-- User info -->
      @if (auth.currentUser(); as user) {
        <div class="current-user">
          <div class="avatar">{{ user.displayName[0].toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-display">{{ user.displayName }}</span>
            <span class="user-handle">&#64;{{ user.username }}</span>
          </div>
          <span class="status-dot online"></span>
        </div>
      }

      <!-- Channels -->
      <nav class="channel-nav">
        <div class="section-header">
          <span>Channels</span>
        </div>

        @for (channel of channelService.channels(); track channel.id) {
          <button
            class="channel-item"
            [class.active]="channelService.activeChannel()?.id === channel.id"
            (click)="selectChannel(channel)"
          >
            <span class="channel-hash">#</span>
            <span class="channel-name">{{ channel.name }}</span>
          </button>
        }

        @if (channelService.channels().length === 0) {
          <p class="empty-channels">No channels yet</p>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      align-items: center;
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      height: 56px;
      border-bottom: 1px solid var(--border);
    }

    .workspace-name {
      align-items: center;
      color: var(--text-primary);
      display: flex;
      font-size: 15px;
      font-weight: 700;
      gap: 8px;
      letter-spacing: -0.3px;
    }

    .workspace-icon { color: var(--accent); font-size: 18px; }

    .icon-btn {
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 16px;
      padding: 4px 6px;
      transition: color var(--transition);
      &:hover { color: var(--text-primary); }
    }

    .current-user {
      align-items: center;
      display: flex;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-muted);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .user-display {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-handle {
      font-size: 11px;
      color: var(--text-muted);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      &.online { background: var(--success); }
    }

    .channel-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .section-header {
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      padding: 8px 16px 4px;
      text-transform: uppercase;
    }

    .channel-item {
      align-items: center;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      font-size: 14px;
      gap: 6px;
      margin: 1px 8px;
      padding: 6px 8px;
      text-align: left;
      transition: background var(--transition), color var(--transition);
      width: calc(100% - 16px);

      &:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      &.active {
        background: var(--accent-muted);
        color: var(--accent);
        font-weight: 500;

        .channel-hash { color: var(--accent); }
      }
    }

    .channel-hash {
      color: var(--text-muted);
      font-size: 16px;
    }

    .channel-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-channels {
      color: var(--text-muted);
      font-size: 12px;
      padding: 8px 16px;
    }
  `],
})
export class ChannelSidebarComponent {
  readonly auth = inject(AuthService);
  readonly channelService = inject(ChannelService);
  private readonly messageService = inject(MessageService);

  selectChannel(channel: Parameters<ChannelService['setActiveChannel']>[0]): void {
    this.channelService.setActiveChannel(channel);
    this.messageService.clearMessages();
    this.messageService.loadMessages(channel.id).subscribe();
  }

  logout(): void {
    this.auth.logout();
  }
}
