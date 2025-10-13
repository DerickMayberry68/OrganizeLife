import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
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
import type { DashboardStats } from '../models/dashboard.model';
import type { Doctor, Appointment, Prescription, MedicalRecord, HealthcareStats } from '../models/healthcare.model';
import type { Alert, AlertStats } from '../models/alert.model';

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

  // Healthcare signals
  private readonly doctorsSignal = signal<Doctor[]>([]);
  private readonly appointmentsSignal = signal<Appointment[]>([]);
  private readonly prescriptionsSignal = signal<Prescription[]>([]);
  private readonly medicalRecordsSignal = signal<MedicalRecord[]>([]);

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
  public readonly doctors = this.doctorsSignal.asReadonly();
  public readonly appointments = this.appointmentsSignal.asReadonly();
  public readonly prescriptions = this.prescriptionsSignal.asReadonly();
  public readonly medicalRecords = this.medicalRecordsSignal.asReadonly();

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

  // Computed healthcare stats
  public readonly healthcareStats = computed<HealthcareStats>(() => {
    const now = new Date();
    const upcomingAppointments = this.appointmentsSignal().filter(apt =>
      apt.status === 'scheduled' &&
      new Date(apt.date) >= now
    ).length;

    const activePrescriptions = this.prescriptionsSignal().filter(rx =>
      rx.isActive
    ).length;

    const prescriptionsNeedingRefill = this.prescriptionsSignal().filter(rx =>
      rx.isActive &&
      rx.refillsRemaining <= 2 &&
      (!rx.nextRefillDate || new Date(rx.nextRefillDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    ).length;

    const doctorsCount = this.doctorsSignal().length;

    return {
      upcomingAppointments,
      activePrescriptions,
      prescriptionsNeedingRefill,
      doctorsCount
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

  // ===== BILLS API METHODS =====

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

  public addBill(bill: Omit<Bill, 'id'>): Observable<Bill> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Bill);
    }

    const billDto = { ...bill, householdId };

    return this.http.post<Bill>(
      `${this.API_URL}/Bills`,
      billDto,
      this.getHeaders()
    ).pipe(
      tap(newBill => {
        this.billsSignal.update(items => [...items, newBill]);
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
    this.billsSignal.update(items => 
          items.map(item => item.id === id ? updatedBill : item)
        );
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
    this.billsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Bill deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting bill:', error);
        this.toastService.error('Error', 'Failed to delete bill');
        throw error;
      })
    );
  }

  public markBillPaid(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/Bills/${id}/mark-paid`,
      {},
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.toastService.success('Success', 'Bill marked as paid');
        this.loadBills().subscribe();
      }),
      catchError(error => {
        console.error('Error marking bill as paid:', error);
        this.toastService.error('Error', 'Failed to mark bill as paid');
        throw error;
      })
    );
  }

  public loadUpcomingBills(): Observable<Bill[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) return of([]);

    return this.http.get<Bill[]>(
      `${this.API_URL}/Bills/household/${householdId}/upcoming`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading upcoming bills:', error);
        return of([]);
      })
    );
  }

  // ===== PAYMENTS API METHODS =====

  public loadPayments(): Observable<any[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) return of([]);

    return this.http.get<any[]>(
      `${this.API_URL}/Payments/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading payments:', error);
        this.toastService.error('Error', 'Failed to load payments');
        return of([]);
      })
    );
  }

  public addPayment(payment: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/Payments`,
      payment,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.toastService.success('Success', 'Payment recorded successfully');
      }),
      catchError(error => {
        console.error('Error adding payment:', error);
        this.toastService.error('Error', 'Failed to record payment');
        throw error;
      })
    );
  }

  // ===== MAINTENANCE API METHODS =====
  // TODO: Backend endpoints need to be implemented
  // Expected endpoints:
  // GET    /api/Maintenance/household/{householdId}
  // POST   /api/Maintenance
  // PUT    /api/Maintenance/{id}
  // DELETE /api/Maintenance/{id}
  // POST   /api/Maintenance/{id}/complete

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

  public addMaintenanceTask(task: Omit<MaintenanceTask, 'id'>): Observable<MaintenanceTask> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as MaintenanceTask);
    }

    const taskDto = { ...task, householdId };

    return this.http.post<MaintenanceTask>(
      `${this.API_URL}/Maintenance`,
      taskDto,
      this.getHeaders()
    ).pipe(
      tap(newTask => {
        this.maintenanceTasksSignal.update(items => [...items, newTask]);
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
      `${this.API_URL}/Maintenance/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedTask => {
    this.maintenanceTasksSignal.update(items =>
          items.map(item => item.id === id ? updatedTask : item)
        );
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
      `${this.API_URL}/Maintenance/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.maintenanceTasksSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Maintenance task deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting maintenance task:', error);
        this.toastService.error('Error', 'Failed to delete maintenance task');
        throw error;
      })
    );
  }

  public completeMaintenanceTask(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/Maintenance/${id}/complete`,
      {},
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.toastService.success('Success', 'Maintenance task completed successfully');
        this.loadMaintenanceTasks().subscribe();
      }),
      catchError(error => {
        console.error('Error completing maintenance task:', error);
        this.toastService.error('Error', 'Failed to complete maintenance task');
        throw error;
      })
    );
  }

  // ===== DOCUMENTS API METHODS =====

  public loadDocuments(): Observable<Document[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Document[]>(
      `${this.API_URL}/Documents/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(documents => this.documentsSignal.set(documents)),
      catchError(error => {
        console.error('Error loading documents:', error);
        this.toastService.error('Error', 'Failed to load documents');
        return of([]);
      })
    );
  }

  public addDocument(document: Omit<Document, 'id'>): Observable<Document> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Document);
    }

    const documentDto = { ...document, householdId };

    return this.http.post<Document>(
      `${this.API_URL}/Documents`,
      documentDto,
      this.getHeaders()
    ).pipe(
      tap(newDocument => {
        this.documentsSignal.update(items => [...items, newDocument]);
        this.toastService.success('Success', 'Document added successfully');
      }),
      catchError(error => {
        console.error('Error adding document:', error);
        this.toastService.error('Error', 'Failed to add document');
        throw error;
      })
    );
  }

  public updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(
      `${this.API_URL}/Documents/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedDocument => {
    this.documentsSignal.update(items =>
          items.map(item => item.id === id ? updatedDocument : item)
        );
        this.toastService.success('Success', 'Document updated successfully');
      }),
      catchError(error => {
        console.error('Error updating document:', error);
        this.toastService.error('Error', 'Failed to update document');
        throw error;
      })
    );
  }

  public deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Documents/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
    this.documentsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Document deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting document:', error);
        this.toastService.error('Error', 'Failed to delete document');
        throw error;
      })
    );
  }

  // ===== INSURANCE API METHODS =====

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

  public addInsurancePolicy(policy: Omit<Insurance, 'id'>): Observable<Insurance> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Insurance);
    }

    const policyDto = { ...policy, householdId };

    return this.http.post<Insurance>(
      `${this.API_URL}/Insurance`,
      policyDto,
      this.getHeaders()
    ).pipe(
      tap(newPolicy => {
        this.insurancePoliciesSignal.update(items => [...items, newPolicy]);
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
        this.insurancePoliciesSignal.update(items =>
          items.map(item => item.id === id ? updatedPolicy : item)
        );
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
        this.insurancePoliciesSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Insurance policy deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting insurance policy:', error);
        this.toastService.error('Error', 'Failed to delete insurance policy');
        throw error;
      })
    );
  }

  // ===== INVENTORY API METHODS =====

  public loadInventoryItems(): Observable<InventoryItem[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<InventoryItem[]>(
      `${this.API_URL}/Inventory/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(items => this.inventoryItemsSignal.set(items)),
      catchError(error => {
        console.error('Error loading inventory items:', error);
        this.toastService.error('Error', 'Failed to load inventory items');
        return of([]);
      })
    );
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id'>): Observable<InventoryItem> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as InventoryItem);
    }

    const itemDto = { ...item, householdId };

    return this.http.post<InventoryItem>(
      `${this.API_URL}/Inventory`,
      itemDto,
      this.getHeaders()
    ).pipe(
      tap(newItem => {
        this.inventoryItemsSignal.update(items => [...items, newItem]);
        this.toastService.success('Success', 'Inventory item added successfully');
      }),
      catchError(error => {
        console.error('Error adding inventory item:', error);
        this.toastService.error('Error', 'Failed to add inventory item');
        throw error;
      })
    );
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(
      `${this.API_URL}/Inventory/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedItem => {
        this.inventoryItemsSignal.update(items =>
          items.map(item => item.id === id ? updatedItem : item)
        );
        this.toastService.success('Success', 'Inventory item updated successfully');
      }),
      catchError(error => {
        console.error('Error updating inventory item:', error);
        this.toastService.error('Error', 'Failed to update inventory item');
        throw error;
      })
    );
  }

  public deleteInventoryItem(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Inventory/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.inventoryItemsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Inventory item deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting inventory item:', error);
        this.toastService.error('Error', 'Failed to delete inventory item');
        throw error;
      })
    );
  }

  // ===== HEALTHCARE API METHODS =====

  // Healthcare Providers (Doctors)
  public loadHealthcareProviders(): Observable<Doctor[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Doctor[]>(
      `${this.API_URL}/Healthcare/household/${householdId}/providers`,
      this.getHeaders()
    ).pipe(
      tap(providers => this.doctorsSignal.set(providers)),
      catchError(error => {
        console.error('Error loading healthcare providers:', error);
        this.toastService.error('Error', 'Failed to load healthcare providers');
        return of([]);
      })
    );
  }

  // Load Doctors from API
  public loadDoctors(): Observable<Doctor[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of([]);
    }

    return this.http.get<Doctor[]>(
      `${this.API_URL}/Healthcare/household/${householdId}/providers`,
      this.getHeaders()
    ).pipe(
      tap(doctors => {
        this.doctorsSignal.set(doctors);
      }),
      catchError(error => {
        console.error('Error loading doctors:', error);
        return of([]);
      })
    );
  }

  public addDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Doctor);
    }

    const providerDto = { ...doctor, householdId };

    return this.http.post<Doctor>(
      `${this.API_URL}/Healthcare/providers`,
      providerDto,
      this.getHeaders()
    ).pipe(
      tap(newProvider => {
        this.doctorsSignal.update(items => [...items, newProvider]);
        this.toastService.success('Success', 'Healthcare provider added successfully');
      }),
      catchError(error => {
        console.error('Error adding healthcare provider:', error);
        this.toastService.error('Error', 'Failed to add healthcare provider');
        throw error;
      })
    );
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(
      `${this.API_URL}/Healthcare/providers/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedProvider => {
        this.doctorsSignal.update(items =>
          items.map(item => item.id === id ? updatedProvider : item)
        );
        this.toastService.success('Success', 'Healthcare provider updated successfully');
      }),
      catchError(error => {
        console.error('Error updating healthcare provider:', error);
        this.toastService.error('Error', 'Failed to update healthcare provider');
        throw error;
      })
    );
  }

  public deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Healthcare/providers/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.doctorsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Healthcare provider deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting healthcare provider:', error);
        this.toastService.error('Error', 'Failed to delete healthcare provider');
        throw error;
      })
    );
  }

  // Appointments
  public loadAppointments(): Observable<Appointment[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Appointment[]>(
      `${this.API_URL}/Appointments/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(appointments => this.appointmentsSignal.set(appointments)),
      catchError(error => {
        console.error('Error loading appointments:', error);
        this.toastService.error('Error', 'Failed to load appointments');
        return of([]);
      })
    );
  }

  public addAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Appointment);
    }

    const appointmentDto = { ...appointment, householdId };

    return this.http.post<Appointment>(
      `${this.API_URL}/Appointments`,
      appointmentDto,
      this.getHeaders()
    ).pipe(
      tap(newAppointment => {
        this.appointmentsSignal.update(items => [...items, newAppointment]);
        this.toastService.success('Success', 'Appointment scheduled successfully');
      }),
      catchError(error => {
        console.error('Error scheduling appointment:', error);
        this.toastService.error('Error', 'Failed to schedule appointment');
        throw error;
      })
    );
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.API_URL}/Appointments/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedAppointment => {
        this.appointmentsSignal.update(items =>
          items.map(item => item.id === id ? updatedAppointment : item)
        );
        this.toastService.success('Success', 'Appointment updated successfully');
      }),
      catchError(error => {
        console.error('Error updating appointment:', error);
        this.toastService.error('Error', 'Failed to update appointment');
        throw error;
      })
    );
  }

  public deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Appointments/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.appointmentsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Appointment cancelled successfully');
      }),
      catchError(error => {
        console.error('Error cancelling appointment:', error);
        this.toastService.error('Error', 'Failed to cancel appointment');
        throw error;
      })
    );
  }

  public cancelAppointment(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/Appointments/${id}/cancel`,
      {},
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.toastService.success('Success', 'Appointment cancelled successfully');
        this.loadAppointments().subscribe();
      }),
      catchError(error => {
        console.error('Error cancelling appointment:', error);
        this.toastService.error('Error', 'Failed to cancel appointment');
        throw error;
      })
    );
  }

  public loadUpcomingAppointments(): Observable<Appointment[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) return of([]);

    return this.http.get<Appointment[]>(
      `${this.API_URL}/Appointments/household/${householdId}/upcoming`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading upcoming appointments:', error);
        return of([]);
      })
    );
  }

  // Medications (Prescriptions)
  public loadMedications(): Observable<Prescription[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Prescription[]>(
      `${this.API_URL}/Medications/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(medications => this.prescriptionsSignal.set(medications)),
      catchError(error => {
        console.error('Error loading medications:', error);
        this.toastService.error('Error', 'Failed to load medications');
        return of([]);
      })
    );
  }

  // Load Prescriptions from API
  public loadPrescriptions(): Observable<Prescription[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of([]);
    }

    return this.http.get<Prescription[]>(
      `${this.API_URL}/Healthcare/household/${householdId}/medications`,
      this.getHeaders()
    ).pipe(
      tap(prescriptions => {
        this.prescriptionsSignal.set(prescriptions);
      }),
      catchError(error => {
        console.error('Error loading prescriptions:', error);
        return of([]);
      })
    );
  }

  public addPrescription(prescription: Omit<Prescription, 'id'>): Observable<Prescription> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Prescription);
    }

    const medicationDto = { ...prescription, householdId };

    return this.http.post<Prescription>(
      `${this.API_URL}/Medications`,
      medicationDto,
      this.getHeaders()
    ).pipe(
      tap(newMedication => {
        this.prescriptionsSignal.update(items => [...items, newMedication]);
        this.toastService.success('Success', 'Prescription added successfully');
      }),
      catchError(error => {
        console.error('Error adding prescription:', error);
        this.toastService.error('Error', 'Failed to add prescription');
        throw error;
      })
    );
  }

  public updatePrescription(id: string, updates: Partial<Prescription>): Observable<Prescription> {
    return this.http.put<Prescription>(
      `${this.API_URL}/Medications/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedMedication => {
        this.prescriptionsSignal.update(items =>
          items.map(item => item.id === id ? updatedMedication : item)
        );
        this.toastService.success('Success', 'Prescription updated successfully');
      }),
      catchError(error => {
        console.error('Error updating prescription:', error);
        this.toastService.error('Error', 'Failed to update prescription');
        throw error;
      })
    );
  }

  public deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Medications/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.prescriptionsSignal.update(items => items.filter(item => item.id !== id));
        this.toastService.success('Success', 'Prescription deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting prescription:', error);
        this.toastService.error('Error', 'Failed to delete prescription');
        throw error;
      })
    );
  }

  // Medical Records (Legacy - keeping local methods for now)
  public addMedicalRecord(record: MedicalRecord): void {
    this.medicalRecordsSignal.update(items => [...items, record]);
  }

  public updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): void {
    this.medicalRecordsSignal.update(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }

  public deleteMedicalRecord(id: string): void {
    this.medicalRecordsSignal.update(items => items.filter(item => item.id !== id));
  }

  // ===== ALERTS API METHODS =====
  
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
        this.toastService.error('Error', 'Failed to load alerts');
        return of([]);
      })
    );
  }

  public markAlertAsRead(id: string): Observable<Alert> {
    return this.http.post<Alert>(
      `${this.API_URL}/Alerts/${id}/mark-read`,
      {},
      this.getHeaders()
    ).pipe(
      tap(updatedAlert => {
        this.alertsSignal.update(alerts =>
          alerts.map(a => a.id === id ? updatedAlert : a)
        );
      }),
      catchError(error => {
        console.error('Error marking alert as read:', error);
        this.toastService.error('Error', 'Failed to mark alert as read');
        throw error;
      })
    );
  }

  public dismissAlert(id: string): Observable<Alert> {
    return this.http.post<Alert>(
      `${this.API_URL}/Alerts/${id}/dismiss`,
      {},
      this.getHeaders()
    ).pipe(
      tap(updatedAlert => {
        this.alertsSignal.update(alerts =>
          alerts.map(a => a.id === id ? updatedAlert : a)
        );
      }),
      catchError(error => {
        console.error('Error dismissing alert:', error);
        this.toastService.error('Error', 'Failed to dismiss alert');
        throw error;
      })
    );
  }

  public deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Alerts/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.alertsSignal.update(alerts => alerts.filter(a => a.id !== id));
        this.toastService.success('Success', 'Alert deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting alert:', error);
        this.toastService.error('Error', 'Failed to delete alert');
        throw error;
      })
    );
  }

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
        this.alertsSignal.update(alerts =>
          alerts.map(a => ({ ...a, isRead: true, readAt: new Date() }))
        );
      }),
      catchError(error => {
        console.error('Error marking all alerts as read:', error);
        this.toastService.error('Error', 'Failed to mark all alerts as read');
        throw error;
      })
    );
  }

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
        this.alertsSignal.update(alerts =>
          alerts.map(a => ({ ...a, isDismissed: true, dismissedAt: new Date() }))
        );
      }),
      catchError(error => {
        console.error('Error dismissing all alerts:', error);
        this.toastService.error('Error', 'Failed to dismiss all alerts');
        throw error;
      })
    );
  }

  public getUnreadAlerts(): Observable<Alert[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return of([]);
    }

    return this.http.get<Alert[]>(
      `${this.API_URL}/Alerts/household/${householdId}/unread`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading unread alerts:', error);
        return of([]);
      })
    );
  }

  public getAlertStats(): Observable<AlertStats> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return of({
        totalAlerts: 0,
        unreadAlerts: 0,
        criticalAlerts: 0,
        highPriorityAlerts: 0,
        alertsByCategory: {},
        alertsBySeverity: {}
      });
    }

    return this.http.get<AlertStats>(
      `${this.API_URL}/Alerts/household/${householdId}/stats`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading alert stats:', error);
        return of({
          totalAlerts: 0,
          unreadAlerts: 0,
          criticalAlerts: 0,
          highPriorityAlerts: 0,
          alertsByCategory: {},
          alertsBySeverity: {}
        });
      })
    );
  }
}

