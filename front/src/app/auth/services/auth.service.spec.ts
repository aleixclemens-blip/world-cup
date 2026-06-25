import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { API_URL } from '../../core/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with logged-out state', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userInitials()).toBe('');
  });

  it('should fetch user info on initialize() success', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const initPromise = service.initialize();

    const req = httpTestingController.expectOne(`${API_URL}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    await initPromise;

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.userInitials()).toBe('TE');
  });

  it('should handle initialize() failure gracefully', async () => {
    const initPromise = service.initialize();

    const req = httpTestingController.expectOne(`${API_URL}/auth/me`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await initPromise;

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should update state to true on login()', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    service.login('test@example.com', 'password').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
    req.flush(mockUser);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should call register endpoint on register()', () => {
    service.register('test@example.com', 'password').subscribe();

    const req = httpTestingController.expectOne(`${API_URL}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
    req.flush({ id: 1, email: 'test@example.com' });
  });

  it('should call refresh endpoint on refresh()', () => {
    service.refresh().subscribe();

    const req = httpTestingController.expectOne(`${API_URL}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'refreshed' });
  });

  it('should log out and navigate to login on logout()', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    // login first
    service.login('test@example.com', 'password').subscribe();
    httpTestingController.expectOne(`${API_URL}/auth/login`).flush({ id: 1, email: 'test@example.com' });
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    const req = httpTestingController.expectOne(`${API_URL}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'logged out' });

    expect(service.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
