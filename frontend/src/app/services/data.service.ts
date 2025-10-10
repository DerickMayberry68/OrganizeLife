import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import type { 
  Transaction, 
  CreateTransactionDto,
  Budget, 
  CreateBudgetDto,
  Category,
  FinancialGoal, 
  Account, 
  Subscription 
} from '../models/financial.model';
import type { InventoryItem } from '../models/inventory.model';
import type { Document } from '../models/document.model';
import type { Insurance } from '../models/insurance.model';
import type { Bill } from '../models/bill.model';
import type { MaintenanceTask, ServiceProvider } from '../models/maintenance.model';
import type { DashboardStats, Alert } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly API_URL = 'https://localhost:7157/api';
  // Financial signals
  private readonly transactionsSignal = signal<Transaction[]>([]);
  private readonly budgetsSignal = signal<Budget[]>([]);
  private readonly financialGoalsSignal = signal<FinancialGoal[]>([]);
  private readonly accountsSignal = signal<Account[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);

  // Inventory signals
  private readonly inventoryItemsSignal = signal<InventoryItem[]>([]);

  // Document signals
  private readonly documentsSignal = signal<Document[]>([]);

  // Insurance signals
  private readonly insurancePoliciesSignal = signal<Insurance[]>([]);

  // Bills signals
  private readonly billsSignal = signal<Bill[]>([]);

  // Maintenance signals
  private readonly maintenanceTasksSignal = signal<MaintenanceTask[]>([]);
  private readonly serviceProvidersSignal = signal<ServiceProvider[]>([]);

  // Alerts signal
  private readonly alertsSignal = signal<Alert[]>([]);

  // Public readonly accessors
  public readonly transactions = this.transactionsSignal.asReadonly();
  public readonly budgets = this.budgetsSignal.asReadonly();
  public readonly financialGoals = this.financialGoalsSignal.asReadonly();
  public readonly accounts = this.accountsSignal.asReadonly();
  public readonly subscriptions = this.subscriptionsSignal.asReadonly();
  public readonly categories = this.categoriesSignal.asReadonly();
  public readonly inventoryItems = this.inventoryItemsSignal.asReadonly();
  public readonly documents = this.documentsSignal.asReadonly();
  public readonly insurancePolicies = this.insurancePoliciesSignal.asReadonly();
  public readonly bills = this.billsSignal.asReadonly();
  public readonly maintenanceTasks = this.maintenanceTasksSignal.asReadonly();
  public readonly serviceProviders = this.serviceProvidersSignal.asReadonly();
  public readonly alerts = this.alertsSignal.asReadonly();

  // Computed dashboard stats
  public readonly dashboardStats = computed<DashboardStats>(() => {
    const upcomingBills = this.billsSignal().filter(b => 
      b.status === 'pending' && 
      new Date(b.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    ).length;

    const overdueItems = this.billsSignal().filter(b => b.status === 'overdue').length;
    
    const maintenanceTasks = this.maintenanceTasksSignal().filter(t => 
      t.status === 'pending' || t.status === 'scheduled'
    ).length;

    const expiringDocuments = this.documentsSignal().filter(d => {
      if (!d.expiryDate) return false;
      const daysUntilExpiry = (new Date(d.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    }).length;

    const budgets = this.budgetsSignal();
    const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
    
    // Calculate total spent from transactions (filtered by current period)
    const transactions = this.transactionsSignal();
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    let budgetStatus: 'good' | 'warning' | 'critical' = 'good';
    if (percentageUsed >= 90) budgetStatus = 'critical';
    else if (percentageUsed >= 75) budgetStatus = 'warning';

    return {
      upcomingBills,
      overdueItems,
      maintenanceTasks,
      expiringDocuments,
      budgetStatus: {
        totalBudget,
        totalSpent,
        percentageUsed,
        status: budgetStatus
      },
      recentActivity: []
    };
  });

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock data for demonstration
    // Note: This will be replaced by real data from the API
    this.budgetsSignal.set([]);

    this.billsSignal.set([
      {
        id: '1',
        name: 'Electric Bill',
        amount: 145.50,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: 'Utilities',
        isRecurring: true,
        frequency: 'monthly',
        status: 'pending',
        autoPayEnabled: false,
        reminderDays: 3
      },
      {
        id: '2',
        name: 'Internet Service',
        amount: 89.99,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: 'Utilities',
        isRecurring: true,
        frequency: 'monthly',
        status: 'pending',
        autoPayEnabled: true,
        reminderDays: 3
      }
    ]);

    this.maintenanceTasksSignal.set([
      {
        id: '1',
        title: 'HVAC Filter Replacement',
        category: 'hvac',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedCost: 45,
        isRecurring: true,
        frequency: 'quarterly'
      },
      {
        id: '2',
        title: 'Gutter Cleaning',
        category: 'general',
        priority: 'high',
        status: 'scheduled',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedCost: 150,
        isRecurring: true,
        frequency: 'yearly'
      }
    ]);
  }

  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  private getHeaders() {
    const headers = this.authService.getAuthHeaders();
    // Ensure Content-Type is set to application/json
    if (!headers.has('Content-Type')) {
      return { 
        headers: headers.set('Content-Type', 'application/json')
      };
    }
    return { headers };
  }

  // ===== FINANCIAL API METHODS =====

  // Transactions
  public loadTransactions(): Observable<Transaction[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    console.log("Household ID:", householdId);

    return this.http.get<Transaction[]>(
      `${this.API_URL}/Transactions/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(transactions => this.transactionsSignal.set(transactions)),
      catchError(error => {
        console.error('Error loading transactions:', error);
        this.toastService.error('Error', 'Failed to load transactions');
        return of([]);
      })
    );
  }

  public addTransaction(dto: CreateTransactionDto): Observable<Transaction> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Transaction);
    }

    // Ensure householdId is set in the DTO and clean up the data
    // Convert date to DateOnly format (YYYY-MM-DD) for API compatibility
    let dateValue: string;
    if (dto.date instanceof Date) {
      // Format as DateOnly: "YYYY-MM-DD" (no time component)
      const year = dto.date.getFullYear();
      const month = String(dto.date.getMonth() + 1).padStart(2, '0');
      const day = String(dto.date.getDate()).padStart(2, '0');
      dateValue = `${year}-${month}-${day}`;
    } else {
      dateValue = dto.date;
    }
    
    const transactionDto: any = {
      householdId,
      accountId: dto.accountId,
      date: dateValue,
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      isRecurring: dto.isRecurring || false
    };
    
    // Only include optional fields if they have values (not null/undefined/empty)
    if (dto.categoryId) {
      transactionDto.categoryId = dto.categoryId;
    }
    if (dto.merchantName) {
      transactionDto.merchantName = dto.merchantName;
    }
    if (dto.notes) {
      transactionDto.notes = dto.notes;
    }
    if (dto.parentTransactionId) {
      transactionDto.parentTransactionId = dto.parentTransactionId;
    }

    console.log("Transaction DTO being sent:", JSON.stringify(transactionDto, null, 2));

    return this.http.post<Transaction>(
      `${this.API_URL}/Transactions`,
      transactionDto,
      this.getHeaders()
    ).pipe(
      tap(newTransaction => {
        this.transactionsSignal.update(items => [...items, newTransaction]);
        this.toastService.success('Success', 'Transaction added successfully');
      }),
      catchError(error => {
        console.error('Error adding transaction:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error.error object:', JSON.stringify(error.error, null, 2));
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message || error.message,
          errorBody: error.error
        });
        
        const errorMessage = error.error?.Message || error.error?.message || error.error?.title || 'Failed to add transaction';
        this.toastService.error('Error', errorMessage);
        throw error;
      })
    );
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.API_URL}/Transactions/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedTransaction => {
        this.transactionsSignal.update(items =>
          items.map(item => item.id === id ? updatedTransaction : item)
        );
        this.toastService.success('Success', 'Transaction updated successfully');
      }),
      catchError(error => {
        console.error('Error updating transaction:', error);
        this.toastService.error('Error', 'Failed to update transaction');
        throw error;
      })
    );
  }

  public deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Transactions/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.transactionsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Transaction deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting transaction:', error);
        this.toastService.error('Error', 'Failed to delete transaction');
        throw error;
      })
    );
  }

  // Budgets
  public loadBudgets(): Observable<Budget[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Budget[]>(
      `${this.API_URL}/Budgets/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(budgets => this.budgetsSignal.set(budgets)),
      catchError(error => {
        console.error('Error loading budgets:', error);
        this.toastService.error('Error', 'Failed to load budgets');
        return of([]);
      })
    );
  }

  public addBudget(dto: CreateBudgetDto): Observable<Budget> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Budget);
    }

    // Ensure householdId is set in the DTO and convert dates to DateOnly format
    const formatDateOnly = (date: Date | string): string => {
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return date;
    };
    
    const startDate = formatDateOnly(dto.startDate);
    const endDate = dto.endDate ? formatDateOnly(dto.endDate) : null;
    
    const budgetDto = {
      householdId,
      categoryId: dto.categoryId,
      name: dto.name,
      limitAmount: dto.limitAmount,
      period: dto.period,
      startDate: startDate,
      endDate: endDate,
      isActive: dto.isActive !== undefined ? dto.isActive : true
    };

    return this.http.post<Budget>(
      `${this.API_URL}/Budgets`,
      budgetDto,
      this.getHeaders()
    ).pipe(
      tap(newBudget => {
        this.budgetsSignal.update(items => [...items, newBudget]);
        this.toastService.success('Success', 'Budget added successfully');
      }),
      catchError(error => {
        console.error('Error adding budget:', error);
        this.toastService.error('Error', 'Failed to add budget');
        throw error;
      })
    );
  }

  public updateBudget(id: string, updates: Partial<Budget>): Observable<Budget> {
    return this.http.put<Budget>(
      `${this.API_URL}/Budgets/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedBudget => {
        this.budgetsSignal.update(items =>
          items.map(item => item.id === id ? updatedBudget : item)
        );
        this.toastService.success('Success', 'Budget updated successfully');
      }),
      catchError(error => {
        console.error('Error updating budget:', error);
        this.toastService.error('Error', 'Failed to update budget');
        throw error;
      })
    );
  }

  public deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Budgets/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.budgetsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Budget deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting budget:', error);
        this.toastService.error('Error', 'Failed to delete budget');
        throw error;
      })
    );
  }

  // Financial Goals
  public loadFinancialGoals(): Observable<FinancialGoal[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<FinancialGoal[]>(
      `${this.API_URL}/FinancialGoals/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(goals => this.financialGoalsSignal.set(goals)),
      catchError(error => {
        console.error('Error loading financial goals:', error);
        this.toastService.error('Error', 'Failed to load financial goals');
        return of([]);
      })
    );
  }

  public addFinancialGoal(goal: Omit<FinancialGoal, 'id'>): Observable<FinancialGoal> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as FinancialGoal);
    }

    return this.http.post<FinancialGoal>(
      `${this.API_URL}/FinancialGoals`,
      goal,
      this.getHeaders()
    ).pipe(
      tap(newGoal => {
        this.financialGoalsSignal.update(items => [...items, newGoal]);
        this.toastService.success('Success', 'Financial goal added successfully');
      }),
      catchError(error => {
        console.error('Error adding financial goal:', error);
        this.toastService.error('Error', 'Failed to add financial goal');
        throw error;
      })
    );
  }

  public updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Observable<FinancialGoal> {
    return this.http.put<FinancialGoal>(
      `${this.API_URL}/FinancialGoals/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedGoal => {
        this.financialGoalsSignal.update(items =>
          items.map(item => item.id === id ? updatedGoal : item)
        );
        this.toastService.success('Success', 'Financial goal updated successfully');
      }),
      catchError(error => {
        console.error('Error updating financial goal:', error);
        this.toastService.error('Error', 'Failed to update financial goal');
        throw error;
      })
    );
  }

  public deleteFinancialGoal(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/FinancialGoals/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.financialGoalsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Financial goal deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting financial goal:', error);
        this.toastService.error('Error', 'Failed to delete financial goal');
        throw error;
      })
    );
  }

  // Accounts
  public loadAccounts(): Observable<Account[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Account[]>(
      `${this.API_URL}/Accounts/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(accounts => this.accountsSignal.set(accounts)),
      catchError(error => {
        console.error('Error loading accounts:', error);
        this.toastService.error('Error', 'Failed to load accounts');
        return of([]);
      })
    );
  }

  public addAccount(account: Omit<Account, 'id'>): Observable<Account> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Account);
    }

    return this.http.post<Account>(
      `${this.API_URL}/Accounts`,
      account,
      this.getHeaders()
    ).pipe(
      tap(newAccount => {
        this.accountsSignal.update(items => [...items, newAccount]);
        this.toastService.success('Success', 'Account added successfully');
      }),
      catchError(error => {
        console.error('Error adding account:', error);
        this.toastService.error('Error', 'Failed to add account');
        throw error;
      })
    );
  }

  public updateAccount(id: string, updates: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(
      `${this.API_URL}/Accounts/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedAccount => {
        this.accountsSignal.update(items =>
          items.map(item => item.id === id ? updatedAccount : item)
        );
        this.toastService.success('Success', 'Account updated successfully');
      }),
      catchError(error => {
        console.error('Error updating account:', error);
        this.toastService.error('Error', 'Failed to update account');
        throw error;
      })
    );
  }

  public deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Accounts/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.accountsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Account deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        this.toastService.error('Error', 'Failed to delete account');
        throw error;
      })
    );
  }

  // Subscriptions
  public loadSubscriptions(): Observable<Subscription[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Subscription[]>(
      `${this.API_URL}/Subscriptions/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(subscriptions => this.subscriptionsSignal.set(subscriptions)),
      catchError(error => {
        console.error('Error loading subscriptions:', error);
        this.toastService.error('Error', 'Failed to load subscriptions');
        return of([]);
      })
    );
  }

  public addSubscription(subscription: Omit<Subscription, 'id'>): Observable<Subscription> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Subscription);
    }

    return this.http.post<Subscription>(
      `${this.API_URL}/Subscriptions`,
      subscription,
      this.getHeaders()
    ).pipe(
      tap(newSubscription => {
        this.subscriptionsSignal.update(items => [...items, newSubscription]);
        this.toastService.success('Success', 'Subscription added successfully');
      }),
      catchError(error => {
        console.error('Error adding subscription:', error);
        this.toastService.error('Error', 'Failed to add subscription');
        throw error;
      })
    );
  }

  public updateSubscription(id: string, updates: Partial<Subscription>): Observable<Subscription> {
    return this.http.put<Subscription>(
      `${this.API_URL}/Subscriptions/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedSubscription => {
        this.subscriptionsSignal.update(items =>
          items.map(item => item.id === id ? updatedSubscription : item)
        );
        this.toastService.success('Success', 'Subscription updated successfully');
      }),
      catchError(error => {
        console.error('Error updating subscription:', error);
        this.toastService.error('Error', 'Failed to update subscription');
        throw error;
      })
    );
  }

  public deleteSubscription(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Subscriptions/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.subscriptionsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Subscription deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting subscription:', error);
        this.toastService.error('Error', 'Failed to delete subscription');
        throw error;
      })
    );
  }

  // Categories
  public loadCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.API_URL}/Categories`,
      this.getHeaders()
    ).pipe(
      tap(categories => this.categoriesSignal.set(categories)),
      catchError(error => {
        console.error('Error loading categories:', error);
        this.toastService.error('Error', 'Failed to load categories');
        return of([]);
      })
    );
  }

  // ===== LEGACY METHODS (keeping for now for compatibility) =====

  public addBill(bill: Bill): void {
    this.billsSignal.update(items => [...items, bill]);
  }

  public updateBill(id: string, updates: Partial<Bill>): void {
    this.billsSignal.update(items => 
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }

  public deleteBill(id: string): void {
    this.billsSignal.update(items => items.filter(item => item.id !== id));
  }

  public addMaintenanceTask(task: MaintenanceTask): void {
    this.maintenanceTasksSignal.update(items => [...items, task]);
  }

  public updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): void {
    this.maintenanceTasksSignal.update(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }

  public addAlert(alert: Alert): void {
    this.alertsSignal.update(items => [...items, alert]);
  }

  public dismissAlert(id: string): void {
    this.alertsSignal.update(items => items.filter(item => item.id !== id));
  }
}

