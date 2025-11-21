import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Alert } from '../models/alert.model';

/**
 * Alert Service
 * Handles all alert-related operations using Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Alert signals
  private readonly alertsSignal = signal<Alert[]>([]);

  // Public readonly accessors
  public readonly alerts = this.alertsSignal.asReadonly();

  // Computed values
  public readonly unreadAlertsCount = computed(() =>
    this.alertsSignal().filter(a => !a.isRead && !a.isDismissed).length
  );

  public readonly activeAlertsCount = computed(() =>
    this.alertsSignal().filter(a => !a.isDismissed).length
  );

  public readonly criticalAlertsCount = computed(() =>
    this.alertsSignal().filter(a => a.severity === 'Critical' && !a.isDismissed).length
  );

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * Load all alerts for the household
   */
  public loadAlerts(): Observable<Alert[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      // Silently return empty array when not authenticated - this is expected behavior
      return of([]);
    }

    return from(
      this.supabase
        .from('alerts')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const alerts = this.mapAlertsFromSupabase(response.data || []);
        this.alertsSignal.set(alerts);
        return alerts;
      }),
      catchError(error => {
        console.error('Error loading alerts:', error);
        return of([]);
      })
    );
  }

  /**
   * Mark an alert as read
   */
  public markAlertAsRead(id: string): Observable<Alert> {
    return from(
      this.supabase
        .from('alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedAlert = this.mapAlertFromSupabase(response.data);
        this.updateInSignal(this.alertsSignal, updatedAlert);
        return updatedAlert;
      }),
      catchError(error => {
        console.error('Error marking alert as read:', error);
        this.toastService.error('Error', 'Failed to mark alert as read');
        return throwError(() => error);
      })
    );
  }

  /**
   * Dismiss an alert
   */
  public dismissAlert(id: string): Observable<Alert> {
    return from(
      this.supabase
        .from('alerts')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
          status: 'Dismissed'
        })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedAlert = this.mapAlertFromSupabase(response.data);
        this.updateInSignal(this.alertsSignal, updatedAlert);
        return updatedAlert;
      }),
      catchError(error => {
        console.error('Error dismissing alert:', error);
        this.toastService.error('Error', 'Failed to dismiss alert');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an alert
   */
  public deleteAlert(id: string): Observable<void> {
    return from(
      this.supabase
        .from('alerts')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.alertsSignal, id);
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting alert:', error);
        this.toastService.error('Error', 'Failed to delete alert');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark all alerts as read for the household
   */
  public markAllAlertsAsRead(): Observable<any> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return of({ count: 0 });
    }

    return from(
      this.supabase
        .from('alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .eq('is_read', false)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        // Reload alerts to get updated state
        this.loadAlerts().subscribe();
        return { count: Array.isArray(response.data) ? (response.data as any[]).length : 0 };
      }),
      catchError(error => {
        console.error('Error marking all alerts as read:', error);
        this.toastService.error('Error', 'Failed to mark all alerts as read');
        return throwError(() => error);
      })
    );
  }

  /**
   * Dismiss all alerts for the household
   */
  public dismissAllAlerts(): Observable<any> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return of({ count: 0 });
    }

    return from(
      this.supabase
        .from('alerts')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
          status: 'Dismissed'
        })
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .eq('is_dismissed', false)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        // Reload alerts to get updated state
        this.loadAlerts().subscribe();
        return { count: Array.isArray(response.data) ? (response.data as any[]).length : 0 };
      }),
      catchError(error => {
        console.error('Error dismissing all alerts:', error);
        this.toastService.error('Error', 'Failed to dismiss all alerts');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapAlertFromSupabase(data: any): Alert {
    return {
      id: data.id,
      householdId: data.household_id,
      type: data.type,
      category: data.category,
      severity: data.severity,
      priority: data.priority,
      title: data.title,
      message: data.message,
      description: data.description,
      relatedEntityType: data.related_entity_type,
      relatedEntityId: data.related_entity_id,
      relatedEntityName: data.related_entity_name,
      status: data.status,
      isRead: data.is_read || false,
      isDismissed: data.is_dismissed || false,
      createdAt: new Date(data.created_at),
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      dismissedAt: data.dismissed_at ? new Date(data.dismissed_at) : undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      actionUrl: data.action_url,
      actionLabel: data.action_label,
      isRecurring: data.is_recurring || false,
      recurrenceRule: data.recurrence_rule,
      nextOccurrence: data.next_occurrence ? new Date(data.next_occurrence) : undefined
    };
  }

  private mapAlertsFromSupabase(data: any[]): Alert[] {
    return data.map(item => this.mapAlertFromSupabase(item));
  }
}
