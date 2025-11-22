import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { MaintenanceTask, ServiceProvider } from '../models/maintenance.model';

/**
 * Maintenance Service
 * Handles maintenance tasks and service provider operations using Supabase
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

  // ===== MAINTENANCE TASKS =====

  public loadMaintenanceTasks(): Observable<MaintenanceTask[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('maintenance_tasks')
        .select(`
          *,
          priorities (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('due_date', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const tasks = this.mapMaintenanceTasksFromSupabase(response.data || []);
        this.maintenanceTasksSignal.set(tasks);
        return tasks;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    // Get current user ID for created_by/updated_by, then insert
    return from(this.getCurrentUserId()).pipe(
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

        return from(
          this.supabase
            .from('maintenance_tasks')
            .insert(taskData)
            .select(`
              *,
              priorities (name)
            `)
            .single()
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
    return from(this.getCurrentUserId()).pipe(
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

        return from(
          this.supabase
            .from('maintenance_tasks')
            .update(updateData)
            .eq('id', id)
            .select(`
              *,
              priorities (name)
            `)
            .single()
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
    return from(
      this.supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id)
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
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('service_providers')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
    ).pipe(
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
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

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

    return from(
      this.supabase
        .from('service_providers')
        .insert(providerData)
        .select()
        .single()
    ).pipe(
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

    return from(
      this.supabase
        .from('service_providers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
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
    return from(
      this.supabase
        .from('service_providers')
        .delete()
        .eq('id', id)
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
