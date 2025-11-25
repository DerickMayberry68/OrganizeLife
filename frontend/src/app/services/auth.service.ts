// src/app/services/auth.service.ts

import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

// ──────────────────────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  householdName: string;
}

export interface HouseholdMembership {
  householdId: string;
  householdName: string;
  role: string;
  joinedAt: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  households: HouseholdMembership[];
}

export interface LoginResponse {
  userId: string;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  households: HouseholdMembership[];
}

export interface RegisterResponse {
  userId: string;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  defaultHouseholdId: string;
  defaultHouseholdName: string;
}

// ──────────────────────────────────────────────────────────────
//  AuthService – 100% Signals + Observables, Zero Promises
// ──────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  // ───── Core State (signals) ─────
  private readonly currentUser = signal<CurrentUser | null>(null);
  private readonly loadingUser = signal(false);
  private authListenerSetup = false;

  // Public readonly signals
  readonly currentUser$ = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userName = computed(() => {
    const u = this.currentUser();
    if (!u) return 'Guest';
    if (u.firstName) {
      return `${u.firstName} ${u.lastName || ''}`.trim();
    }
    return u.email.split('@')[0];
  });

  // ───── React to Supabase client becoming ready ─────
  constructor() {
    effect(() => {
      const client = this.supabase.client$();
      if (client && !this.authListenerSetup) {
        untracked(() => {
          this.setupAuthListener(client);
          this.authListenerSetup = true;
          this.restoreSession(client);
        });
      }
    });
  }

  // ───── Auth State Listener (pure reactive) ─────
  private setupAuthListener(client: any): void {
    client.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) this.loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }

  // ───── Restore session on app start (Observable-based) ─────
  private restoreSession(client: any): void {
    from(client.auth.getSession())
      .pipe(
        map(({ data }: any) => {
          if (data.session?.user) {
            this.loadUserProfile();
          } else {
            this.currentUser.set(null);
          }
        }),
        catchError(() => {
          this.currentUser.set(null);
          return of(null);
        })
      )
      .subscribe();
  }

  // ───── Load full user profile (Observable-based) ─────
  private loadUserProfile(): void {
    if (this.loadingUser()) return;
    this.loadingUser.set(true);

    const client = this.supabase.client$();
    if (!client) {
      this.loadingUser.set(false);
      return;
    }

    from(client.auth.getUser())
      .pipe(
        switchMap(({ data: { user } }: any) => {
          if (!user) {
            this.currentUser.set(null);
            this.loadingUser.set(false);
            return of(null);
          }

          const metadata = user.user_metadata || {};
          return this.loadHouseholds$(user.id).pipe(
            map(households => ({
              userId: user.id,
              email: user.email || '',
              firstName: metadata['first_name'],
              lastName: metadata['last_name'],
              households
            }))
          );
        }),
        tap(user => {
          if (user) {
            this.currentUser.set(user);
          }
          this.loadingUser.set(false);
        }),
        catchError(() => {
          this.currentUser.set(null);
          this.loadingUser.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  // ───── Household loading (Observable-based) ─────
  private loadHouseholds$(userId: string): Observable<HouseholdMembership[]> {
    const client = this.supabase.client$();
    if (!client) return of([]);

    return from(
      client
        .from('household_members')
        .select(`household_id, role, joined_at, households (id, name)`)
        .eq('user_id', userId)
        .eq('is_active', true)
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error loading households:', error);
          return [];
        }

        return (data || []).map((row: any) => ({
          householdId: row.household_id,
          householdName: row.households?.name || 'Unknown Household',
          role: row.role || 'Member',
          joinedAt: row.joined_at
        }));
      }),
      catchError(err => {
        console.error('Error loading households:', err);
        return of([]);
      })
    );
  }

  // ───── Public API ─────
  
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.supabase.whenReady$().pipe(
      switchMap(client => from(client.auth.signInWithPassword(request))),
      map(({ data, error }: any) => {
        if (error) {
          throw new Error(error.message.includes('Invalid') ? 'Invalid email or password' : 'Login failed');
        }
        if (!data.session || !data.user) {
          throw new Error('No session');
        }

        // User profile will be loaded via auth state listener
        return {
          userId: data.user.id,
          email: data.user.email!,
          accessToken: data.session.access_token,
          tokenType: 'Bearer',
          expiresIn: data.session.expires_in ?? 3600,
          refreshToken: data.session.refresh_token,
          households: []
        };
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.supabase.whenReady$().pipe(
      switchMap(client => from(
        client.auth.signUp({
          email: request.email,
          password: request.password,
          options: { data: { first_name: request.firstName, last_name: request.lastName } }
        })
      )),
      switchMap(({ data, error }: any) => {
        if (error) {
          return throwError(() => error);
        }
        if (!data.user || !data.session) {
          return throwError(() => new Error('Registration failed'));
        }

        // Create household
        return this.createHousehold$(request.householdName, data.user.id).pipe(
          map(household => ({
            userId: data.user.id,
            email: data.user.email!,
            accessToken: data.session.access_token,
            tokenType: 'Bearer',
            expiresIn: data.session.expires_in ?? 3600,
            refreshToken: data.session.refresh_token,
            defaultHouseholdId: household.id,
            defaultHouseholdName: household.name
          }))
        );
      }),
      catchError(err => throwError(() => err))
    );
  }

  private createHousehold$(name: string, userId: string): Observable<{ id: string; name: string }> {
    return this.supabase.whenReady$().pipe(
      switchMap(client => {
        return from(
          client
            .from('households')
            .insert({ name, created_by: userId })
            .select()
            .single()
        ).pipe(
          switchMap(({ data: household, error }: any) => {
            if (error || !household) {
              return throwError(() => new Error('Failed to create household'));
            }

            // Add user as admin member
            return from(
              client
                .from('household_members')
                .insert({
                  household_id: household.id,
                  user_id: userId,
                  role: 'Admin',
                  is_active: true,
                  joined_at: new Date().toISOString()
                })
            ).pipe(
              map(() => ({ id: household.id, name: household.name }))
            );
          })
        );
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): Observable<void> {
    return this.supabase.whenReady$().pipe(
      switchMap(client => {
        // Sign out from Supabase - this clears the session and localStorage
        return from(client.auth.signOut());
      }),
      map((response) => {
        // Supabase signOut returns { error } or void
        if (response && (response as any).error) {
          console.warn('Supabase signOut error:', (response as any).error);
        }
        return void 0;
      }),
      tap(() => {
        // Clear local state regardless of signOut result
        this.currentUser.set(null);
        // Navigate to login - Supabase will have cleared the session
        this.router.navigate(['/login'], { replaceUrl: true });
      }),
      catchError((error) => {
        console.error('Error during logout:', error);
        // Even if signOut fails, clear local state and navigate
        this.currentUser.set(null);
        this.router.navigate(['/login'], { replaceUrl: true });
        return of<void>(undefined);
      })
    );
  }

  // ───── Token management (Observable-based) ─────
  getToken(): Observable<string | null> {
    return this.supabase.whenReady$().pipe(
      switchMap(client => from(client.auth.getSession())),
      map(({ data }) => data.session?.access_token || null),
      catchError(() => of(null))
    );
  }

  // ───── Compatibility (keeps old code working) ─────
  getCurrentUser(): CurrentUser | null {
    return this.currentUser();
  }

  getDefaultHouseholdId(): string | null {
    return this.currentUser()?.households?.[0]?.householdId || null;
  }

  updateCurrentUser(user: CurrentUser): void {
    this.currentUser.set(user);
  }

  // Optional backdoor login for dev
  backdoorLogin?(request: LoginRequest): Observable<LoginResponse>;
}