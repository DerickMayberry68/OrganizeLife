import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { InventoryItem } from '../models/inventory.model';

/**
 * Inventory Service
 * Handles inventory item operations using Supabase
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

  // ===== INVENTORY ITEMS =====

  public loadInventoryItems(): Observable<InventoryItem[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('inventory_items')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const items = this.mapInventoryItemsFromSupabase(response.data || []);
        this.inventoryItemsSignal.set(items);
        return items;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const itemData = {
      household_id: householdId,
      name: item.name,
      description: item.description || null,
      category: item.category || null,
      quantity: item.quantity || 1,
      purchase_price: item.purchasePrice || null,
      purchase_date: item.purchaseDate ? (typeof item.purchaseDate === 'string' ? item.purchaseDate : item.purchaseDate.toISOString().split('T')[0]) : null,
      warranty_start_date: item.warranty?.startDate ? (typeof item.warranty.startDate === 'string' ? item.warranty.startDate : item.warranty.startDate.toISOString().split('T')[0]) : null,
      warranty_end_date: item.warranty?.endDate ? (typeof item.warranty.endDate === 'string' ? item.warranty.endDate : item.warranty.endDate.toISOString().split('T')[0]) : null,
      location: item.location || null,
      notes: item.notes || null
    };

    return from(
      this.supabase
        .from('inventory_items')
        .insert(itemData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newItem = this.mapInventoryItemFromSupabase(response.data);
        this.addToSignal(this.inventoryItemsSignal, newItem);
        this.toastService.success('Success', 'Inventory item added successfully');
        return newItem;
      }),
      catchError(error => {
        console.error('Error adding inventory item:', error);
        this.toastService.error('Error', 'Failed to add inventory item');
        return throwError(() => error);
      })
    );
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): Observable<InventoryItem> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice;
    if (updates.purchaseDate !== undefined) {
      updateData.purchase_date = updates.purchaseDate 
        ? (typeof updates.purchaseDate === 'string' ? updates.purchaseDate : updates.purchaseDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.warranty) {
      if (updates.warranty.startDate) {
        updateData.warranty_start_date = typeof updates.warranty.startDate === 'string' 
          ? updates.warranty.startDate 
          : updates.warranty.startDate.toISOString().split('T')[0];
      }
      if (updates.warranty.endDate) {
        updateData.warranty_end_date = typeof updates.warranty.endDate === 'string' 
          ? updates.warranty.endDate 
          : updates.warranty.endDate.toISOString().split('T')[0];
      }
    }

    return from(
      this.supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedItem = this.mapInventoryItemFromSupabase(response.data);
        this.updateInSignal(this.inventoryItemsSignal, updatedItem);
        this.toastService.success('Success', 'Inventory item updated successfully');
        return updatedItem;
      }),
      catchError(error => {
        console.error('Error updating inventory item:', error);
        this.toastService.error('Error', 'Failed to update inventory item');
        return throwError(() => error);
      })
    );
  }

  public deleteInventoryItem(id: string): Observable<void> {
    return from(
      this.supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.inventoryItemsSignal, id);
        this.toastService.success('Success', 'Inventory item deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting inventory item:', error);
        this.toastService.error('Error', 'Failed to delete inventory item');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapInventoryItemFromSupabase(data: any): InventoryItem {
    return {
      id: data.id,
      name: data.name,
      category: data.category || '',
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : new Date(),
      purchasePrice: parseFloat(data.purchase_price || 0),
      location: data.location || '',
      warranty: (data.warranty_start_date && data.warranty_end_date && data.warranty_provider) ? {
        startDate: new Date(data.warranty_start_date),
        endDate: new Date(data.warranty_end_date),
        provider: data.warranty_provider,
        documentUrl: data.warranty_document_url || undefined
      } : undefined,
      maintenanceSchedule: data.maintenance_schedule || undefined,
      photos: data.photos || undefined,
      notes: data.notes || undefined
    };
  }

  private mapInventoryItemsFromSupabase(data: any[]): InventoryItem[] {
    return data.map(item => this.mapInventoryItemFromSupabase(item));
  }
}
