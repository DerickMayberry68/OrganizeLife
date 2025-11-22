import { inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError, firstValueFrom } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { ToastService } from './toast.service';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Base Service
 * Provides shared functionality for all domain-specific services using Supabase
 */
export abstract class BaseApiService {
  protected readonly supabaseService = inject(SupabaseService);
  protected readonly toastService = inject(ToastService);
  
  /**
   * Get the Supabase client instance
   */
  protected get supabase(): SupabaseClient {
    return this.supabaseService.client;
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
   * Helper method to get current user ID from Supabase session
   */
  protected async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await firstValueFrom(this.supabaseService.getCurrentUser());
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Helper method to check if user has access to household
   */
  protected async checkHouseholdAccess(householdId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('household_members')
      .select('id')
      .eq('household_id', householdId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking household access:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Helper method for SELECT queries from Supabase
   */
  protected selectFrom<T>(table: string): any {
    return this.supabase.from(table).select('*');
  }

  /**
   * Helper method for INSERT operations
   */
  protected async insertInto<T>(table: string, data: Partial<T> | Partial<T>[]): Promise<T | T[]> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      this.toastService.error('Error', error.message || 'Failed to insert data');
      throw error;
    }

    return result as T;
  }

  /**
   * Helper method for INSERT operations (Observable)
   */
  protected insertIntoObservable<T>(table: string, data: Partial<T> | Partial<T>[]): Observable<T> {
    return from(this.insertInto<T>(table, data) as Promise<T>).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper method for UPDATE operations
   */
  protected async updateIn<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table}:`, error);
      this.toastService.error('Error', error.message || 'Failed to update data');
      throw error;
    }

    return data as T;
  }

  /**
   * Helper method for UPDATE operations (Observable)
   */
  protected updateInObservable<T>(table: string, id: string, updates: Partial<T>): Observable<T> {
    return from(this.updateIn<T>(table, id, updates)).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper method for DELETE operations
   */
  protected async deleteFrom(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      this.toastService.error('Error', error.message || 'Failed to delete data');
      throw error;
    }
  }

  /**
   * Helper method for DELETE operations (Observable)
   */
  protected deleteFromObservable(table: string, id: string): Observable<void> {
    return from(this.deleteFrom(table, id)).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper method for soft delete (updates deleted_at column)
   */
  protected async softDeleteFrom<T>(table: string, id: string): Promise<T> {
    return this.updateIn<T>(table, id, { deleted_at: new Date().toISOString() } as unknown as Partial<T>);
  }

  /**
   * Helper method for soft delete (Observable)
   */
  protected softDeleteFromObservable<T>(table: string, id: string): Observable<T> {
    return from(this.softDeleteFrom<T>(table, id)).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}

