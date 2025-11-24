import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth guard checking authentication for:', state.url);
  
  try {
    // First, check localStorage quickly (synchronous check) - this is the fastest path
    const storedUser = localStorage.getItem('butler_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.userId) {
          console.log('Auth guard - User found in localStorage, allowing access');
          // Update the service's current user subject to keep it in sync
          authService.updateCurrentUser(user);
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

    // If no stored user, immediately redirect to login (don't try to initialize Supabase)
    // This prevents blocking on Supabase initialization when user is not logged in
    console.log('Auth guard - No user found, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
    
  } catch (error) {
    console.error('Auth guard error:', error);
    // On any error, redirect to login (fail-safe)
    try {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    } catch (navError) {
      console.error('Auth guard - Failed to navigate to login:', navError);
    }
    return false;
  }
};

