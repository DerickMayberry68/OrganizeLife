import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth guard checking authentication for:', state.url);
  
  try {
    // First, check localStorage quickly (synchronous check)
    const storedUser = localStorage.getItem('butler_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.userId) {
          console.log('Auth guard - User found in localStorage, allowing access');
          return true;
        }
      } catch (e) {
        console.warn('Auth guard - Error parsing stored user:', e);
      }
    }

    // Then check in-memory user (fast check)
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.userId) {
      console.log('Auth guard - User found in memory, allowing access');
      return true;
    }

    // Finally, check session with timeout (async check)
    const authCheck = Promise.race([
      authService.isAuthenticated(),
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('Auth guard: Authentication check timed out after 3s, checking localStorage fallback');
          // Check localStorage one more time as fallback
          const fallbackUser = localStorage.getItem('butler_user');
          resolve(!!fallbackUser); // Allow if user exists in storage
        }, 3000);
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
    // On error, check localStorage as final fallback
    const fallbackUser = localStorage.getItem('butler_user');
    if (fallbackUser) {
      console.warn('Auth guard - Allowing access due to localStorage fallback');
      return true;
    }
    // Redirect to login if no user found
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

