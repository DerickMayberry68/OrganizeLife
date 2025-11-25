import { inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

/**
 * Base Service
 * Provides shared functionality for all domain-specific services using Supabase
 */
export abstract class BaseApiService {
  protected readonly supabaseService = inject(SupabaseService);
  protected readonly toastService = inject(ToastService);
  protected readonly authService = inject(AuthService);
  
  // Keep supabase getter for backwards compatibility but allow null
  
  /**
   * Get the Supabase client instance (reactive signal-based)
   * Returns null if not ready - use client$() signal instead
   */
  protected get supabase(): SupabaseClient | null {
    return this.supabaseService.client$();
  }

  /**
   * Get Supabase client as Observable (waits for ready)
   */
  protected getSupabaseClient$(): Observable<SupabaseClient> {
    return this.supabaseService.whenReady$();
  }

  /**
   * Helper method to update a signal from API response
   */
  protected updateSignalFromResponse<T>(
    signal: WritableSignal<T[]>,
    observable: Observable<T[]>
  ): Observable<T[]> {
    return observable.pipe(
      tap(data => signal.set(data)),
      catchError(error => {
        console.error('API Error:', error);
        return of([]);
      })
    );
  }

  /**
   * Helper method to add item to signal array
   */
  protected addToSignal<T extends { id: string }>(
    signal: WritableSignal<T[]>,
    item: T
  ): void {
    signal.update(items => [...items, item]);
  }

  /**
   * Helper method to update item in signal array
   */
  protected updateInSignal<T extends { id: string }>(
    signal: WritableSignal<T[]>,
    updatedItem: T
  ): void {
    signal.update(items =>
      items.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  }

  /**
   * Helper method to remove item from signal array
   */
  protected removeFromSignal<T extends { id: string }>(
    signal: WritableSignal<T[]>,
    id: string
  ): void {
    signal.update(items => items.filter(item => item.id !== id));
  }

  /**
   * Helper method to get current user ID (Observable-based)
   */
  protected getCurrentUserId$(): Observable<string | null> {
    const user = this.authService.getCurrentUser();
    return of(user?.userId || null);
  }

  /**
   * Helper method to check if user has access to household (Observable-based)
   */
  protected checkHouseholdAccess$(householdId: string, userId: string): Observable<boolean> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => {
        return from(
          client
            .from('household_members')
            .select('id')
            .eq('household_id', householdId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle()
        ).pipe(
          map(({ data, error }) => {
            if (error) {
              console.error('Error checking household access:', error);
              return false;
            }
            return !!data;
          }),
          catchError(() => of(false))
        );
      })
    );
  }

  /**
   * Helper method for SELECT queries from Supabase (Observable-based)
   */
  protected selectFrom$<T>(table: string): Observable<T[]> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => {
        return from(client.from(table).select('*')).pipe(
          map(({ data, error }: any) => {
            if (error) {
              console.error(`Error selecting from ${table}:`, error);
              this.toastService.error('Error', error.message || 'Failed to load data');
              throw error;
            }
            return (data || []) as T[];
          }),
          catchError(error => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Helper method for INSERT operations (Observable-based)
   */
  protected insertInto$<T>(table: string, data: Partial<T> | Partial<T>[]): Observable<T> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => {
        return from(
          client
            .from(table)
            .insert(data)
            .select()
            .single()
        ).pipe(
          map(({ data: result, error }: any) => {
            if (error) {
              console.error(`Error inserting into ${table}:`, error);
              this.toastService.error('Error', error.message || 'Failed to insert data');
              throw error;
            }
            return result as T;
          }),
          catchError(error => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Helper method for UPDATE operations (Observable-based)
   */
  protected updateIn$<T>(table: string, id: string, updates: Partial<T>): Observable<T> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => {
        return from(
          client
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        ).pipe(
          map(({ data, error }: any) => {
            if (error) {
              console.error(`Error updating ${table}:`, error);
              this.toastService.error('Error', error.message || 'Failed to update data');
              throw error;
            }
            return data as T;
          }),
          catchError(error => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Helper method for DELETE operations (Observable-based)
   */
  protected deleteFrom$(table: string, id: string): Observable<void> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => {
        return from(
          client
            .from(table)
            .delete()
            .eq('id', id)
        ).pipe(
          map(({ error }: any) => {
            if (error) {
              console.error(`Error deleting from ${table}:`, error);
              this.toastService.error('Error', error.message || 'Failed to delete data');
              throw error;
            }
            return void 0;
          }),
          catchError(error => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Helper method for soft delete (updates deleted_at column) (Observable-based)
   */
  protected softDeleteFrom$<T>(table: string, id: string): Observable<T> {
    return this.updateIn$<T>(table, id, { deleted_at: new Date().toISOString() } as unknown as Partial<T>);
  }
}