import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { signal, computed } from '@angular/core';

class MockAuthService {
  public readonly currentUserSignal = signal<any>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly userInitials = computed(() => {
    const user = this.currentUserSignal();
    return user ? 'JD' : '';
  });

  public login(): void {
    this.currentUserSignal.set({ id: 1, email: 'john@example.com' });
  }

  public logout(): void {
    this.currentUserSignal.set(null);
  }
}

describe('NavbarComponent', () => {
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = new MockAuthService();
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render application name', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span')?.textContent).toContain('World cup Tracker');
  });

  it('should display initials when user is authenticated', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    authService.login();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[title="Perfil de usuario"]');
    expect(link?.textContent?.trim()).toBe('JD');
    expect(link?.getAttribute('aria-label')).toBe('Ver perfil');
  });

  it('should display person icon when user is logged out', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    authService.logout();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[title="Perfil de usuario"]');
    const icon = link?.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('person');
    expect(link?.getAttribute('aria-label')).toBe('Iniciar sesión');
  });
});
