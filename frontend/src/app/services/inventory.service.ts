import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { InventoryItem } from '../models/inventory.model';

/**
 * Inventory Service
 * Handles inventory item operations
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Inventory signals
  private readonly inventoryItemsSignal = signal<InventoryItem[]>([]);

  // Public readonly accessors
  public readonly inventoryItems = this.inventoryItemsSignal.asReadonly();

  // Computed values
  public readonly totalInventoryValue = computed(() =>
    this.inventoryItemsSignal().reduce((sum, item) => sum + (item.purchasePrice || 0), 0)
  );

  public readonly itemsNeedingReplacement = computed(() =>
    this.inventoryItemsSignal().filter(item => {
      if (!item.warranty?.endDate) return false;
      const daysUntilExpiry = (new Date(item.warranty.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntilExpiry < 90 && daysUntilExpiry > 0;
    })
  );

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * Get auth headers
   */
  private getHeaders() {
    const headers = this.authService.getAuthHeaders();
    if (!headers.has('Content-Type')) {
      return {
        headers: headers.set('Content-Type', 'application/json')
      };
    }
    return { headers };
  }

  // ===== INVENTORY ITEMS =====

  public loadInventoryItems(): Observable<InventoryItem[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<InventoryItem[]>(
      `${this.API_URL}/Inventory/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(items => this.inventoryItemsSignal.set(items)),
      catchError(error => {
        console.error('Error loading inventory items:', error);
        this.toastService.error('Error', 'Failed to load inventory items');
        return of([]);
      })
    );
  }

  public addInventoryItem(item: any): Observable<InventoryItem> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as InventoryItem);
    }

    return this.http.post<InventoryItem>(
      `${this.API_URL}/Inventory`,
      item,
      this.getHeaders()
    ).pipe(
      tap(newItem => {
        this.addToSignal(this.inventoryItemsSignal, newItem);
        this.toastService.success('Success', 'Inventory item added successfully');
      }),
      catchError(error => {
        console.error('Error adding inventory item:', error);
        this.toastService.error('Error', 'Failed to add inventory item');
        throw error;
      })
    );
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(
      `${this.API_URL}/Inventory/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedItem => {
        this.updateInSignal(this.inventoryItemsSignal, updatedItem);
        this.toastService.success('Success', 'Inventory item updated successfully');
      }),
      catchError(error => {
        console.error('Error updating inventory item:', error);
        this.toastService.error('Error', 'Failed to update inventory item');
        throw error;
      })
    );
  }

  public deleteInventoryItem(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Inventory/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.inventoryItemsSignal, id);
        this.toastService.success('Success', 'Inventory item deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting inventory item:', error);
        this.toastService.error('Error', 'Failed to delete inventory item');
        throw error;
      })
    );
  }
}

