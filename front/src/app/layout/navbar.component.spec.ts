import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        AuthService
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
    const authService = TestBed.inject(AuthService);

    // Set to authenticated
    authService.login();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button?.textContent?.trim()).toBe('JD');
    expect(button?.getAttribute('aria-label')).toBe('Cerrar sesión');
  });

  it('should display person icon when user is logged out', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const authService = TestBed.inject(AuthService);

    // Set to logged out
    authService.logout();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    const icon = button?.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('person');
    expect(button?.getAttribute('aria-label')).toBe('Iniciar sesión');
  });

  it('should toggle auth when clicking avatar button', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const authService = TestBed.inject(AuthService);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(authService.isAuthenticated()).toBe(false);
    button?.click();
    fixture.detectChanges();
    expect(authService.isAuthenticated()).toBe(true);

    button?.click();
    fixture.detectChanges();
    expect(authService.isAuthenticated()).toBe(false);
  });
});
