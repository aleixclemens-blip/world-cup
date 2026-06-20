import { Service, signal, computed } from '@angular/core';

@Service()
export class AuthService {
  private readonly isAuthenticatedSignal = signal<boolean>(false);

  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public readonly userInitials = computed(() => {
    return this.isAuthenticated() ? 'JD' : '';
  });

  public login(): void {
    this.isAuthenticatedSignal.set(true);
  }

  public logout(): void {
    this.isAuthenticatedSignal.set(false);
  }

  public toggleAuth(): void {
    this.isAuthenticatedSignal.update((value) => !value);
  }
}
