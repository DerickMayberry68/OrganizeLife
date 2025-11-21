import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth guard checking authentication for:', state.url);
  
  try {
    // Add timeout to auth check to prevent hanging
    const authCheck = Promise.race([
      authService.isAuthenticated(),
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('Auth guard: Authentication check timed out after 5s, allowing access');
          resolve(true); // Allow access if check times out (user is likely authenticated)
        }, 5000);
      })
    ]);
    
    const isAuthenticated = await authCheck;
    console.log('Auth guard - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('Auth guard - allowing navigation to:', state.url);
      return true;
    }

    // Redirect to login with return url
    console.log('Auth guard - redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  } catch (error) {
    console.error('Auth guard error:', error);
    // On error, allow access (fail open) - user is likely authenticated
    console.warn('Auth guard - allowing access due to error');
    return true;
  }
};

