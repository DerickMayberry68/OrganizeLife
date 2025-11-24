// src/app/services/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Checking access for', state.url);

  // This is the ONLY reliable way: ask Supabase if there's a valid session
  const isAuth = await authService.isAuthenticated();

  if (isAuth) {
    console.log('AuthGuard: User is authenticated → access granted');
    return true;
  }

  console.log('AuthGuard: No valid session → redirecting to login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};