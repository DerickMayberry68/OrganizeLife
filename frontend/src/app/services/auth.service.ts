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
  requiresEmailConfirmation?: boolean;
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
          
          // Check if user has a pending household name (from registration with email confirmation)
          const pendingHouseholdName = metadata['pending_household_name'];
          
          // If user has no households but has a pending household name, create it
          return this.loadHouseholds$(user.id).pipe(
            switchMap(households => {
              if (households.length === 0 && pendingHouseholdName) {
                console.log('[AuthService] Found pending household name, creating household:', pendingHouseholdName);
                // Create household and clear the pending name
                return this.createHousehold$(pendingHouseholdName, user.id).pipe(
                  switchMap(household => {
                    console.log('[AuthService] Household created on first login:', household);
                    // Clear pending household name from metadata
                    return from(
                      client.auth.updateUser({
                        data: { pending_household_name: null }
                      })
                    ).pipe(
                      // Reload households after creation
                      switchMap(() => this.loadHouseholds$(user.id)),
                      map(updatedHouseholds => ({
                        userId: user.id,
                        email: user.email || '',
                        firstName: metadata['first_name'],
                        lastName: metadata['last_name'],
                        households: updatedHouseholds
                      }))
                    );
                  }),
                  catchError(err => {
                    console.error('[AuthService] Error creating household on first login:', err);
                    // Continue even if household creation fails
                    return of({
                      userId: user.id,
                      email: user.email || '',
                      firstName: metadata['first_name'],
                      lastName: metadata['last_name'],
                      households: []
                    });
                  })
                );
              }
              
              // Normal case - user has households or no pending household
              return of({
                userId: user.id,
                email: user.email || '',
                firstName: metadata['first_name'],
                lastName: metadata['last_name'],
                households
              });
            })
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
    console.log('[AuthService] Starting registration for:', request.email);
    return this.supabase.whenReady$().pipe(
      switchMap(client => {
        console.log('[AuthService] Supabase client ready, calling signUp');
        return from(
          client.auth.signUp({
            email: request.email,
            password: request.password,
            options: { 
              data: { 
                first_name: request.firstName, 
                last_name: request.lastName,
                pending_household_name: request.householdName // Store for creation after email confirmation
              } 
            }
          })
        );
      }),
      switchMap(({ data, error }: any) => {
        console.log('[AuthService] signUp response:', { hasData: !!data, hasError: !!error, hasUser: !!data?.user, hasSession: !!data?.session });
        
        if (error) {
          console.error('[AuthService] signUp error:', error);
          // Create a detailed error object with all available information
          const errorObj: any = {
            message: error.message || error.msg || 'Registration failed',
            code: error.code || error.status || null,
            error_description: error.error_description || null
          };
          
          // Preserve the original error structure for better parsing in component
          return throwError(() => ({
            ...errorObj,
            error: error,
            originalError: error
          }));
        }
        if (!data.user) {
          console.error('[AuthService] No user created');
          return throwError(() => new Error('Registration failed: User not created'));
        }

        // If no session, email confirmation is required
        const requiresEmailConfirmation = !data.session;
        console.log('[AuthService] Email confirmation required:', requiresEmailConfirmation);

        if (requiresEmailConfirmation) {
          // If email confirmation is required, we can't create household yet (no session = RLS blocks it)
          // Household name is already stored in user_metadata during signUp
          console.log('[AuthService] Returning response without household (will be created after email confirmation)');
          return of({
            userId: data.user.id,
            email: data.user.email!,
            accessToken: '', // No session yet
            tokenType: 'Bearer',
            expiresIn: 0,
            refreshToken: '', // No session yet
            defaultHouseholdId: '', // Will be created after email confirmation
            defaultHouseholdName: request.householdName, // Store name for later
            requiresEmailConfirmation: true
          } as RegisterResponse);
        }

        // Normal registration with session - create household now
        console.log('[AuthService] Creating household for user with session');
        return this.createHousehold$(request.householdName, data.user.id).pipe(
          map(household => {
            console.log('[AuthService] Household created:', household);
            return {
              userId: data.user.id,
              email: data.user.email!,
              accessToken: data.session.access_token,
              tokenType: 'Bearer',
              expiresIn: data.session.expires_in ?? 3600,
              refreshToken: data.session.refresh_token,
              defaultHouseholdId: household.id,
              defaultHouseholdName: household.name,
              requiresEmailConfirmation: false
            } as RegisterResponse;
          }),
          catchError(householdError => {
            console.error('[AuthService] Error creating household:', householdError);
            // Even if household creation fails, return success for user creation
            return of({
              userId: data.user.id,
              email: data.user.email!,
              accessToken: data.session.access_token,
              tokenType: 'Bearer',
              expiresIn: data.session.expires_in ?? 3600,
              refreshToken: data.session.refresh_token,
              defaultHouseholdId: '', // Household creation failed
              defaultHouseholdName: request.householdName,
              requiresEmailConfirmation: false
            } as RegisterResponse);
          })
        );
      }),
      catchError(err => {
        console.error('[AuthService] Registration error:', err);
        return throwError(() => err);
      })
    );
  }

  private createHousehold$(name: string, userId: string): Observable<{ id: string; name: string }> {
    console.log('[AuthService] createHousehold$ called:', { name, userId });
    return this.supabase.whenReady$().pipe(
      switchMap(client => {
        // Verify we have a session and get the actual session user ID (matches auth.uid())
        return from(client.auth.getSession()).pipe(
          switchMap(({ data: session }) => {
            if (!session?.session) {
              console.error('[AuthService] No active session for household creation');
              return throwError(() => new Error('No active session. Please sign in again.'));
            }
            
            // Use session user ID to ensure it matches auth.uid() in RLS policy
            const sessionUserId = session.session.user.id;
            console.log('[AuthService] Session user ID:', sessionUserId, 'Requested user ID:', userId);
            
            // Insert household using session user ID
            console.log('[AuthService] Inserting household');
            return from(
              client
                .from('households')
                .insert({ 
                  name, 
                  created_by: sessionUserId, 
                  updated_by: sessionUserId 
                })
                .select()
                .single()
            ).pipe(
              switchMap(({ data: household, error }: any) => {
                console.log('[AuthService] Household insert result:', { hasHousehold: !!household, error });
                if (error) {
                  console.error('[AuthService] Household insert error:', error);
                  return throwError(() => new Error(`Failed to create household: ${error.message || error}`));
                }
                if (!household) {
                  console.error('[AuthService] No household data returned');
                  return throwError(() => new Error('Failed to create household: No data returned'));
                }

                // Add user as admin member
                console.log('[AuthService] Adding user to household_members');
                return from(
                  client
                    .from('household_members')
                    .insert({
                      household_id: household.id,
                      user_id: sessionUserId,
                      role: 'Admin',
                      is_active: true,
                      joined_at: new Date().toISOString(),
                      created_by: sessionUserId,
                      updated_by: sessionUserId
                    })
                ).pipe(
                  map(() => {
                    console.log('[AuthService] Household member added successfully');
                    return { id: household.id, name: household.name };
                  }),
                  catchError(memberError => {
                    console.error('[AuthService] Error adding household member:', memberError);
                    // Return household even if member insert fails (household was created)
                    return of({ id: household.id, name: household.name });
                  })
                );
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] createHousehold$ error:', error);
        return throwError(() => error);
      })
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
}