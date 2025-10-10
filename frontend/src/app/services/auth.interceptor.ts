import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone the request and add authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response errors
  return next(req).pipe(
    catchError((error) => {
      // Check for expired token in error message
      const wwwAuthenticate = error.headers?.get('www-authenticate');
      const isTokenExpired = wwwAuthenticate?.includes('token expired') || 
                            error.error?.message?.includes('token expired') ||
                            error.error?.error_description?.includes('token expired');
      
      // If unauthorized or token expired, logout and redirect to login
      if (error.status === 401 || isTokenExpired) {
        toastService.error('Session Expired', 'Your session has expired. Please log in again.');
        authService.logout();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};

