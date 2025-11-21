import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
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
 * Handles all financial-related operations including transactions, budgets, goals, accounts, subscriptions, and categories using Supabase
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

    return from(
      this.supabase
        .from('transactions')
        .select(`
          *,
          accounts:account_id (name),
          categories:category_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('date', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const transactions = this.mapTransactionsFromSupabase(response.data || []);
        this.transactionsSignal.set(transactions);
        return transactions;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const transactionData: any = {
      household_id: householdId,
      account_id: dto.accountId,
      date: this.formatDateOnly(dto.date),
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      is_recurring: dto.isRecurring || false
    };

    if (dto.categoryId) transactionData.category_id = dto.categoryId;
    if (dto.merchantName) transactionData.merchant_name = dto.merchantName;
    if (dto.notes) transactionData.notes = dto.notes;
    if (dto.parentTransactionId) transactionData.parent_transaction_id = dto.parentTransactionId;

    return from(
      this.supabase
        .from('transactions')
        .insert(transactionData)
        .select(`
          *,
          accounts:account_id (name),
          categories:category_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newTransaction = this.mapTransactionFromSupabase(response.data);
        this.addToSignal(this.transactionsSignal, newTransaction);
        this.toastService.success('Success', 'Transaction added successfully');
        return newTransaction;
      }),
      catchError(error => {
        console.error('Error adding transaction:', error);
        const errorMessage = error.message || error.error?.message || 'Failed to add transaction';
        this.toastService.error('Error', errorMessage);
        return throwError(() => error);
      })
    );
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    const updateData: any = {};
    
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.date !== undefined) updateData.date = this.formatDateOnly(updates.date);
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.merchantName !== undefined) updateData.merchant_name = updates.merchantName;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.parentTransactionId !== undefined) updateData.parent_transaction_id = updates.parentTransactionId;

    return from(
      this.supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          accounts:account_id (name),
          categories:category_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedTransaction = this.mapTransactionFromSupabase(response.data);
        this.updateInSignal(this.transactionsSignal, updatedTransaction);
        this.toastService.success('Success', 'Transaction updated successfully');
        return updatedTransaction;
      }),
      catchError(error => {
        console.error('Error updating transaction:', error);
        this.toastService.error('Error', 'Failed to update transaction');
        return throwError(() => error);
      })
    );
  }

  public deleteTransaction(id: string): Observable<void> {
    return from(
      this.supabase
        .from('transactions')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.transactionsSignal, id);
        this.toastService.success('Success', 'Transaction deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting transaction:', error);
        this.toastService.error('Error', 'Failed to delete transaction');
        return throwError(() => error);
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

    return from(
      this.supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('start_date', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const budgets = this.mapBudgetsFromSupabase(response.data || []);
        this.budgetsSignal.set(budgets);
        return budgets;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const budgetData = {
      household_id: householdId,
      category_id: dto.categoryId,
      name: dto.name,
      limit_amount: dto.limitAmount,
      period: dto.period,
      start_date: this.formatDateOnly(dto.startDate),
      end_date: dto.endDate ? this.formatDateOnly(dto.endDate) : null,
      is_active: dto.isActive !== undefined ? dto.isActive : true
    };

    return from(
      this.supabase
        .from('budgets')
        .insert(budgetData)
        .select(`
          *,
          categories:category_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newBudget = this.mapBudgetFromSupabase(response.data);
        this.addToSignal(this.budgetsSignal, newBudget);
        this.toastService.success('Success', 'Budget added successfully');
        return newBudget;
      }),
      catchError(error => {
        console.error('Error adding budget:', error);
        this.toastService.error('Error', 'Failed to add budget');
        return throwError(() => error);
      })
    );
  }

  public updateBudget(id: string, updates: Partial<Budget>): Observable<Budget> {
    const updateData: any = {};
    
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.limitAmount !== undefined) updateData.limit_amount = updates.limitAmount;
    if (updates.period !== undefined) updateData.period = updates.period;
    if (updates.startDate !== undefined) updateData.start_date = this.formatDateOnly(updates.startDate);
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate ? this.formatDateOnly(updates.endDate) : null;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    return from(
      this.supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          categories:category_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedBudget = this.mapBudgetFromSupabase(response.data);
        this.updateInSignal(this.budgetsSignal, updatedBudget);
        this.toastService.success('Success', 'Budget updated successfully');
        return updatedBudget;
      }),
      catchError(error => {
        console.error('Error updating budget:', error);
        this.toastService.error('Error', 'Failed to update budget');
        return throwError(() => error);
      })
    );
  }

  public deleteBudget(id: string): Observable<void> {
    return from(
      this.supabase
        .from('budgets')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.budgetsSignal, id);
        this.toastService.success('Success', 'Budget deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting budget:', error);
        this.toastService.error('Error', 'Failed to delete budget');
        return throwError(() => error);
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

    return from(
      this.supabase
        .from('financial_goals')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('deadline', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const goals = this.mapFinancialGoalsFromSupabase(response.data || []);
        this.financialGoalsSignal.set(goals);
        return goals;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const goalData = {
      household_id: householdId,
      name: goal.name,
      description: goal.description || null,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount || 0,
      deadline: goal.deadline ? this.formatDateOnly(goal.deadline) : null,
      priority_id: goal.priorityId || null,
      is_achieved: goal.isAchieved || false
    };

    return from(
      this.supabase
        .from('financial_goals')
        .insert(goalData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newGoal = this.mapFinancialGoalFromSupabase(response.data);
        this.addToSignal(this.financialGoalsSignal, newGoal);
        this.toastService.success('Success', 'Financial goal added successfully');
        return newGoal;
      }),
      catchError(error => {
        console.error('Error adding financial goal:', error);
        this.toastService.error('Error', 'Failed to add financial goal');
        return throwError(() => error);
      })
    );
  }

  public updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Observable<FinancialGoal> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
    if (updates.deadline !== undefined) {
      updateData.deadline = updates.deadline ? this.formatDateOnly(updates.deadline) : null;
    }
    if (updates.priority !== undefined) {
      // Priority is stored as priority_id in DB, but the model uses priority string
      // We'll need to map it appropriately
    }

    return from(
      this.supabase
        .from('financial_goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedGoal = this.mapFinancialGoalFromSupabase(response.data);
        this.updateInSignal(this.financialGoalsSignal, updatedGoal);
        this.toastService.success('Success', 'Financial goal updated successfully');
        return updatedGoal;
      }),
      catchError(error => {
        console.error('Error updating financial goal:', error);
        this.toastService.error('Error', 'Failed to update financial goal');
        return throwError(() => error);
      })
    );
  }

  public deleteFinancialGoal(id: string): Observable<void> {
    return from(
      this.supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.financialGoalsSignal, id);
        this.toastService.success('Success', 'Financial goal deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting financial goal:', error);
        this.toastService.error('Error', 'Failed to delete financial goal');
        return throwError(() => error);
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

    return from(
      this.supabase
        .from('accounts')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const accounts = this.mapAccountsFromSupabase(response.data || []);
        this.accountsSignal.set(accounts);
        return accounts;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const accountData = {
      household_id: householdId,
      name: account.name,
      type: account.type,
      institution: account.institutionName,
      balance: account.balance || 0,
      currency: account.currency || 'USD',
      is_active: account.isActive !== undefined ? account.isActive : true
    };

    return from(
      this.supabase
        .from('accounts')
        .insert(accountData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newAccount = this.mapAccountFromSupabase(response.data);
        this.addToSignal(this.accountsSignal, newAccount);
        this.toastService.success('Success', 'Account added successfully');
        return newAccount;
      }),
      catchError(error => {
        console.error('Error adding account:', error);
        this.toastService.error('Error', 'Failed to add account');
        return throwError(() => error);
      })
    );
  }

  public updateAccount(id: string, updates: Partial<Account>): Observable<Account> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.institution !== undefined) updateData.institution = updates.institution;
    if (updates.balance !== undefined) updateData.balance = updates.balance;
    if (updates.lastUpdated !== undefined) updateData.last_synced_at = updates.lastUpdated.toISOString();

    return from(
      this.supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedAccount = this.mapAccountFromSupabase(response.data);
        this.updateInSignal(this.accountsSignal, updatedAccount);
        this.toastService.success('Success', 'Account updated successfully');
        return updatedAccount;
      }),
      catchError(error => {
        console.error('Error updating account:', error);
        this.toastService.error('Error', 'Failed to update account');
        return throwError(() => error);
      })
    );
  }

  public deleteAccount(id: string): Observable<void> {
    return from(
      this.supabase
        .from('accounts')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.accountsSignal, id);
        this.toastService.success('Success', 'Account deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        this.toastService.error('Error', 'Failed to delete account');
        return throwError(() => error);
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

    return from(
      this.supabase
        .from('subscriptions')
        .select(`
          *,
          frequencies:billing_cycle_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('next_billing_date', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const subscriptions = this.mapSubscriptionsFromSupabase(response.data || []);
        this.subscriptionsSignal.set(subscriptions);
        return subscriptions;
      }),
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
      return throwError(() => new Error('No household selected'));
    }

    const subscriptionData = {
      household_id: householdId,
      account_id: subscription.accountId || null,
      category_id: subscription.categoryId || null,
      name: subscription.name,
      amount: subscription.amount,
      billing_cycle_id: subscription.billingCycleId,
      next_billing_date: subscription.nextBillingDate ? this.formatDateOnly(subscription.nextBillingDate) : null,
      is_active: subscription.isActive !== undefined ? subscription.isActive : true,
      auto_renew: subscription.autoRenew !== undefined ? subscription.autoRenew : true,
      merchant_website: subscription.merchantWebsite || null,
      notes: subscription.notes || null
    };

    return from(
      this.supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select(`
          *,
          frequencies:billing_cycle_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newSubscription = this.mapSubscriptionFromSupabase(response.data);
        this.addToSignal(this.subscriptionsSignal, newSubscription);
        this.toastService.success('Success', 'Subscription added successfully');
        return newSubscription;
      }),
      catchError(error => {
        console.error('Error adding subscription:', error);
        this.toastService.error('Error', 'Failed to add subscription');
        return throwError(() => error);
      })
    );
  }

  public updateSubscription(id: string, updates: Partial<Subscription>): Observable<Subscription> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.billingCycle !== undefined) {
      // Billing cycle is stored as billing_cycle_id in DB
    }
    if (updates.nextBillingDate !== undefined) {
      updateData.next_billing_date = updates.nextBillingDate ? this.formatDateOnly(updates.nextBillingDate) : null;
    }
    if (updates.category !== undefined) {
      // Category is stored as category_id in DB
    }

    return from(
      this.supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          frequencies:billing_cycle_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedSubscription = this.mapSubscriptionFromSupabase(response.data);
        this.updateInSignal(this.subscriptionsSignal, updatedSubscription);
        this.toastService.success('Success', 'Subscription updated successfully');
        return updatedSubscription;
      }),
      catchError(error => {
        console.error('Error updating subscription:', error);
        this.toastService.error('Error', 'Failed to update subscription');
        return throwError(() => error);
      })
    );
  }

  public deleteSubscription(id: string): Observable<void> {
    return from(
      this.supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.subscriptionsSignal, id);
        this.toastService.success('Success', 'Subscription deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting subscription:', error);
        this.toastService.error('Error', 'Failed to delete subscription');
        return throwError(() => error);
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

    return from(
      this.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const categories = this.mapCategoriesFromSupabase(response.data || []);
        this.categoriesSignal.set(categories);
        return categories;
      }),
      catchError(error => {
        console.error('Error loading categories:', error);
        this.toastService.error('Error', 'Failed to load categories');
        return of([]);
      })
    );
  }

  public addCategory(category: any): Observable<Category> {
    const categoryData = {
      name: category.name,
      type: category.type,
      description: category.description || null,
      is_active: category.isActive !== undefined ? category.isActive : true
    };

    return from(
      this.supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newCategory = this.mapCategoryFromSupabase(response.data);
        this.addToSignal(this.categoriesSignal, newCategory);
        this.toastService.success('Success', 'Category added successfully');
        return newCategory;
      }),
      catchError(error => {
        console.error('Error adding category:', error);
        this.toastService.error('Error', 'Failed to add category');
        return throwError(() => error);
      })
    );
  }

  public updateCategory(id: string, updates: Partial<Category>): Observable<Category> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;

    return from(
      this.supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedCategory = this.mapCategoryFromSupabase(response.data);
        this.updateInSignal(this.categoriesSignal, updatedCategory);
        this.toastService.success('Success', 'Category updated successfully');
        return updatedCategory;
      }),
      catchError(error => {
        console.error('Error updating category:', error);
        this.toastService.error('Error', 'Failed to update category');
        return throwError(() => error);
      })
    );
  }

  public deleteCategory(id: string): Observable<void> {
    return from(
      this.supabase
        .from('categories')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.categoriesSignal, id);
        this.toastService.success('Success', 'Category deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting category:', error);
        this.toastService.error('Error', 'Failed to delete category');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapTransactionFromSupabase(data: any): Transaction {
    return {
      id: data.id,
      householdId: data.household_id,
      accountId: data.account_id,
      accountName: data.accounts?.name || data.account_name || '',
      categoryId: data.category_id,
      categoryName: data.categories?.name || data.category_name || null,
      date: new Date(data.date),
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      merchantName: data.merchant_name,
      notes: data.notes,
      plaidTransactionId: data.plaid_transaction_id,
      isRecurring: data.is_recurring || false,
      parentTransactionId: data.parent_transaction_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapTransactionsFromSupabase(data: any[]): Transaction[] {
    return data.map(item => this.mapTransactionFromSupabase(item));
  }

  private mapBudgetFromSupabase(data: any): Budget {
    return {
      id: data.id,
      householdId: data.household_id,
      categoryId: data.category_id,
      categoryName: data.categories?.name || data.category_name || '',
      name: data.name,
      limitAmount: parseFloat(data.limit_amount),
      period: data.period,
      startDate: data.start_date,
      endDate: data.end_date,
      isActive: data.is_active || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapBudgetsFromSupabase(data: any[]): Budget[] {
    return data.map(item => this.mapBudgetFromSupabase(item));
  }

  private mapFinancialGoalFromSupabase(data: any): FinancialGoal {
    return {
      id: data.id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount),
      currentAmount: parseFloat(data.current_amount),
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
      priority: this.mapPriorityFromId(data.priority_id) || 'medium'
    };
  }

  private mapFinancialGoalsFromSupabase(data: any[]): FinancialGoal[] {
    return data.map(item => this.mapFinancialGoalFromSupabase(item));
  }

  private mapAccountFromSupabase(data: any): Account {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      balance: parseFloat(data.balance),
      institution: data.institution,
      lastUpdated: data.last_synced_at ? new Date(data.last_synced_at) : new Date(data.updated_at)
    };
  }

  private mapAccountsFromSupabase(data: any[]): Account[] {
    return data.map(item => this.mapAccountFromSupabase(item));
  }

  private mapSubscriptionFromSupabase(data: any): Subscription {
    return {
      id: data.id,
      name: data.name,
      amount: parseFloat(data.amount),
      billingCycle: data.frequencies?.name?.toLowerCase() || data.billing_cycle || 'monthly',
      nextBillingDate: data.next_billing_date ? new Date(data.next_billing_date) : new Date(),
      category: data.category_id || ''
    };
  }

  private mapSubscriptionsFromSupabase(data: any[]): Subscription[] {
    return data.map(item => this.mapSubscriptionFromSupabase(item));
  }

  private mapCategoryFromSupabase(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color
    };
  }

  private mapCategoriesFromSupabase(data: any[]): Category[] {
    return data.map(item => this.mapCategoryFromSupabase(item));
  }

  private mapPriorityFromId(priorityId: string | null): 'low' | 'medium' | 'high' | undefined {
    // This is a simplified mapping - you may need to query the priorities table
    // or store a mapping in the service if priorities have specific IDs
    return 'medium'; // Default fallback
  }
}
