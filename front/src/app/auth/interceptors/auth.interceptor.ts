import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  let authReq = req;
  if (req.url.startsWith(authService.apiUrl)) {
    authReq = req.clone({ withCredentials: true });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !authReq.url.includes('/auth/refresh') &&
        !authReq.url.includes('/auth/login')
      ) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(false);

    return authService.refresh().pipe(
      switchMap(() => {
        isRefreshing = false;
        const currentSubject = refreshTokenSubject;
        refreshTokenSubject = new BehaviorSubject<boolean>(false);
        currentSubject.next(true);
        currentSubject.complete();
        return next(req);
      }),
      catchError((refreshErr) => {
        isRefreshing = false;
        const currentSubject = refreshTokenSubject;
        refreshTokenSubject = new BehaviorSubject<boolean>(false);
        currentSubject.error(refreshErr);
        authService.logoutLocal();
        return throwError(() => refreshErr);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((ready) => ready),
      take(1),
      switchMap(() => next(req))
    );
  }
}
