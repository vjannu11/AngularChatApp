import {
  Component,
  inject,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from '../../../../core/services/message.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="message-list" #scrollContainer>
      @for (msg of messageService.messages(); track msg.id; let first = $first) {
        <div
          class="message"
          [class.mine]="msg.author.id === auth.currentUser()?.id"
        >
          @if (msg.type === 'system') {
            <div class="system-message">{{ msg.content }}</div>
          } @else {
            <div class="avatar">
              {{ msg.author.displayName[0].toUpperCase() }}
            </div>
            <div class="message-body">
              <div class="message-meta">
                <span class="author">{{ msg.author.displayName }}</span>
                <span class="timestamp">
                  {{ msg.createdAt | date: 'h:mm a' }}
                  @if (msg.editedAt) { <em>(edited)</em> }
                </span>
              </div>
              <div class="content">{{ msg.content }}</div>
            </div>
          }
        </div>
      }

      @if (messageService.messages().length === 0) {
        <div class="no-messages">
          <p>No messages yet. Say something! 👋</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message {
      display: flex;
      gap: 12px;
      padding: 4px 8px;
      border-radius: var(--radius-md);
      transition: background var(--transition);

      &:hover { background: var(--bg-surface); }
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-elevated);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .message.mine .avatar {
      background: var(--accent-muted);
      color: var(--accent-hover);
    }

    .message-body { flex: 1; min-width: 0; }

    .message-meta {
      align-items: baseline;
      display: flex;
      gap: 8px;
      margin-bottom: 2px;
    }

    .author {
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 600;
    }

    .message.mine .author { color: var(--accent); }

    .timestamp {
      color: var(--text-muted);
      font-size: 11px;

      em {
        font-style: italic;
        color: var(--text-muted);
      }
    }

    .content {
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.55;
      word-break: break-word;
    }

    .system-message {
      color: var(--text-muted);
      font-size: 12px;
      font-style: italic;
      padding: 4px 0;
      text-align: center;
      width: 100%;
    }

    .no-messages {
      align-items: center;
      display: flex;
      flex: 1;
      justify-content: center;

      p {
        color: var(--text-muted);
        font-size: 14px;
      }
    }
  `],
})
export class MessageListComponent implements AfterViewChecked {
  readonly messageService = inject(MessageService);
  readonly auth = inject(AuthService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
