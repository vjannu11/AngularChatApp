import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../../../../core/services/message.service';
import { ChannelService } from '../../../../core/services/channel.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="input-area">
      <form [formGroup]="form" (ngSubmit)="onSend()" class="input-form">
        <textarea
          formControlName="content"
          class="message-textarea"
          [placeholder]="placeholder()"
          rows="1"
          (keydown.enter)="onEnter($event)"
          (input)="autoResize($event)"
        ></textarea>
        <button
          type="submit"
          class="send-btn"
          [disabled]="form.invalid || !channelService.activeChannel()"
          title="Send message"
        >
          ↑
        </button>
      </form>
    </div>
  `,
  styles: [`
    .input-area {
      padding: 12px 20px 16px;
      flex-shrink: 0;
    }

    .input-form {
      align-items: flex-end;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      transition: border-color var(--transition);

      &:focus-within { border-color: var(--accent); }
    }

    .message-textarea {
      background: none;
      border: none;
      color: var(--text-primary);
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
      max-height: 120px;
      outline: none;
      overflow-y: auto;
      resize: none;

      &::placeholder { color: var(--text-muted); }
    }

    .send-btn {
      align-items: center;
      background: var(--accent);
      border: none;
      border-radius: 50%;
      color: #fff;
      display: flex;
      flex-shrink: 0;
      font-size: 16px;
      height: 32px;
      justify-content: center;
      transition: background var(--transition), opacity var(--transition);
      width: 32px;

      &:hover:not(:disabled) { background: var(--accent-hover); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  `],
})
export class MessageInputComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly messageService = inject(MessageService);
  readonly channelService = inject(ChannelService);

  readonly form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly placeholder = signal('Message #general');

  onSend(): void {
    const channel = this.channelService.activeChannel();
    const content = this.form.getRawValue().content.trim();
    if (!content || !channel) return;

    this.messageService.sendMessage(channel.id, content);
    this.form.reset();
  }

  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }
}
