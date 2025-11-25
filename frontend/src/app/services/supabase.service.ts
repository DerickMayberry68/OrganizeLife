// src/app/services/supabase.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, throwError, of, filter, take, map, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // 1. The one source of truth — starts as null
  private readonly client = signal<SupabaseClient | null>(null);

  // 2. Public reactive signals
  readonly client$ = this.client.asReadonly();
  readonly isReady = computed(() => this.client() !== null);
  readonly isError = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // 3. Use BehaviorSubject to avoid toObservable injection context issues
  private readonly readySubject = new BehaviorSubject<SupabaseClient | null>(null);

  constructor() {
    // Start initialization immediately — fully reactive
    this.initializeClient();
  }

  private initializeClient(): void {
    const { url, anonKey } = environment.supabase;

    if (!url || !anonKey) {
      this.error.set('Supabase URL or anon key missing');
      this.isError.set(true);
      return;
    }

    console.log('Initializing Supabase client...');

    // Create client synchronously - this is immediate, no promise
    const supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
        flowType: 'pkce'
      },
      global: {
        fetch: this.createTimeoutFetch()
      }
    });

    // Set client immediately - Supabase client is ready synchronously
    // The connection test is done via observable pattern
    this.client.set(supabaseClient);
    
    // Update ready subject when client is set
    this.readySubject.next(supabaseClient);

    // Test connection — convert promise to observable pattern for error detection
    from(supabaseClient.auth.getSession())
      .pipe(
        map(() => {
          console.log('Supabase client ready');
          this.isError.set(false);
          this.error.set(null);
        }),
        catchError(err => {
          console.warn('Supabase connection test failed (continuing offline):', err.message);
          // Client is still set and usable for cached queries
          this.error.set(err.message);
          this.isError.set(true);
          return of(null); // Swallow error - client is still usable
        })
      )
      .subscribe();
  }

  // Internal fetch wrapper with timeout (Promise is required by fetch API signature)
  // This is an implementation detail, not part of our public API
  private createTimeoutFetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
    return (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 30000);

      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const requestInit: RequestInit = { ...init, signal: controller.signal };

      return fetch(url, requestInit).finally(() => clearTimeout(id));
    };
  }

  // Observable-based readiness check (replaces whenReady Promise and getClient)
  // Uses BehaviorSubject to avoid toObservable injection context issues
  whenReady$(): Observable<SupabaseClient> {
    // If client is already ready, return it immediately
    const currentClient = this.client();
    if (currentClient) {
      // Update subject if not already set
      if (!this.readySubject.value) {
        this.readySubject.next(currentClient);
      }
      return of(currentClient);
    }
    
    // Otherwise, wait for the subject to emit
    return this.readySubject.pipe(
      filter((client): client is SupabaseClient => client !== null),
      take(1)
    );
  }

  // Deprecated: Use whenReady$() or client$() signal instead
  // Kept for backward compatibility only
  getClient(): SupabaseClient {
    const client = this.client();
    if (!client) {
      throw new Error('Supabase client not ready yet. Use whenReady$() or client$() signal instead.');
    }
    return client;
  }
}