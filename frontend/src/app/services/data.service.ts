import { Injectable, signal, computed } from '@angular/core';
import type { Transaction, Budget, FinancialGoal, Account, Subscription } from '../models/financial.model';
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
  // Financial signals
  private readonly transactionsSignal = signal<Transaction[]>([]);
  private readonly budgetsSignal = signal<Budget[]>([]);
  private readonly financialGoalsSignal = signal<FinancialGoal[]>([]);
  private readonly accountsSignal = signal<Account[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);

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
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
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
    this.budgetsSignal.set([
      {
        id: '1',
        category: 'Groceries',
        limit: 800,
        spent: 620,
        period: 'monthly'
      },
      {
        id: '2',
        category: 'Entertainment',
        limit: 200,
        spent: 145,
        period: 'monthly'
      },
      {
        id: '3',
        category: 'Utilities',
        limit: 350,
        spent: 298,
        period: 'monthly'
      }
    ]);

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

  // CRUD methods for each entity type
  public addTransaction(transaction: Transaction): void {
    this.transactionsSignal.update(items => [...items, transaction]);
  }

  public addBudget(budget: Budget): void {
    this.budgetsSignal.update(items => [...items, budget]);
  }

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

