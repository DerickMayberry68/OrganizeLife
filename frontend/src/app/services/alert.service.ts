import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Alert } from '../models/alert.model';

/**
 * Alert Service
 * Handles all alert-related operations
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

  /**
   * Load all alerts for the household
   */
  public loadAlerts(): Observable<Alert[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Alert[]>(
      `${this.API_URL}/Alerts/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(alerts => this.alertsSignal.set(alerts)),
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
    return this.http.post<Alert>(
      `${this.API_URL}/Alerts/${id}/mark-read`,
      {},
      this.getHeaders()
    ).pipe(
      tap(updatedAlert => {
        this.updateInSignal(this.alertsSignal, updatedAlert);
      }),
      catchError(error => {
        console.error('Error marking alert as read:', error);
        this.toastService.error('Error', 'Failed to mark alert as read');
        throw error;
      })
    );
  }

  /**
   * Dismiss an alert
   */
  public dismissAlert(id: string): Observable<Alert> {
    return this.http.post<Alert>(
      `${this.API_URL}/Alerts/${id}/dismiss`,
      {},
      this.getHeaders()
    ).pipe(
      tap(updatedAlert => {
        this.updateInSignal(this.alertsSignal, updatedAlert);
      }),
      catchError(error => {
        console.error('Error dismissing alert:', error);
        this.toastService.error('Error', 'Failed to dismiss alert');
        throw error;
      })
    );
  }

  /**
   * Delete an alert
   */
  public deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Alerts/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.alertsSignal, id);
      }),
      catchError(error => {
        console.error('Error deleting alert:', error);
        this.toastService.error('Error', 'Failed to delete alert');
        throw error;
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

    return this.http.post<any>(
      `${this.API_URL}/Alerts/household/${householdId}/mark-all-read`,
      {},
      this.getHeaders()
    ).pipe(
      tap(() => {
        // Reload alerts to get updated state
        this.loadAlerts().subscribe();
      }),
      catchError(error => {
        console.error('Error marking all alerts as read:', error);
        this.toastService.error('Error', 'Failed to mark all alerts as read');
        throw error;
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

    return this.http.post<any>(
      `${this.API_URL}/Alerts/household/${householdId}/dismiss-all`,
      {},
      this.getHeaders()
    ).pipe(
      tap(() => {
        // Reload alerts to get updated state
        this.loadAlerts().subscribe();
      }),
      catchError(error => {
        console.error('Error dismissing all alerts:', error);
        this.toastService.error('Error', 'Failed to dismiss all alerts');
        throw error;
      })
    );
  }
}

