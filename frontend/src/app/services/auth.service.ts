import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, from, throwError, firstValueFrom, race, timer } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

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

export interface CurrentUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  households: HouseholdMembership[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly USER_KEY = 'butler_user';
  
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Flag to prevent multiple simultaneous loadUserData calls
  private isLoadingUserData = false;
  private loadUserDataPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize Supabase in constructor - wait until login/register is called
    // This allows the login screen to render immediately without blocking
    
    // Check if we have a stored user - restore it immediately for faster UI
    const storedUser = this.getUserFromStorage();
    if (storedUser && storedUser.userId) {
      console.log('Found stored user on init, restoring:', storedUser.userId);
      this.currentUserSubject.next(storedUser);
      
      // Initialize Supabase in background to check session (non-blocking)
      // This happens asynchronously and won't block the UI
      Promise.resolve().then(async () => {
        try {
          await this.supabaseService.ensureInitialized();
          
          // Set up auth state listener after initialization
          this.supabaseService.client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
              this.logout();
            } else if (event === 'SIGNED_IN' && session) {
              // Debounce: only load if not already loading
              if (!this.isLoadingUserData) {
                Promise.resolve().then(() => {
                  this.loadUserData().catch(error => {
                    console.error('Error loading user data on auth state change:', error);
                  });
                });
              }
            }
          });

          // Load user data if session exists (non-blocking)
          if (!this.isLoadingUserData) {
            Promise.race([
              this.loadUserData(),
              new Promise<void>((resolve) => {
                setTimeout(() => {
                  console.warn('loadUserData timed out after 10s - continuing anyway');
                  resolve();
                }, 10000);
              })
            ]).catch(error => {
              console.error('Error loading user data on init:', error);
            });
          }
        } catch (error) {
          console.warn('Failed to initialize Supabase on startup (non-blocking):', error);
        }
      });
    }
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return from(
      (async () => {
        // Initialize Supabase before using it
        await this.supabaseService.ensureInitialized();
        this._setupAuthStateListener();
        
        const response = await this.supabaseService.client.auth.signUp({
          email: request.email,
          password: request.password,
          options: {
            data: {
              first_name: request.firstName,
              last_name: request.lastName
            }
          }
        });

        if (response.error) {
          throw response.error;
        }

        if (!response.data.user) {
          throw new Error('Registration failed: No user returned');
        }

        const userId = response.data.user.id;
        const accessToken = response.data.session?.access_token || '';
        const refreshToken = response.data.session?.refresh_token || '';

        // Create household
        const household = await this.createHousehold(request.householdName, userId);

        // Load user data
        await this.loadUserData();

        return {
          userId,
          email: request.email,
          accessToken,
          tokenType: 'Bearer',
          expiresIn: response.data.session?.expires_in || 3600,
          refreshToken,
          defaultHouseholdId: household.id,
          defaultHouseholdName: household.name
        } as RegisterResponse;
      })()
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    console.log('🔵 [AuthService] Login method called, creating observable...');
    
    return new Observable<LoginResponse>(observer => {
      (async () => {
        try {
          console.log('🔵 [AuthService] Starting login process...');
          
          // Initialize Supabase before using it
          console.log('🔵 [AuthService] Ensuring Supabase is initialized...');
          await this.supabaseService.ensureInitialized();
          console.log('🔵 [AuthService] Supabase initialized, setting up auth state listener...');
          this._setupAuthStateListener();
          
          console.log('🔵 [AuthService] Calling signInWithPassword...');
          
          // Add timeout to prevent hanging
          const loginPromise = this.supabaseService.client.auth.signInWithPassword({
            email: request.email,
            password: request.password
          });
          
          console.log('🔵 [AuthService] Login promise created, setting up timeout...');
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              console.error('🔴 [AuthService] Login timeout - request took longer than 30 seconds');
              reject(new Error('Login request timed out after 30 seconds. Please check your connection and try again.'));
            }, 30000);
          });
          
          console.log('🔵 [AuthService] Waiting for login response (with 30s timeout)...');
          
          const response = await Promise.race([loginPromise, timeoutPromise]) as any;
          console.log('✅ [AuthService] Login response received:', response?.error ? 'ERROR' : 'SUCCESS');

          if (response.error) {
            console.error('🔴 [AuthService] Login error:', response.error);
            observer.error(response.error);
            return;
          }

          if (!response.data?.user || !response.data?.session) {
            console.error('🔴 [AuthService] Login failed: No user or session returned', response);
            observer.error(new Error('Login failed: No user or session returned'));
            return;
          }

          console.log('✅ [AuthService] Login successful, processing response...');
          const userId = response.data.user.id;
          const accessToken = response.data.session.access_token;
          const refreshToken = response.data.session.refresh_token;

          // Store basic user info immediately so authentication checks work
          const userMetadata = response.data.user.user_metadata || {};
          const currentUser: CurrentUser = {
            userId,
            email: response.data.user.email || request.email,
            firstName: userMetadata['first_name'],
            lastName: userMetadata['last_name'],
            households: [] // Will be loaded in background
          };
          
          console.log('✅ [AuthService] Storing user data...');
          // Store user immediately so authentication checks work
          this.currentUserSubject.next(currentUser);
          this.storeUserData(currentUser);
          
          console.log('✅ [AuthService] User stored immediately after login:', currentUser.userId);

          // Load user data including households in background (non-blocking)
          this.loadUserData().catch(error => {
            console.warn('⚠️ [AuthService] Error loading user data after login (non-blocking):', error);
            // Continue - user is still authenticated even if user data fails
          });
          
          const loginResponse: LoginResponse = {
            userId,
            email: request.email,
            accessToken,
            tokenType: 'Bearer',
            expiresIn: response.data.session.expires_in || 3600,
            refreshToken,
            households: [] // Will be populated when loadUserData completes
          };
          
          console.log('✅ [AuthService] Login complete, emitting response');
          observer.next(loginResponse);
          observer.complete();
        } catch (error: any) {
          console.error('🔴 [AuthService] Login error caught:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Login failed. Please try again.';
          if (error?.message?.includes('Failed to fetch') || 
              error?.message?.includes('ERR_NAME_NOT_RESOLVED') ||
              error?.name === 'AuthRetryableFetchError') {
            errorMessage = 'Cannot connect to Supabase. Please verify your internet connection and that your Supabase project is active.';
          } else if (error?.message?.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (error?.message?.includes('timeout')) {
            errorMessage = 'Login request timed out. Please check your connection and try again.';
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          console.error('🔴 [AuthService] Emitting error:', errorMessage);
          observer.error(new Error(errorMessage));
        }
      })();
    });
  }

  /**
   * Backdoor login for development - bypasses authentication
   */
  backdoorLogin(request: LoginRequest): Observable<LoginResponse> {
    // For development, you might still want to support this
    // But with Supabase, you'd need to create a test user
    console.warn('Backdoor login not supported with Supabase. Use test credentials instead.');
    return this.login(request);
  }

  /**
   * Set up auth state listener (only once)
   */
  private authStateListenerSetup = false;
  private _setupAuthStateListener(): void {
    if (this.authStateListenerSetup) {
      return; // Already set up
    }
    this.authStateListenerSetup = true;
    
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        this.logout();
      } else if (event === 'SIGNED_IN' && session) {
        // Debounce: only load if not already loading
        if (!this.isLoadingUserData) {
          Promise.resolve().then(() => {
            this.loadUserData().catch(error => {
              console.error('Error loading user data on auth state change:', error);
            });
          });
        }
      }
    });
  }

  /**
   * Logout and clear storage
   */
  logout(): void {
    // Only sign out if Supabase is initialized
    if (this.supabaseService) {
      this.supabaseService.ensureInitialized().then(() => {
        this.supabaseService.client.auth.signOut();
      }).catch(() => {
        // If Supabase not initialized, just clear local storage
      });
    }
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get the access token from Supabase session
   */
  async getToken(): Promise<string | null> {
    try {
      const session = await firstValueFrom(this.supabaseService.getSession());
      return session?.access_token || null;
    } catch {
      return null;
    }
  }

  /**
   * Get the refresh token from Supabase session
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const session = await firstValueFrom(this.supabaseService.getSession());
      return session?.refresh_token || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('isAuthenticated: Starting check...');
      console.log('isAuthenticated: Checking localStorage key:', this.USER_KEY);
      
      // First check localStorage directly (fastest, no async needed)
      const storedUserJson = localStorage.getItem(this.USER_KEY);
      console.log('isAuthenticated: localStorage.getItem result:', storedUserJson ? 'found' : 'not found');
      
      if (storedUserJson) {
        try {
          const storedUser = JSON.parse(storedUserJson) as CurrentUser;
          console.log('isAuthenticated: Parsed user:', storedUser);
          if (storedUser && storedUser.userId) {
            console.log('isAuthenticated: ✅ TRUE (stored user found in localStorage:', storedUser.userId, ')');
            // Also update the subject to keep it in sync
            this.currentUserSubject.next(storedUser);
            return true;
          } else {
            console.warn('isAuthenticated: Stored user found but no userId:', storedUser);
          }
        } catch (e) {
          console.warn('isAuthenticated: Error parsing stored user:', e, 'Raw JSON:', storedUserJson);
        }
      }
      
      // Then check the subject (in-memory check)
      const currentUser = this.getCurrentUser();
      console.log('isAuthenticated: getCurrentUser() result:', currentUser);
      if (currentUser && currentUser.userId) {
        console.log('isAuthenticated: ✅ TRUE (current user found:', currentUser.userId, ')');
        return true;
      }
      
      // Finally check session (async, with timeout to prevent hanging)
      // Only check session if we have a stored user (don't initialize Supabase unnecessarily)
      const hasStoredUser = !!localStorage.getItem(this.USER_KEY);
      if (hasStoredUser) {
        console.log('isAuthenticated: Checking session (async)...');
        try {
          // Ensure Supabase is initialized before checking session
          await this.supabaseService.ensureInitialized();
          
          const session = await firstValueFrom(
            race(
              this.supabaseService.getSession(),
              timer(2000).pipe(
                map(() => {
                  console.warn('isAuthenticated: Session check timed out after 2s');
                  return null;
                })
              )
            )
          );
          if (session && session.access_token) {
            console.log('isAuthenticated: ✅ TRUE (session found)');
            return true;
          } else {
            console.log('isAuthenticated: No valid session found');
          }
        } catch (sessionError) {
          console.warn('isAuthenticated: Session check error:', sessionError);
          // Continue - will return false below
        }
      } else {
        console.log('isAuthenticated: No stored user, skipping session check (Supabase not initialized)');
      }
      
      console.log('isAuthenticated: ❌ FALSE (no session or user)');
      return false;
    } catch (error) {
      console.warn('isAuthenticated: Error checking authentication:', error);
      // On error, check stored user as fallback
      try {
        const storedUserJson = localStorage.getItem(this.USER_KEY);
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson) as CurrentUser;
          if (storedUser && storedUser.userId) {
            console.log('isAuthenticated: ✅ TRUE (stored user fallback)');
            return true;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user's default household ID
   */
  getDefaultHouseholdId(): string | null {
    const user = this.getCurrentUser();
    return user?.households?.[0]?.householdId || null;
  }

  /**
   * Load user data from Supabase
   * Includes timeout protection to prevent hanging
   * Prevents multiple simultaneous calls
   */
  private async loadUserData(): Promise<void> {
    // If already loading, return the existing promise
    if (this.isLoadingUserData && this.loadUserDataPromise) {
      console.log('loadUserData already in progress, reusing existing promise');
      return this.loadUserDataPromise;
    }
    
    // Mark as loading and create promise
    this.isLoadingUserData = true;
    this.loadUserDataPromise = this._loadUserDataInternal().finally(() => {
      this.isLoadingUserData = false;
      this.loadUserDataPromise = null;
    });
    
    return this.loadUserDataPromise;
  }
  
  /**
   * Internal method that actually loads user data
   */
  private async _loadUserDataInternal(): Promise<void> {
    try {
      // Ensure Supabase is initialized before loading user data
      await this.supabaseService.ensureInitialized();
      
      console.log('Loading user data...');
      
      // First check if we have a stored user in localStorage
      // If we do, keep it even if session isn't ready yet (session might still be restoring)
      const storedUser = this.getUserFromStorage();
      if (storedUser && storedUser.userId) {
        console.log('Found stored user, keeping it while checking session:', storedUser.userId);
        this.currentUserSubject.next(storedUser);
      }
      
      // Check session with shorter timeout (2s instead of 5s) for faster failure
      // Use RxJS race operator for timeout
      let session: any = null;
      try {
        session = await firstValueFrom(
          race(
            this.supabaseService.getSession(),
            timer(2000).pipe(
              map(() => {
                console.warn('getSession in loadUserData timed out after 2s');
                return null;
              })
            )
          )
        );
      } catch (error) {
        console.warn('Error getting session in loadUserData:', error);
        session = null;
      }
      
      if (!session) {
        console.log('No session found');
        // Only clear user if we don't have a stored user
        if (!storedUser || !storedUser.userId) {
          console.log('No stored user either, clearing user data');
          this.currentUserSubject.next(null);
        } else {
          console.log('Keeping stored user even though session not found (session may still be restoring)');
        }
        return;
      }

      const user = await firstValueFrom(this.supabaseService.getCurrentUser());
      if (!user) {
        console.log('No user found, skipping user data load');
        this.currentUserSubject.next(null);
        return;
      }

      console.log('User found:', user.id, user.email);

      // Get user metadata
      const userMetadata = user.user_metadata || {};
      const firstName = userMetadata['first_name'];
      const lastName = userMetadata['last_name'];

      // Load households (with shorter timeout to prevent hanging)
      console.log('Loading households...');
      const householdsPromise = this.loadHouseholds(user.id);
      const timeoutPromise = new Promise<HouseholdMembership[]>((resolve) => {
        setTimeout(() => {
          console.warn('Household loading timed out after 2s, continuing with empty array');
          resolve([]);
        }, 2000);
      });
      
      const households = await Promise.race([householdsPromise, timeoutPromise]);

      const currentUser: CurrentUser = {
        userId: user.id,
        email: user.email || '',
        firstName,
        lastName,
        households
      };

      this.currentUserSubject.next(currentUser);
      this.storeUserData(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't throw - just set user to null
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Load households for the current user
   */
  private async loadHouseholds(userId: string): Promise<HouseholdMembership[]> {
    try {
      // Ensure Supabase is initialized
      await this.supabaseService.ensureInitialized();
      
      console.log('Loading households for user:', userId);
      
      const { data, error } = await this.supabaseService.client
        .from('household_members')
        .select(`
          household_id,
          role,
          joined_at,
          households (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.warn('Error loading households:', error);
        // Check if it's a table not found error
        if (error.message?.includes('relation') || error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.warn('household_members table may not exist yet. Database might need to be set up.');
        }
        return [];
      }

      const households = (data || []).map((hm: any) => ({
        householdId: hm.household_id,
        householdName: hm.households?.name || 'Unknown',
        role: hm.role || 'Member',
        joinedAt: hm.joined_at || new Date().toISOString()
      }));
      
      console.log('Loaded households:', households.length, households);
      
      // If no households, this is expected for a new user
      if (households.length === 0) {
        console.log('No households found for user. This is normal for a new account.');
      }
      
      return households;
    } catch (error: any) {
      console.warn('Exception loading households:', error);
      // Check if it's a connection/table error
      if (error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('Database table may not exist. Please verify your Supabase database is set up correctly.');
      }
      return [];
    }
  }

  /**
   * Create a new household
   */
  private async createHousehold(name: string, userId: string): Promise<{ id: string; name: string }> {
    // Ensure Supabase is initialized
    await this.supabaseService.ensureInitialized();
    
    // Insert household
    const { data: household, error: householdError } = await this.supabaseService.client
      .from('households')
      .insert({
        name,
        created_by: userId
      })
      .select()
      .single();

    if (householdError || !household) {
      throw new Error(`Failed to create household: ${householdError?.message || 'Unknown error'}`);
    }

    // Add user as admin member
    const { error: memberError } = await this.supabaseService.client
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: userId,
        role: 'Admin',
        is_active: true,
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      throw new Error(`Failed to add household member: ${memberError.message}`);
    }

    return {
      id: household.id,
      name: household.name
    };
  }

  /**
   * Store user data in localStorage
   */
  private storeUserData(user: CurrentUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): CurrentUser | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get authorization header (for compatibility with old code)
   * Note: With Supabase, authentication is handled automatically
   * This is kept for backward compatibility but may not be needed
   */
  getAuthHeaders(): any {
    // With Supabase, auth is handled automatically via the client
    // This method is kept for compatibility but tokens are managed by Supabase
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Update current user data in localStorage
   */
  updateCurrentUser(updatedUser: CurrentUser): void {
    this.storeUserData(updatedUser);
  }
}
