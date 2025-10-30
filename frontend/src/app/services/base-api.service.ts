import { inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Base API Service
 * Provides shared functionality for all domain-specific services
 */
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly toastService = inject(ToastService);
  private readonly DEV_API_URL = 'https://localhost:7157/api';
  private readonly PROD_API_URL = 'https://organizelife-acgmf4fzhxhfafa8.centralus-01.azurewebsites.net/api';
  protected readonly API_URL = isDevMode() ? this.DEV_API_URL : this.PROD_API_URL;

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
   * Helper method for GET requests
   */
  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.API_URL}${endpoint}`);
  }

  /**
   * Helper method for POST requests
   */
  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.API_URL}${endpoint}`, data);
  }

  /**
   * Helper method for PUT requests
   */
  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.API_URL}${endpoint}`, data);
  }

  /**
   * Helper method for PATCH requests
   */
  protected patch<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.patch<T>(`${this.API_URL}${endpoint}`, data);
  }

  /**
   * Helper method for DELETE requests
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.API_URL}${endpoint}`);
  }
}

