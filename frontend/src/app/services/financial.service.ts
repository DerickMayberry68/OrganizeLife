import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
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

/**
 * Financial Service
 * Handles all financial-related operations including transactions, budgets, goals, accounts, subscriptions, and categories
 */
@Injectable({
  providedIn: 'root'
})
export class FinancialService extends BaseApiService {
  private readonly authService = inject(AuthService);

  // Financial signals
  private readonly transactionsSignal = signal<Transaction[]>([]);
  private readonly budgetsSignal = signal<Budget[]>([]);
  private readonly financialGoalsSignal = signal<FinancialGoal[]>([]);
  private readonly accountsSignal = signal<Account[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);

  // Public readonly accessors
  public readonly transactions = this.transactionsSignal.asReadonly();
  public readonly budgets = this.budgetsSignal.asReadonly();
  public readonly financialGoals = this.financialGoalsSignal.asReadonly();
  public readonly accounts = this.accountsSignal.asReadonly();
  public readonly subscriptions = this.subscriptionsSignal.asReadonly();
  public readonly categories = this.categoriesSignal.asReadonly();

  // Computed values
  public readonly totalIncome = computed(() =>
    this.transactionsSignal()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  public readonly totalExpenses = computed(() =>
    this.transactionsSignal()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  public readonly netBalance = computed(() =>
    this.totalIncome() - this.totalExpenses()
  );

  public readonly activeSubscriptions = computed(() =>
    this.subscriptionsSignal() // All subscriptions are considered active
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
   * Format date to DateOnly format (YYYY-MM-DD)
   */
  private formatDateOnly(date: Date | string): string {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  // ===== TRANSACTIONS =====

  public loadTransactions(): Observable<Transaction[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

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

    const transactionDto: any = {
      householdId,
      accountId: dto.accountId,
      date: this.formatDateOnly(dto.date),
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      isRecurring: dto.isRecurring || false
    };

    // Only include optional fields if they have values
    if (dto.categoryId) transactionDto.categoryId = dto.categoryId;
    if (dto.merchantName) transactionDto.merchantName = dto.merchantName;
    if (dto.notes) transactionDto.notes = dto.notes;
    if (dto.parentTransactionId) transactionDto.parentTransactionId = dto.parentTransactionId;

    return this.http.post<Transaction>(
      `${this.API_URL}/Transactions`,
      transactionDto,
      this.getHeaders()
    ).pipe(
      tap(newTransaction => {
        this.addToSignal(this.transactionsSignal, newTransaction);
        this.toastService.success('Success', 'Transaction added successfully');
      }),
      catchError(error => {
        console.error('Error adding transaction:', error);
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
        this.updateInSignal(this.transactionsSignal, updatedTransaction);
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
        this.removeFromSignal(this.transactionsSignal, id);
        this.toastService.success('Success', 'Transaction deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting transaction:', error);
        this.toastService.error('Error', 'Failed to delete transaction');
        throw error;
      })
    );
  }

  // ===== BUDGETS =====

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

    const budgetDto = {
      householdId,
      categoryId: dto.categoryId,
      name: dto.name,
      limitAmount: dto.limitAmount,
      period: dto.period,
      startDate: this.formatDateOnly(dto.startDate),
      endDate: dto.endDate ? this.formatDateOnly(dto.endDate) : null,
      isActive: dto.isActive !== undefined ? dto.isActive : true
    };

    return this.http.post<Budget>(
      `${this.API_URL}/Budgets`,
      budgetDto,
      this.getHeaders()
    ).pipe(
      tap(newBudget => {
        this.addToSignal(this.budgetsSignal, newBudget);
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
        this.updateInSignal(this.budgetsSignal, updatedBudget);
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
        this.removeFromSignal(this.budgetsSignal, id);
        this.toastService.success('Success', 'Budget deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting budget:', error);
        this.toastService.error('Error', 'Failed to delete budget');
        throw error;
      })
    );
  }

  // ===== FINANCIAL GOALS =====

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

  public addFinancialGoal(goal: any): Observable<FinancialGoal> {
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
        this.addToSignal(this.financialGoalsSignal, newGoal);
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
        this.updateInSignal(this.financialGoalsSignal, updatedGoal);
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
        this.removeFromSignal(this.financialGoalsSignal, id);
        this.toastService.success('Success', 'Financial goal deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting financial goal:', error);
        this.toastService.error('Error', 'Failed to delete financial goal');
        throw error;
      })
    );
  }

  // ===== ACCOUNTS =====

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

  public addAccount(account: any): Observable<Account> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Account);
    }

    const createAccountDto = {
      householdId: householdId,
      name: account.name,
      type: account.type,
      institutionName: account.institutionName,
      balance: account.balance,
      currency: account.currency || 'USD',
      isActive: account.isActive !== undefined ? account.isActive : true
    };

    return this.http.post<Account>(
      `${this.API_URL}/Accounts`,
      createAccountDto,
      this.getHeaders()
    ).pipe(
      tap(newAccount => {
        this.addToSignal(this.accountsSignal, newAccount);
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
        this.updateInSignal(this.accountsSignal, updatedAccount);
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
        this.removeFromSignal(this.accountsSignal, id);
        this.toastService.success('Success', 'Account deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        this.toastService.error('Error', 'Failed to delete account');
        throw error;
      })
    );
  }

  // ===== SUBSCRIPTIONS =====

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

  public addSubscription(subscription: any): Observable<Subscription> {
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
        this.addToSignal(this.subscriptionsSignal, newSubscription);
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
        this.updateInSignal(this.subscriptionsSignal, updatedSubscription);
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
        this.removeFromSignal(this.subscriptionsSignal, id);
        this.toastService.success('Success', 'Subscription deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting subscription:', error);
        this.toastService.error('Error', 'Failed to delete subscription');
        throw error;
      })
    );
  }

  // ===== CATEGORIES =====

  public loadCategories(): Observable<Category[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

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

  public addCategory(category: any): Observable<Category> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return of({} as Category);
    }

    return this.http.post<Category>(
      `${this.API_URL}/Categories`,
      category,
      this.getHeaders()
    ).pipe(
      tap(newCategory => {
        this.addToSignal(this.categoriesSignal, newCategory);
        this.toastService.success('Success', 'Category added successfully');
      }),
      catchError(error => {
        console.error('Error adding category:', error);
        this.toastService.error('Error', 'Failed to add category');
        throw error;
      })
    );
  }

  public updateCategory(id: string, updates: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(
      `${this.API_URL}/Categories/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedCategory => {
        this.updateInSignal(this.categoriesSignal, updatedCategory);
        this.toastService.success('Success', 'Category updated successfully');
      }),
      catchError(error => {
        console.error('Error updating category:', error);
        this.toastService.error('Error', 'Failed to update category');
        throw error;
      })
    );
  }

  public deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Categories/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.categoriesSignal, id);
        this.toastService.success('Success', 'Category deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting category:', error);
        this.toastService.error('Error', 'Failed to delete category');
        throw error;
      })
    );
  }
}

