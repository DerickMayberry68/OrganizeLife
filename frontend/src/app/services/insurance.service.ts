import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Insurance } from '../models/insurance.model';

/**
 * Insurance Service
 * Handles insurance policy operations using Supabase
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

  // ===== INSURANCE POLICIES =====

  public loadInsurancePolicies(): Observable<Insurance[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('insurance_policies')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const policies = this.mapInsurancePoliciesFromSupabase(response.data || []);
        this.insurancePoliciesSignal.set(policies);
        return policies;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const policyData = {
      household_id: householdId,
      insurance_type_id: policy.insuranceTypeId,
      provider_name: policy.providerName,
      policy_number: policy.policyNumber,
      coverage_amount: policy.coverageAmount || null,
      premium: policy.premium || null,
      deductible: policy.deductible || null,
      start_date: policy.startDate ? (typeof policy.startDate === 'string' ? policy.startDate : policy.startDate.toISOString().split('T')[0]) : null,
      end_date: policy.endDate ? (typeof policy.endDate === 'string' ? policy.endDate : policy.endDate.toISOString().split('T')[0]) : null,
      renewal_date: policy.renewalDate ? (typeof policy.renewalDate === 'string' ? policy.renewalDate : policy.renewalDate.toISOString().split('T')[0]) : null,
      notes: policy.notes || null
    };

    return from(
      this.supabase
        .from('insurance_policies')
        .insert(policyData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newPolicy = this.mapInsuranceFromSupabase(response.data);
        this.addToSignal(this.insurancePoliciesSignal, newPolicy);
        this.toastService.success('Success', 'Insurance policy added successfully');
        return newPolicy;
      }),
      catchError(error => {
        console.error('Error adding insurance policy:', error);
        this.toastService.error('Error', 'Failed to add insurance policy');
        return throwError(() => error);
      })
    );
  }

  public updateInsurancePolicy(id: string, updates: Partial<Insurance>): Observable<Insurance> {
    const updateData: any = {};
    
    if (updates.provider !== undefined) updateData.provider_name = updates.provider;
    if (updates.policyNumber !== undefined) updateData.policy_number = updates.policyNumber;
    if (updates.coverage !== undefined) updateData.coverage = updates.coverage;
    if (updates.premium !== undefined) updateData.premium = updates.premium;
    if (updates.deductible !== undefined) updateData.deductible = updates.deductible;
    if (updates.startDate !== undefined) {
      updateData.start_date = updates.startDate 
        ? (typeof updates.startDate === 'string' ? updates.startDate : updates.startDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.renewalDate !== undefined) {
      updateData.renewal_date = updates.renewalDate 
        ? (typeof updates.renewalDate === 'string' ? updates.renewalDate : updates.renewalDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.coverage !== undefined) updateData.coverage = updates.coverage;
    if (updates.deductible !== undefined) updateData.deductible = updates.deductible;

    return from(
      this.supabase
        .from('insurance_policies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedPolicy = this.mapInsuranceFromSupabase(response.data);
        this.updateInSignal(this.insurancePoliciesSignal, updatedPolicy);
        this.toastService.success('Success', 'Insurance policy updated successfully');
        return updatedPolicy;
      }),
      catchError(error => {
        console.error('Error updating insurance policy:', error);
        this.toastService.error('Error', 'Failed to update insurance policy');
        return throwError(() => error);
      })
    );
  }

  public deleteInsurancePolicy(id: string): Observable<void> {
    return from(
      this.supabase
        .from('insurance_policies')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.insurancePoliciesSignal, id);
        this.toastService.success('Success', 'Insurance policy deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting insurance policy:', error);
        this.toastService.error('Error', 'Failed to delete insurance policy');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapInsuranceFromSupabase(data: any): Insurance {
    return {
      id: data.id,
      type: data.type || 'other',
      provider: data.provider_name || '',
      policyNumber: data.policy_number || '',
      premium: parseFloat(data.premium || 0),
      billingFrequency: data.billing_frequency || 'monthly',
      startDate: data.start_date ? new Date(data.start_date) : new Date(),
      renewalDate: data.renewal_date ? new Date(data.renewal_date) : new Date(),
      coverage: data.coverage || '',
      deductible: data.deductible ? parseFloat(data.deductible) : undefined,
      beneficiaries: data.beneficiaries || undefined,
      documentUrl: data.document_url || undefined
    };
  }

  private mapInsurancePoliciesFromSupabase(data: any[]): Insurance[] {
    return data.map(item => this.mapInsuranceFromSupabase(item));
  }
}
