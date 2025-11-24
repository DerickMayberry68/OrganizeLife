// src/app/services/auth.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
//  AuthService – Signals + Full Compatibility
// ──────────────────────────────────────────────────────────────
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  // ───── Core Signal (zoneless-native) ─────
  private readonly currentUser = signal<CurrentUser | null>(null);

  // Public readonly signals
  readonly currentUser$ = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest';
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return user.email.split('@')[0];
  });

  private loadingUserData = false;

  constructor() {
    this.supabase.ensureInitialized().then(() => {
      this.setupAuthStateListener();
      this.checkInitialSession();
    });
  }

  private setupAuthStateListener(): void {
    this.supabase.client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) await this.loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }

  private async checkInitialSession(): Promise<void> {
    try {
      const { data } = await this.supabase.client.auth.getSession();
      if (data.session?.user) {
        await this.loadUserProfile();
      } else {
        this.currentUser.set(null);
      }
    } catch {
      this.currentUser.set(null);
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (this.loadingUserData) return;
    this.loadingUserData = true;

    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        this.currentUser.set(null);
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

      this.currentUser.set(currentUser);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      this.currentUser.set(null);
    } finally {
      this.loadingUserData = false;
    }
  }

  // ───── Household Helpers ─────
  private async loadHouseholdsWithTimeout(userId: string): Promise<HouseholdMembership[]> {
    const loadPromise = this.loadHouseholds(userId);
    const timeoutPromise = new Promise<HouseholdMembership[]>((resolve) =>
      setTimeout(() => resolve([]), 3000)
    );
    return Promise.race([loadPromise, timeoutPromise]);
  }

  private async loadHouseholds(userId: string): Promise<HouseholdMembership[]> {
    try {
      const { data, error } = await this.supabase.client
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
      console.error('Error loading households:', err);
      return [];
    }
  }

  // ───── Public API ─────
  login(request: LoginRequest): Observable<LoginResponse> {
    return from(this.loginInternal(request));
  }

  private async loginInternal(request: LoginRequest): Promise<LoginResponse> {
    await this.supabase.ensureInitialized();
    const { data, error } = await this.supabase.client.auth.signInWithPassword(request);

    if (error) throw new Error(error.message.includes('Invalid') ? 'Invalid email or password' : 'Login failed');
    if (!data.session || !data.user) throw new Error('No session');

    return {
      userId: data.user.id,
      email: data.user.email!,
      accessToken: data.session.access_token,
      tokenType: 'Bearer',
      expiresIn: data.session.expires_in ?? 3600,
      refreshToken: data.session.refresh_token,
      households: []
    };
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return from(this.registerInternal(request)).pipe(catchError(err => throwError(() => err)));
  }

  private async registerInternal(request: RegisterRequest): Promise<RegisterResponse> {
    await this.supabase.ensureInitialized();
    const { data, error } = await this.supabase.client.auth.signUp({
      email: request.email,
      password: request.password,
      options: { data: { first_name: request.firstName, last_name: request.lastName } }
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
    const { data: household, error } = await this.supabase.client
      .from('households')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error || !household) throw new Error('Failed to create household');

    await this.supabase.client
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
    await this.supabase.client.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ───── COMPATIBILITY METHODS (keeps old code working) ─────
  getCurrentUser(): CurrentUser | null {
    return this.currentUser();
  }

  getDefaultHouseholdId(): string | null {
    return this.currentUser()?.households?.[0]?.householdId || null;
  }

  async getToken(): Promise<string | null> {
    const { data } = await this.supabase.client.auth.getSession();
    return data.session?.access_token || null;
  }

  // Keeps profile update / guards working
  updateCurrentUser(user: CurrentUser): void {
    this.currentUser.set(user);
  }

  // Optional backdoor login for dev
  backdoorLogin?(request: LoginRequest): Observable<LoginResponse>;
}