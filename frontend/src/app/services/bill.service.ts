import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Bill } from '../models/bill.model';

// Frequency/Billing Cycle interface
export interface Frequency {
  id: string;
  name: string;
  intervalDays: number;
  createdAt: Date;
}

/**
 * Bill Service
 * Handles bill and payment frequency operations using Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class BillService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Bill signals
  private readonly billsSignal = signal<Bill[]>([]);
  private readonly frequenciesSignal = signal<Frequency[]>([]);

  // Public readonly accessors
  public readonly bills = this.billsSignal.asReadonly();
  public readonly frequencies = this.frequenciesSignal.asReadonly();

  // Computed values
  public readonly upcomingBills = computed(() =>
    this.billsSignal().filter(b =>
      b.status === 'pending' &&
      new Date(b.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    )
  );

  public readonly overdueBills = computed(() =>
    this.billsSignal().filter(b => b.status === 'overdue')
  );

  public readonly totalDue = computed(() =>
    this.upcomingBills().reduce((sum, b) => sum + b.amount, 0)
  );

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  // ===== BILLS =====

  public loadBills(): Observable<Bill[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('bills')
        .select(`
          *,
          categories:category_id (name),
          frequencies:frequency_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('due_date', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const bills = this.mapBillsFromSupabase(response.data || []);
        this.billsSignal.set(bills);
        return bills;
      }),
      catchError(error => {
        console.error('Error loading bills:', error);
        this.toastService.error('Error', 'Failed to load bills');
        return of([]);
      })
    );
  }

  public addBill(bill: any): Observable<Bill> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const billData = {
      household_id: householdId,
      account_id: bill.accountId,
      category_id: bill.categoryId || null,
      name: bill.name,
      amount: bill.amount,
      due_date: typeof bill.dueDate === 'string' ? bill.dueDate : bill.dueDate.toISOString().split('T')[0],
      status: bill.status || 'pending',
      is_recurring: bill.isRecurring || false,
      frequency_id: bill.frequencyId || null
    };

    return from(
      this.supabase
        .from('bills')
        .insert(billData)
        .select(`
          *,
          categories:category_id (name),
          frequencies:frequency_id (name)
        `)
        .single()
    ).pipe(
      tap((response) => {
        if (response.error) {
          throw response.error;
        }
        const newBill = this.mapBillFromSupabase(response.data);
        this.addToSignal(this.billsSignal, newBill);
        this.toastService.success('Success', 'Bill added successfully');
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return this.mapBillFromSupabase(response.data);
      }),
      catchError(error => {
        console.error('Error adding bill:', error);
        this.toastService.error('Error', 'Failed to add bill');
        return throwError(() => error);
      })
    );
  }

  public updateBill(id: string, updates: Partial<Bill>): Observable<Bill> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.dueDate !== undefined) {
      updateData.due_date = typeof updates.dueDate === 'string' 
        ? updates.dueDate 
        : updates.dueDate.toISOString().split('T')[0];
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;

    return from(
      this.supabase
        .from('bills')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          categories:category_id (name),
          frequencies:frequency_id (name)
        `)
        .single()
    ).pipe(
      tap((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedBill = this.mapBillFromSupabase(response.data);
        this.updateInSignal(this.billsSignal, updatedBill);
        this.toastService.success('Success', 'Bill updated successfully');
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return this.mapBillFromSupabase(response.data);
      }),
      catchError(error => {
        console.error('Error updating bill:', error);
        this.toastService.error('Error', 'Failed to update bill');
        return throwError(() => error);
      })
    );
  }

  public deleteBill(id: string): Observable<void> {
    return from(
      this.supabase
        .from('bills')
        .delete()
        .eq('id', id)
    ).pipe(
      tap((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.billsSignal, id);
        this.toastService.success('Success', 'Bill deleted successfully');
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error deleting bill:', error);
        this.toastService.error('Error', 'Failed to delete bill');
        return throwError(() => error);
      })
    );
  }

  // ===== FREQUENCIES =====

  public loadFrequencies(): Observable<Frequency[]> {
    return from(
      this.supabase
        .from('frequencies')
        .select('*')
        .order('interval_days', { ascending: true })
    ).pipe(
      tap((response) => {
        if (response.error) {
          throw response.error;
        }
        const frequencies = (response.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          intervalDays: f.interval_days,
          createdAt: new Date(f.created_at)
        }));
        this.frequenciesSignal.set(frequencies);
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return (response.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          intervalDays: f.interval_days,
          createdAt: new Date(f.created_at)
        }));
      }),
      catchError(error => {
        console.error('Error loading frequencies:', error);
        return of([]);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapBillFromSupabase(data: any): Bill {
    return {
      id: data.id,
      name: data.name,
      amount: data.amount,
      dueDate: new Date(data.due_date),
      category: data.categories?.name || data.category_id || '',
      isRecurring: data.is_recurring || false,
      frequency: data.frequencies?.name?.toLowerCase() || undefined,
      status: data.status || 'pending',
      paymentMethod: data.payment_method || undefined,
      autoPayEnabled: data.auto_pay_enabled || false,
      reminderDays: data.reminder_days || 0
    };
  }

  private mapBillsFromSupabase(data: any[]): Bill[] {
    return data.map(item => this.mapBillFromSupabase(item));
  }
}

