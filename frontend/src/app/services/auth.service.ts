// src/app/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, from, throwError, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

// ──────────────────────────────────────────────────────────────
//  Interfaces (must be exported or defined here)
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
//  AuthService
// ──────────────────────────────────────────────────────────────
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private loadingUserData = false;
  private readonly USER_KEY = 'butler_user';

  constructor() {
    // First, check localStorage immediately (synchronous) to restore user quickly
    // This prevents the "stuck" state on hard refresh
    const storedUser = this.getUserFromStorage();
    if (storedUser && storedUser.userId) {
      console.log('✅ [AuthService] Found stored user on init, restoring immediately:', storedUser.userId);
      this.currentUserSubject.next(storedUser);
    }
    
    // Then initialize Supabase in background to check session
    this.supabaseService.ensureInitialized().then(() => {
      this.setupAuthStateListener();
      this.checkInitialSession();
    }).catch(err => {
      console.warn('⚠️ [AuthService] Supabase failed to initialize on startup (non-blocking):', err);
      // Don't clear user if Supabase fails - keep stored user
    });
  }

  private setupAuthStateListener(): void {
    this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await this.loadUserProfile();
        }
      } else if (event === 'SIGNED_OUT') {
        // 'USER_DELETED' is rare and not always sent — SIGNED_OUT is sufficient
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }

  private async checkInitialSession(): Promise<void> {
    try {
      // Supabase automatically restores session from localStorage
      // We just need to check if a session exists and load user data
      const { data, error } = await this.supabaseService.client.auth.getSession();
      
      if (error) {
        console.warn('⚠️ [AuthService] Error getting session:', error);
        return;
      }
      
      if (data.session?.user) {
        console.log('✅ [AuthService] Session found, loading user profile...');
        await this.loadUserProfile();
      } else {
        console.log('ℹ️ [AuthService] No active session found');
        this.currentUserSubject.next(null);
      }
    } catch (err) {
      console.warn('⚠️ [AuthService] Failed to restore session on startup:', err);
      // Don't clear user on error - let Supabase handle it
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (this.loadingUserData) return;
    this.loadingUserData = true;

    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user) {
        this.currentUserSubject.next(null);
        return;
      }

      const metadata = user.user_metadata || {};
      const households = await this.loadHouseholdsWithTimeout(user.id);

      const currentUser: CurrentUser = {
        userId: user.id,
        email: user.email || '',
        firstName: metadata['first_name'],
        lastName: metadata['last_name'],
        households
      };

      this.currentUserSubject.next(currentUser);
      // Note: We don't manually store user data - Supabase handles session persistence
      // The session token in Supabase's localStorage is what matters for authentication
    } catch (err) {
      console.error('Failed to load user profile:', err);
      this.currentUserSubject.next(null);
    } finally {
      this.loadingUserData = false;
    }
  }

  /**
   * Get user from localStorage (synchronous)
   */
  private getUserFromStorage(): CurrentUser | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        return JSON.parse(stored) as CurrentUser;
      }
    } catch (error) {
      console.warn('Error reading user from localStorage:', error);
    }
    return null;
  }

  /**
   * Store user in localStorage
   */
  private storeUserData(user: CurrentUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Error storing user in localStorage:', error);
    }
  }

  private async loadHouseholdsWithTimeout(userId: string): Promise<HouseholdMembership[]> {
    const loadPromise = this.loadHouseholds(userId);
    const timeoutPromise = new Promise<HouseholdMembership[]>((resolve) =>
      setTimeout(() => resolve([]), 3000)
    );
    return Promise.race([loadPromise, timeoutPromise]);
  }

  private async loadHouseholds(userId: string): Promise<HouseholdMembership[]> {
    try {
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

      if (error) throw error;

      return (data || []).map((row: any) => ({
        householdId: row.household_id,
        householdName: row.households?.name || 'Unknown Household',
        role: row.role || 'Member',
        joinedAt: row.joined_at
      }));
    } catch (err: any) {
      if (err.message?.includes('relation') || err.code === 'PGRST116') {
        console.warn('household_members table not found — likely first-time setup');
      } else {
        console.error('Error loading households:', err);
      }
      return [];
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────────────────

  login(request: LoginRequest): Observable<LoginResponse> {
    return from(this.loginInternal(request));
  }

  private async loginInternal(request: LoginRequest): Promise<LoginResponse> {
    await this.supabaseService.ensureInitialized();

    const loginPromise = this.supabaseService.client.auth.signInWithPassword({
      email: request.email,
      password: request.password
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Login timed out after 30s')), 30000)
    );

    const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

    if (error) {
      let message = 'Login failed. Please try again.';
      if (error.message.includes('Invalid login credentials')) message = 'Invalid email or password.';
      if (error.message.includes('fetch')) message = 'No internet connection.';
      throw new Error(message);
    }

    if (!data.session || !data.user) throw new Error('Login succeeded but no session');

    return {
      userId: data.user.id,
      email: data.user.email!,
      accessToken: data.session.access_token,
      tokenType: 'Bearer',
      expiresIn: data.session.expires_in ?? 3600,
      refreshToken: data.session.refresh_token,
      households: [] // populated via listener
    };
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return from(this.registerInternal(request)).pipe(
      catchError(err => throwError(() => err))
    );
  }

  private async registerInternal(request: RegisterRequest): Promise<RegisterResponse> {
    await this.supabaseService.ensureInitialized();

    const { data, error } = await this.supabaseService.client.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          first_name: request.firstName,
          last_name: request.lastName
        }
      }
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error('Registration failed');

    const household = await this.createHousehold(request.householdName, data.user.id);

    return {
      userId: data.user.id,
      email: data.user.email!,
      accessToken: data.session.access_token,
      tokenType: 'Bearer',
      expiresIn: data.session.expires_in ?? 3600,
      refreshToken: data.session.refresh_token,
      defaultHouseholdId: household.id,
      defaultHouseholdName: household.name
    };
  }

  private async createHousehold(name: string, userId: string) {
    const { data: household, error } = await this.supabaseService.client
      .from('households')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error || !household) throw new Error('Failed to create household');

    await this.supabaseService.client
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: userId,
        role: 'Admin',
        is_active: true,
        joined_at: new Date().toISOString()
      });

    return { id: household.id, name: household.name };
  }

  async logout(): Promise<void> {
    // Supabase's signOut() automatically clears session from localStorage
    await this.supabaseService.client.auth.signOut();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await this.supabaseService.client.auth.getSession();
      return !!data.session;
    } catch {
      return false;
    }
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getDefaultHouseholdId(): string | null {
    return this.getCurrentUser()?.households?.[0]?.householdId || null;
  }

  // ──────────────────────────────────────────────────────────────
  // Optional: Keep these if other parts of your app use them
  // ──────────────────────────────────────────────────────────────

  /** For dev only – remove in production */
  backdoorLogin?(request: LoginRequest): Observable<LoginResponse>;

  /** For auth interceptor – Supabase handles tokens automatically */
  async getToken(): Promise<string | null> {
    const { data } = await this.supabaseService.client.auth.getSession();
    return data.session?.access_token || null;
  }

  /** For profile update – optional */
  updateCurrentUser(user: CurrentUser): void {
    this.currentUserSubject.next(user);
  }
}