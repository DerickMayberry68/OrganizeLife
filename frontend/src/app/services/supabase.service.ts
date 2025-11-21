import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration is missing. Please set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY environment variables.');
      throw new Error('Supabase configuration is missing');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'angular-client'
          }
        }
      });
      
      console.log('Supabase client initialized with URL:', supabaseUrl);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Get the Supabase client instance
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the current authenticated user (returns null if error or no user)
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) {
        console.warn('Error getting user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.warn('Exception getting user:', error);
      return null;
    }
  }

  /**
   * Get the current session (returns null if error or no session)
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.warn('Error getting session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.warn('Exception getting session:', error);
      return null;
    }
  }
}

