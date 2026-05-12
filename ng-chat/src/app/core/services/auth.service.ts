import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthCredentials, AuthResponse, RegisterPayload, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Signals ─────────────────────────────────────────────────────────────────
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  // ── Public API ───────────────────────────────────────────────────────────────
  login(credentials: AuthCredentials) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => this.handleAuthSuccess(res)),
        catchError((err) => throwError(() => err))
      );
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(
        tap((res) => this.handleAuthSuccess(res)),
        catchError((err) => throwError(() => err))
      );
  }

  logout(): void {
    localStorage.removeItem(environment.jwtKey);
    localStorage.removeItem('ng_chat_user');
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtKey);
  }

  // ── Private ──────────────────────────────────────────────────────────────────
  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(environment.jwtKey, res.token);
    localStorage.setItem('ng_chat_user', JSON.stringify(res.user));
    this._currentUser.set(res.user);
    this.router.navigate(['/chat']);
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('ng_chat_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
