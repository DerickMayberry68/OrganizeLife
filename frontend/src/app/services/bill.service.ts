import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
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
 * Handles bill and payment frequency operations
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

  // ===== BILLS =====

  public loadBills(): Observable<Bill[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Bill[]>(
      `${this.API_URL}/Bills/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(bills => this.billsSignal.set(bills)),
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
      return of({} as Bill);
    }

    return this.http.post<Bill>(
      `${this.API_URL}/Bills`,
      bill,
      this.getHeaders()
    ).pipe(
      tap(newBill => {
        this.addToSignal(this.billsSignal, newBill);
        this.toastService.success('Success', 'Bill added successfully');
      }),
      catchError(error => {
        console.error('Error adding bill:', error);
        this.toastService.error('Error', 'Failed to add bill');
        throw error;
      })
    );
  }

  public updateBill(id: string, updates: Partial<Bill>): Observable<Bill> {
    return this.http.put<Bill>(
      `${this.API_URL}/Bills/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedBill => {
        this.updateInSignal(this.billsSignal, updatedBill);
        this.toastService.success('Success', 'Bill updated successfully');
      }),
      catchError(error => {
        console.error('Error updating bill:', error);
        this.toastService.error('Error', 'Failed to update bill');
        throw error;
      })
    );
  }

  public deleteBill(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Bills/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.billsSignal, id);
        this.toastService.success('Success', 'Bill deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting bill:', error);
        this.toastService.error('Error', 'Failed to delete bill');
        throw error;
      })
    );
  }

  // ===== FREQUENCIES =====

  public loadFrequencies(): Observable<Frequency[]> {
    return this.http.get<Frequency[]>(
      `${this.API_URL}/Frequencies`,
      this.getHeaders()
    ).pipe(
      tap(frequencies => this.frequenciesSignal.set(frequencies)),
      catchError(error => {
        console.error('Error loading frequencies:', error);
        return of([]);
      })
    );
  }
}

