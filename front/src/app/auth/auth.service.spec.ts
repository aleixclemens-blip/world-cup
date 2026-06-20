import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with logged-out state (isAuthenticated = false)', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userInitials()).toBe('');
  });

  it('should update state to true when login() is called', () => {
    service.login();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userInitials()).toBe('JD');
  });

  it('should update state to false when logout() is called', () => {
    service.login();
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userInitials()).toBe('');
  });

  it('should toggle state when toggleAuth() is called', () => {
    expect(service.isAuthenticated()).toBe(false);
    service.toggleAuth();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userInitials()).toBe('JD');
    service.toggleAuth();
    expect(service.isAuthenticated()).toBe(false);
  });
});
