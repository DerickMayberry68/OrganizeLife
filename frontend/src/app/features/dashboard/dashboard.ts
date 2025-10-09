import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { AlertComponent } from '../../shared/alert/alert';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { ChartModule } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, 
    RouterLink, 
    StatCard, 
    AlertComponent,
    Breadcrumb,
    ChartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly dataService = inject(DataService);

  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard' }
  ];

  protected readonly stats = this.dataService.dashboardStats;
  protected readonly alerts = this.dataService.alerts;
  protected readonly recentBills = computed(() => 
    this.dataService.bills().slice(0, 5)
  );
  protected readonly upcomingMaintenance = computed(() =>
    this.dataService.maintenanceTasks()
      .filter(t => t.status === 'pending' || t.status === 'scheduled')
      .slice(0, 3)
  );

  // Chart data for budget visualization
  protected readonly budgetChartData = computed(() => {
    const budgets = this.dataService.budgets();
    return budgets.map(b => ({
      x: b.category,
      y: b.spent,
      text: `${b.category}: $${b.spent}`
    }));
  });

  protected readonly primaryXAxis = {
    valueType: 'Category',
    title: 'Categories'
  };

  protected readonly primaryYAxis = {
    title: 'Amount ($)',
    labelFormat: '${value}'
  };

  protected readonly chartTitle = 'Budget Spending by Category';
  protected readonly tooltip = { enable: true, format: '${point.x}: ${point.y}' };
  protected readonly marker = { 
    visible: true, 
    height: 10, 
    width: 10,
    dataLabel: { visible: false }
  };

  protected dismissAlert(id: string): void {
    this.dataService.dismissAlert(id);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
