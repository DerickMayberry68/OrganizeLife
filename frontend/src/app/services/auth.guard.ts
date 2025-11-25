// src/app/services/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { from } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  console.log('AuthGuard: Checking access for', state.url);

  // Use Observable-based check - wait for Supabase client to be ready, then check session
  return supabase.whenReady$().pipe(
    switchMap(client => from(client.auth.getSession())),
    map(({ data }) => {
      const hasSession = !!data.session?.user;

      if (hasSession) {
        console.log('AuthGuard: User is authenticated → access granted');
        return true;
      }

      console.log('AuthGuard: No valid session → redirecting to login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }),
    catchError(() => {
      console.log('AuthGuard: Error checking session → redirecting to login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};