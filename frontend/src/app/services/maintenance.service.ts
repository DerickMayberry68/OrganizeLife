import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map, switchMap, filter, take, timeout } from 'rxjs/operators';
import type { CurrentUser } from './auth.service';
import { BaseApiService } from './base-api.service';
import type { MaintenanceTask, ServiceProvider } from '../models/maintenance.model';

/**
 * Maintenance Service
 * Handles maintenance tasks and service provider operations using Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class MaintenanceService extends BaseApiService {
  // Create observable as field initializer (always in injection context)
  private readonly currentUserObservable$: Observable<CurrentUser | null> = toObservable(this.authService.currentUser$);

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
   * Get household ID from auth service (synchronous)
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * Get household ID as Observable (waits for user profile to load)
   */
  private getHouseholdId$(): Observable<string> {
    const currentHouseholdId = this.getHouseholdId();
    if (currentHouseholdId) {
      return of(currentHouseholdId);
    }

    // Use the pre-created observable (created in constructor with injection context)
    return this.currentUserObservable$.pipe(
      filter((user: CurrentUser | null): user is CurrentUser => {
        // Wait until user is loaded and has at least one household
        return !!user && !!user.households && user.households.length > 0;
      }),
      map((user: CurrentUser) => {
        const householdId = user.households[0].householdId;
        if (!householdId) {
          throw new Error('No household available. Please ensure you are a member of a household.');
        }
        return householdId;
      }),
      take(1), // Take the first valid value
      timeout({
        each: 10000, // 10 second timeout (increased from 5)
        with: () => throwError(() => new Error('Timeout waiting for household to load. Please refresh the page.'))
      }),
      catchError(error => {
        console.error('[MaintenanceService] Error getting household ID:', error);
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
          return throwError(() => new Error('Your household information is still loading. Please wait a moment and try again.'));
        }
        return throwError(() => new Error('No household available. Please ensure you are a member of a household.'));
      })
    );
  }

  // ===== MAINTENANCE TASKS =====

  public loadMaintenanceTasks(): Observable<MaintenanceTask[]> {
    console.log('[MaintenanceService] Loading maintenance tasks');

    return this.getHouseholdId$().pipe(
      switchMap((householdId) => {
        console.log('[MaintenanceService] Loading maintenance tasks for household:', householdId);

        return this.getSupabaseClient$().pipe(
          switchMap(client => from(
            client
              .from('maintenance_tasks')
              .select(`
                *,
                priorities (name)
              `)
              .eq('household_id', householdId)
              .is('deleted_at', null)
              .order('due_date', { ascending: true })
          ))
        );
      }),
      map((response) => {
        if (response.error) {
          console.error('[MaintenanceService] Error from Supabase:', response.error);
          throw response.error;
        }
        console.log('[MaintenanceService] Raw data from Supabase:', response.data);
        const tasks = this.mapMaintenanceTasksFromSupabase(response.data || []);
        console.log('[MaintenanceService] Mapped tasks:', tasks);
        this.maintenanceTasksSignal.set(tasks);
        return tasks;
      }),
      catchError(error => {
        console.error('[MaintenanceService] Error loading maintenance tasks:', error);
        this.toastService.error('Error', 'Failed to load maintenance tasks');
        return of([]);
      })
    );
  }

  public addMaintenanceTask(task: any): Observable<MaintenanceTask> {
    // Get household ID (waiting for user profile if needed)
    return this.getHouseholdId$().pipe(
      switchMap((householdId) => {
        // Get current user ID for created_by/updated_by, then insert
        return this.getCurrentUserId$().pipe(
          switchMap((userId) => {
            if (!userId) {
              return throwError(() => new Error('User not authenticated'));
            }

            const taskData: any = {
              household_id: householdId,
          title: task.title,
          description: task.description || null,
          // priority_id: null, // TODO: Look up priority_id from priorities table based on task.priority
          status: task.status || 'pending',
          due_date: task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString().split('T')[0]) : null,
          service_provider_id: task.serviceProviderId || null,
          estimated_cost: task.estimatedCost || task.cost || null, // Use estimated_cost to match database schema
              notes: task.notes || null,
              created_by: userId,
              updated_by: userId
            };

            return this.getSupabaseClient$().pipe(
              switchMap(client => from(
                client
                  .from('maintenance_tasks')
                  .insert(taskData)
                  .select(`
                    *,
                    priorities (name)
                  `)
                  .single()
              ))
            );
          })
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newTask = this.mapMaintenanceTaskFromSupabase(response.data);
        this.addToSignal(this.maintenanceTasksSignal, newTask);
        this.toastService.success('Success', 'Maintenance task added successfully');
        return newTask;
      }),
      catchError(error => {
        console.error('Error adding maintenance task:', error);
        this.toastService.error('Error', 'Failed to add maintenance task');
        return throwError(() => error);
      })
    );
  }

  public updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Observable<MaintenanceTask> {
    // Get current user ID for updated_by, then update
    return this.getCurrentUserId$().pipe(
      switchMap((userId) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        const updateData: any = {};
        
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.category !== undefined) updateData.category = updates.category;
        // if (updates.priority !== undefined) updateData.priority_id = null; // TODO: Look up priority_id from priorities table
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.dueDate !== undefined) {
          updateData.due_date = updates.dueDate 
            ? (typeof updates.dueDate === 'string' ? updates.dueDate : updates.dueDate.toISOString().split('T')[0])
            : null;
        }
        if (updates.estimatedCost !== undefined) updateData.estimated_cost = updates.estimatedCost;
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
        if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
        
        // Always update updated_by
        updateData.updated_by = userId;

        return this.getSupabaseClient$().pipe(
          switchMap(client => from(
            client
              .from('maintenance_tasks')
              .update(updateData)
              .eq('id', id)
              .select(`
                *,
                priorities (name)
              `)
              .single()
          ))
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedTask = this.mapMaintenanceTaskFromSupabase(response.data);
        this.updateInSignal(this.maintenanceTasksSignal, updatedTask);
        this.toastService.success('Success', 'Maintenance task updated successfully');
        return updatedTask;
      }),
      catchError(error => {
        console.error('Error updating maintenance task:', error);
        this.toastService.error('Error', 'Failed to update maintenance task');
        return throwError(() => error);
      })
    );
  }

  public deleteMaintenanceTask(id: string): Observable<void> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => from(
        client
          .from('maintenance_tasks')
          .delete()
          .eq('id', id)
      ))
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.maintenanceTasksSignal, id);
        this.toastService.success('Success', 'Maintenance task deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting maintenance task:', error);
        this.toastService.error('Error', 'Failed to delete maintenance task');
        return throwError(() => error);
      })
    );
  }

  // ===== SERVICE PROVIDERS =====

  public loadServiceProviders(): Observable<ServiceProvider[]> {
    return this.getHouseholdId$().pipe(
      switchMap((householdId) => {
        return this.getSupabaseClient$().pipe(
          switchMap(client => from(
            client
              .from('service_providers')
              .select('*')
              .eq('household_id', householdId)
              .is('deleted_at', null)
              .order('name', { ascending: true })
          ))
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const providers = this.mapServiceProvidersFromSupabase(response.data || []);
        this.serviceProvidersSignal.set(providers);
        return providers;
      }),
      catchError(error => {
        console.error('Error loading service providers:', error);
        this.toastService.error('Error', 'Failed to load service providers');
        return of([]);
      })
    );
  }

  public addServiceProvider(provider: any): Observable<ServiceProvider> {
    return this.getHouseholdId$().pipe(
      switchMap((householdId) => {
        const providerData = {
          household_id: householdId,
          name: provider.name,
          service_type: provider.serviceType || null,
          contact_name: provider.contactName || null,
          phone: provider.phone || null,
          email: provider.email || null,
          address: provider.address || null,
          notes: provider.notes || null
        };

        return this.getSupabaseClient$().pipe(
          switchMap(client => from(
            client
              .from('service_providers')
              .insert(providerData)
              .select()
              .single()
          ))
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newProvider = this.mapServiceProviderFromSupabase(response.data);
        this.addToSignal(this.serviceProvidersSignal, newProvider);
        this.toastService.success('Success', 'Service provider added successfully');
        return newProvider;
      }),
      catchError(error => {
        console.error('Error adding service provider:', error);
        this.toastService.error('Error', 'Failed to add service provider');
        return throwError(() => error);
      })
    );
  }

  public updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Observable<ServiceProvider> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.website !== undefined) updateData.website = updates.website;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    return this.getSupabaseClient$().pipe(
      switchMap(client => from(
        client
          .from('service_providers')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
      ))
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedProvider = this.mapServiceProviderFromSupabase(response.data);
        this.updateInSignal(this.serviceProvidersSignal, updatedProvider);
        this.toastService.success('Success', 'Service provider updated successfully');
        return updatedProvider;
      }),
      catchError(error => {
        console.error('Error updating service provider:', error);
        this.toastService.error('Error', 'Failed to update service provider');
        return throwError(() => error);
      })
    );
  }

  public deleteServiceProvider(id: string): Observable<void> {
    return this.getSupabaseClient$().pipe(
      switchMap(client => from(
        client
          .from('service_providers')
          .delete()
          .eq('id', id)
      ))
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.serviceProvidersSignal, id);
        this.toastService.success('Success', 'Service provider deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting service provider:', error);
        this.toastService.error('Error', 'Failed to delete service provider');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapMaintenanceTaskFromSupabase(data: any): MaintenanceTask {
    return {
      id: data.id,
      title: data.title,
      category: data.category || 'other',
      priority: data.priorities?.name || data.priority || 'medium', // Get priority name from joined table or fallback
      status: data.status || 'pending',
      dueDate: data.due_date ? new Date(data.due_date) : new Date(),
      estimatedCost: data.estimated_cost || data.cost || undefined,
      serviceProvider: data.service_providers ? this.mapServiceProviderFromSupabase(data.service_providers) : undefined,
      notes: data.notes || undefined,
      isRecurring: data.is_recurring || false,
      frequency: data.frequency || undefined,
      completedDate: data.completed_date ? new Date(data.completed_date) : undefined
    };
  }

  private mapMaintenanceTasksFromSupabase(data: any[]): MaintenanceTask[] {
    return data.map(item => this.mapMaintenanceTaskFromSupabase(item));
  }

  private mapServiceProviderFromSupabase(data: any): ServiceProvider {
    return {
      id: data.id,
      name: data.name,
      category: data.category || data.service_type || 'other',
      phone: data.phone || '',
      email: data.email || undefined,
      website: data.website || undefined,
      rating: data.rating || undefined,
      notes: data.notes || undefined
    };
  }

  private mapServiceProvidersFromSupabase(data: any[]): ServiceProvider[] {
    return data.map(item => this.mapServiceProviderFromSupabase(item));
  }
}
