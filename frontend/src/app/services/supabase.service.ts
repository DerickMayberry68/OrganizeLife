import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, throwError, timer, race } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../config/environment';

/**
 * Supabase Service
 * Provides a centralized Supabase client instance for use by domain services
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isInitializing = false;
  private initPromise: Promise<SupabaseClient> | null = null;

  constructor() {
    // Don't initialize Supabase in constructor - make it lazy
    console.log('[SupabaseService] Service created (lazy initialization)');
  }

  /**
   * Initialize Supabase client (lazy initialization)
   * Only initializes when first accessed
   */
  private async initialize(): Promise<SupabaseClient> {
    // If already initialized, return existing client
    if (this.supabase) {
      return this.supabase;
    }

    // If currently initializing, wait for existing promise
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.isInitializing = true;
    this.initPromise = this._doInitialize();
    
    try {
      const client = await this.initPromise;
      this.isInitializing = false;
      return client;
    } catch (error) {
      this.isInitializing = false;
      this.initPromise = null;
      throw error;
    }
  }

  private async _doInitialize(): Promise<SupabaseClient> {
    const supabaseUrl = environment.supabase.url;
    const supabaseAnonKey = environment.supabase.anonKey;

    console.log('[SupabaseService] Initializing...', {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
      hasAnonKey: !!supabaseAnonKey,
      location: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString()
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      const errorMsg = 'Supabase configuration is missing. URL or AnonKey is not set.';
      console.error('[SupabaseService]', errorMsg, {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey
      });
      throw new Error(errorMsg);
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          // Add flow type to ensure password flow
          flowType: 'pkce'
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'angular-client',
            'apikey': supabaseAnonKey
          },
          // Add fetch timeout
          fetch: (url, options = {}) => {
            console.log('[SupabaseService] Fetch request:', url, options.method || 'GET');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.error('[SupabaseService] Fetch timeout after 30s:', url);
              controller.abort();
            }, 30000);
            
            return fetch(url, {
              ...options,
              signal: controller.signal
            }).then(response => {
              clearTimeout(timeoutId);
              console.log('[SupabaseService] Fetch response:', url, response.status);
              return response;
            }).catch(error => {
              clearTimeout(timeoutId);
              console.error('[SupabaseService] Fetch error:', url, error);
              throw error;
            });
          }
        },
        realtime: {
          timeout: 20000
        }
      });
      
      console.log('[SupabaseService] ✓ Client initialized successfully', {
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      });

      // Test connection immediately (fire and forget)
      Promise.resolve().then(() => {
        this.testConnection().catch(error => {
          console.warn('[SupabaseService] Initial connection test failed (non-blocking):', error);
        });
      });

      return this.supabase;
    } catch (error) {
      console.error('[SupabaseService] ✗ Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Test Supabase connection (non-blocking)
   * Uses a simple health check that won't fail if tables don't exist
   */
  private async testConnection(): Promise<void> {
    try {
      // Simple connection test - check auth endpoint
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 10000)
      );
      
      const testPromise = fetch(`${environment.supabase.url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': environment.supabase.anonKey
        }
      }).then(response => {
        if (response.ok || response.status === 404) { // 404 is ok for HEAD on root
          console.log('[SupabaseService] ✓ Connection test successful - Supabase is reachable');
          return true;
        } else {
          console.warn('[SupabaseService] Connection test returned unexpected status:', response.status);
          return false;
        }
      });

      await Promise.race([testPromise, timeoutPromise]);
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        console.error('[SupabaseService] ✗ Connection test TIMEOUT - Supabase may be unreachable from this location');
      } else if (error.message?.includes('CORS')) {
        console.error('[SupabaseService] ✗ CORS error - Check Supabase CORS settings for:', window.location.origin);
      } else if (error.message?.includes('Failed to fetch')) {
        console.error('[SupabaseService] ✗ Network error - Cannot reach Supabase URL');
      } else {
        console.warn('[SupabaseService] Connection test failed:', error);
      }
    }
  }

  /**
   * Get the Supabase client instance (lazy initialization)
   * Initializes Supabase on first access
   */
  get client(): SupabaseClient {
    if (!this.supabase) {
      // Synchronous access - initialize immediately but don't block
      // This will throw if called before async initialization completes
      // For async access, use ensureInitialized() first
      throw new Error('Supabase client not initialized. Call ensureInitialized() first or use async methods.');
    }
    return this.supabase;
  }

  /**
   * Ensure Supabase is initialized (async)
   * Call this before accessing client in async contexts
   */
  async ensureInitialized(): Promise<SupabaseClient> {
    return await this.initialize();
  }

  /**
   * Get the current authenticated user (returns Observable that emits null if error or no user)
   * Uses RxJS for consistency with Angular patterns
   * Note: Supabase must be initialized before calling this
   */
  getCurrentUser(): Observable<any> {
    if (!this.supabase) {
      console.warn('getCurrentUser called before Supabase initialization');
      return from([null]);
    }
    return from(this.supabase.auth.getUser()).pipe(
      map(({ data, error }) => {
        if (error) {
          console.warn('Error getting user:', error);
          return null;
        }
        return data.user;
      }),
      catchError((error) => {
        console.warn('Exception getting user:', error);
        return from([null]); // Return null as Observable value
      })
    );
  }

  /**
   * Get the current session (returns Observable that emits null if error or no session)
   * Includes timeout to prevent hanging
   * Uses RxJS for consistency with Angular patterns
   * Note: Supabase must be initialized before calling this
   */
  getSession(): Observable<any> {
    if (!this.supabase) {
      console.warn('getSession called before Supabase initialization');
      return from([null]);
    }
    return from(this.supabase.auth.getSession()).pipe(
      timeout({
        first: 5000, // 5 second timeout
        with: () => {
          console.warn('getSession timed out after 5s - session may still be restoring');
          return from([null]); // Return null on timeout
        }
      }),
      map((response) => {
        if (!response) {
          return null;
        }
        if (response.error) {
          console.warn('Error getting session:', response.error);
          return null;
        }
        return response.data?.session || null;
      }),
      catchError((error: any) => {
        if (error?.message?.includes('timeout')) {
          console.warn('getSession timed out after 5s - session may still be restoring');
        } else {
          console.warn('Exception getting session:', error);
        }
        return from([null]); // Return null as Observable value
      })
    );
  }
}

