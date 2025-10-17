import { Injectable, computed, inject } from '@angular/core';
import { AlertService } from './alert.service';
import { BillService } from './bill.service';
import { MaintenanceService } from './maintenance.service';
import { DocumentService } from './document.service';
import { FinancialService } from './financial.service';
import type { DashboardStats } from '../models/dashboard.model';

/**
 * Dashboard Service
 * Aggregates statistics from all domain services for dashboard display
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly alertService = inject(AlertService);
  private readonly billService = inject(BillService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly documentService = inject(DocumentService);
  private readonly financialService = inject(FinancialService);

  /**
   * Computed dashboard stats aggregated from all services
   */
  public readonly dashboardStats = computed<DashboardStats>(() => {
    const upcomingBills = this.billService.upcomingBills().length;
    const overdueItems = this.billService.overdueBills().length;
    const maintenanceTasks = this.maintenanceService.pendingTasks().length;
    const expiringDocuments = this.documentService.expiringDocuments().length;

    const budgets = this.financialService.budgets();
    const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
    const totalSpent = this.financialService.totalExpenses();
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

  /**
   * Quick stats for dashboard widgets
   */
  public readonly quickStats = computed(() => ({
    unreadAlerts: this.alertService.unreadAlertsCount(),
    criticalAlerts: this.alertService.criticalAlertsCount(),
    upcomingBills: this.billService.upcomingBills().length,
    overdueBills: this.billService.overdueBills().length,
    pendingMaintenance: this.maintenanceService.pendingTasks().length,
    expiringDocuments: this.documentService.expiringDocuments().length,
    totalIncome: this.financialService.totalIncome(),
    totalExpenses: this.financialService.totalExpenses(),
    netBalance: this.financialService.netBalance(),
    activeSubscriptions: this.financialService.activeSubscriptions().length
  }));
}

