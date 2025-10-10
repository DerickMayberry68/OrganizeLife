import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { AlertComponent } from '../../shared/alert/alert';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';

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
  providers: [
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService
  ],
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

  // Chart data for budget visualization - with null safety
  protected readonly budgetChartData = computed(() => {
    const budgets = this.dataService.budgets();
    const transactions = this.dataService.transactions();
    
    // Return empty array if no budgets
    if (!budgets || budgets.length === 0) {
      return [];
    }
    
    return budgets.map(b => {
      // Calculate spent for this budget
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        x: b.name,
        y: spent,
        text: `${b.name}: $${spent.toFixed(2)}`
      };
    });
  });

  // Chart configuration - properly typed for Syncfusion
  protected readonly primaryXAxis: any = {
    valueType: 'Category',
    title: 'Budget Categories',
    labelIntersectAction: 'Rotate45'
  };

  protected readonly primaryYAxis: any = {
    title: 'Amount ($)',
    labelFormat: 'c0',
    minimum: 0
  };

  protected readonly chartTitle = 'Budget Spending by Category';
  
  protected readonly tooltip: any = { 
    enable: true, 
    format: '${point.x}: ${point.y}' 
  };
  
  protected readonly marker: any = { 
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
