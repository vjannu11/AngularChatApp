import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">◈</span>
            <span class="logo-text">NgChat</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to continue messaging</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="your_username"
              autocomplete="username"
              [class.invalid]="isInvalid('username')"
            />
            @if (isInvalid('username')) {
              <span class="field-error">Username is required</span>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
              [class.invalid]="isInvalid('password')"
            />
            @if (isInvalid('password')) {
              <span class="field-error">Password must be at least 6 characters</span>
            }
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Signing in…
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base);
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 40px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .logo-icon {
      font-size: 28px;
      color: var(--accent);
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    h1 {
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    p {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    input {
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      padding: 10px 14px;
      transition: border-color var(--transition);
      width: 100%;

      &::placeholder { color: var(--text-muted); }

      &:focus { border-color: var(--accent); }

      &.invalid { border-color: var(--danger); }
    }

    .field-error {
      color: var(--danger);
      font-size: 12px;
    }

    .btn-primary {
      background: var(--accent);
      border: none;
      border-radius: var(--radius-md);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
      padding: 12px;
      transition: background var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &:hover:not(:disabled) { background: var(--accent-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .alert-error {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      border-radius: var(--radius-md);
      color: var(--danger);
      font-size: 13px;
      padding: 10px 14px;
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 13px;

      a { color: var(--accent); font-weight: 500; }
    }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(field: 'username' | 'password'): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message ?? 'Invalid username or password'
        );
        this.loading.set(false);
      },
    });
  }
}
