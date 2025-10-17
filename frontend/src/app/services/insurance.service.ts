import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Insurance } from '../models/insurance.model';

/**
 * Insurance Service
 * Handles insurance policy operations
 */
@Injectable({
  providedIn: 'root'
})
export class InsuranceService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Insurance signals
  private readonly insurancePoliciesSignal = signal<Insurance[]>([]);

  // Public readonly accessors
  public readonly insurancePolicies = this.insurancePoliciesSignal.asReadonly();

  // Computed values
  public readonly activePolicies = computed(() =>
    this.insurancePoliciesSignal() // All policies are considered active
  );

  public readonly expiringPolicies = computed(() =>
    this.insurancePoliciesSignal().filter(p => {
      if (!p.renewalDate) return false;
      const daysUntilExpiry = (new Date(p.renewalDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntilExpiry < 60 && daysUntilExpiry > 0;
    })
  );

  public readonly totalCoverage = computed(() =>
    this.activePolicies().reduce((sum, p) => sum + (p.premium || 0), 0)
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

  // ===== INSURANCE POLICIES =====

  public loadInsurancePolicies(): Observable<Insurance[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Insurance[]>(
      `${this.API_URL}/Insurance/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(policies => this.insurancePoliciesSignal.set(policies)),
      catchError(error => {
        console.error('Error loading insurance policies:', error);
        this.toastService.error('Error', 'Failed to load insurance policies');
        return of([]);
      })
    );
  }

  public addInsurancePolicy(policy: any): Observable<Insurance> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Insurance);
    }

    return this.http.post<Insurance>(
      `${this.API_URL}/Insurance`,
      policy,
      this.getHeaders()
    ).pipe(
      tap(newPolicy => {
        this.addToSignal(this.insurancePoliciesSignal, newPolicy);
        this.toastService.success('Success', 'Insurance policy added successfully');
      }),
      catchError(error => {
        console.error('Error adding insurance policy:', error);
        this.toastService.error('Error', 'Failed to add insurance policy');
        throw error;
      })
    );
  }

  public updateInsurancePolicy(id: string, updates: Partial<Insurance>): Observable<Insurance> {
    return this.http.put<Insurance>(
      `${this.API_URL}/Insurance/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedPolicy => {
        this.updateInSignal(this.insurancePoliciesSignal, updatedPolicy);
        this.toastService.success('Success', 'Insurance policy updated successfully');
      }),
      catchError(error => {
        console.error('Error updating insurance policy:', error);
        this.toastService.error('Error', 'Failed to update insurance policy');
        throw error;
      })
    );
  }

  public deleteInsurancePolicy(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Insurance/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.insurancePoliciesSignal, id);
        this.toastService.success('Success', 'Insurance policy deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting insurance policy:', error);
        this.toastService.error('Error', 'Failed to delete insurance policy');
        throw error;
      })
    );
  }
}

