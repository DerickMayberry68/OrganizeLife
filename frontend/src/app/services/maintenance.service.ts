import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { MaintenanceTask, ServiceProvider } from '../models/maintenance.model';

/**
 * Maintenance Service
 * Handles maintenance tasks and service provider operations
 */
@Injectable({
  providedIn: 'root'
})
export class MaintenanceService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Maintenance signals
  private readonly maintenanceTasksSignal = signal<MaintenanceTask[]>([]);
  private readonly serviceProvidersSignal = signal<ServiceProvider[]>([]);

  // Public readonly accessors
  public readonly maintenanceTasks = this.maintenanceTasksSignal.asReadonly();
  public readonly serviceProviders = this.serviceProvidersSignal.asReadonly();

  // Computed values
  public readonly pendingTasks = computed(() =>
    this.maintenanceTasksSignal().filter(t =>
      t.status === 'pending' || t.status === 'scheduled'
    )
  );

  public readonly overdueTasks = computed(() =>
    this.maintenanceTasksSignal().filter(t => 
      t.status === 'pending' && new Date(t.dueDate) < new Date()
    )
  );

  public readonly completedTasks = computed(() =>
    this.maintenanceTasksSignal().filter(t => t.status === 'completed')
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

  // ===== MAINTENANCE TASKS =====

  public loadMaintenanceTasks(): Observable<MaintenanceTask[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<MaintenanceTask[]>(
      `${this.API_URL}/Maintenance/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(tasks => this.maintenanceTasksSignal.set(tasks)),
      catchError(error => {
        console.error('Error loading maintenance tasks:', error);
        this.toastService.error('Error', 'Failed to load maintenance tasks');
        return of([]);
      })
    );
  }

  public addMaintenanceTask(task: any): Observable<MaintenanceTask> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as MaintenanceTask);
    }

    return this.http.post<MaintenanceTask>(
      `${this.API_URL}/MaintenanceTasks`,
      task,
      this.getHeaders()
    ).pipe(
      tap(newTask => {
        this.addToSignal(this.maintenanceTasksSignal, newTask);
        this.toastService.success('Success', 'Maintenance task added successfully');
      }),
      catchError(error => {
        console.error('Error adding maintenance task:', error);
        this.toastService.error('Error', 'Failed to add maintenance task');
        throw error;
      })
    );
  }

  public updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Observable<MaintenanceTask> {
    return this.http.put<MaintenanceTask>(
      `${this.API_URL}/MaintenanceTasks/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedTask => {
        this.updateInSignal(this.maintenanceTasksSignal, updatedTask);
        this.toastService.success('Success', 'Maintenance task updated successfully');
      }),
      catchError(error => {
        console.error('Error updating maintenance task:', error);
        this.toastService.error('Error', 'Failed to update maintenance task');
        throw error;
      })
    );
  }

  public deleteMaintenanceTask(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/MaintenanceTasks/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.maintenanceTasksSignal, id);
        this.toastService.success('Success', 'Maintenance task deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting maintenance task:', error);
        this.toastService.error('Error', 'Failed to delete maintenance task');
        throw error;
      })
    );
  }

  // ===== SERVICE PROVIDERS =====

  public loadServiceProviders(): Observable<ServiceProvider[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<ServiceProvider[]>(
      `${this.API_URL}/ServiceProviders/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(providers => this.serviceProvidersSignal.set(providers)),
      catchError(error => {
        console.error('Error loading service providers:', error);
        this.toastService.error('Error', 'Failed to load service providers');
        return of([]);
      })
    );
  }

  public addServiceProvider(provider: any): Observable<ServiceProvider> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as ServiceProvider);
    }

    return this.http.post<ServiceProvider>(
      `${this.API_URL}/ServiceProviders`,
      provider,
      this.getHeaders()
    ).pipe(
      tap(newProvider => {
        this.addToSignal(this.serviceProvidersSignal, newProvider);
        this.toastService.success('Success', 'Service provider added successfully');
      }),
      catchError(error => {
        console.error('Error adding service provider:', error);
        this.toastService.error('Error', 'Failed to add service provider');
        throw error;
      })
    );
  }

  public updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Observable<ServiceProvider> {
    return this.http.put<ServiceProvider>(
      `${this.API_URL}/ServiceProviders/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedProvider => {
        this.updateInSignal(this.serviceProvidersSignal, updatedProvider);
        this.toastService.success('Success', 'Service provider updated successfully');
      }),
      catchError(error => {
        console.error('Error updating service provider:', error);
        this.toastService.error('Error', 'Failed to update service provider');
        throw error;
      })
    );
  }

  public deleteServiceProvider(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/ServiceProviders/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.serviceProvidersSignal, id);
        this.toastService.success('Success', 'Service provider deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting service provider:', error);
        this.toastService.error('Error', 'Failed to delete service provider');
        throw error;
      })
    );
  }
}

