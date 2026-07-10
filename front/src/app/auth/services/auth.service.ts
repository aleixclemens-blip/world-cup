import { Service, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../../core/api.config';

import { User } from '../types/auth.types';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(null);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly userInitials = computed(() => {
    const user = this.currentUserSignal();
    if (!user) return '';
    const name = user.username || user.email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  });

  public readonly apiUrl = API_URL;

  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<User>(`${API_URL}/auth/me`).subscribe({
        next: (user) => {
          this.currentUserSignal.set(user);
          resolve();
        },
        error: () => {
          this.currentUserSignal.set(null);
          resolve();
        }
      });
    });
  }

  public login(credentials: { email?: string; username?: string; password: string }): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/login`, credentials).pipe(
      tap((user) => this.currentUserSignal.set(user))
    );
  }

  public register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, { email, username, password });
  }

  public refresh(): Observable<any> {
    return this.http.post(`${API_URL}/auth/refresh`, {});
  }

  public logout(): void {
    this.http.post(`${API_URL}/auth/logout`, {}).subscribe({
      next: () => this.logoutLocal(),
      error: () => this.logoutLocal()
    });
  }

  public logoutLocal(): void {
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
