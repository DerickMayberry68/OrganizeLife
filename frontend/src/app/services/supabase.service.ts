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
  private readonly supabase: SupabaseClient;

  constructor() {
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
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'angular-client',
            'apikey': supabaseAnonKey
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
      // Using Promise.resolve().then() instead of setTimeout for better zoneless compatibility
      Promise.resolve().then(() => {
        this.testConnection().catch(error => {
          console.warn('[SupabaseService] Initial connection test failed (non-blocking):', error);
        });
      });
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
   * Get the Supabase client instance
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the current authenticated user (returns Observable that emits null if error or no user)
   * Uses RxJS for consistency with Angular patterns
   */
  getCurrentUser(): Observable<any> {
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
   */
  getSession(): Observable<any> {
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

