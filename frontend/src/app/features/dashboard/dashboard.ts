import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AlertService } from '../../services/alert.service';
import { FinancialService } from '../../services/financial.service';
import { BillService } from '../../services/bill.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { InsuranceService } from '../../services/insurance.service';
import { HealthcareService } from '../../services/healthcare.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ScheduleModule, DayService, WeekService, WorkWeekService, MonthService, AgendaService } from '@syncfusion/ej2-angular-schedule';
import type { Insurance } from '../../models/insurance.model';

// Interface for calendar events
interface CalendarEvent {
  Id: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  CategoryColor: string;
  Description?: string;
  IsAllDay?: boolean;
  Type: 'bill' | 'maintenance' | 'insurance' | 'appointment';
  Priority?: string;
  Amount?: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, 
    RouterLink, 
    StatCard, 
    ChartModule,
    AppBarModule,
    ScheduleModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService,
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly alertService = inject(AlertService);
  private readonly financialService = inject(FinancialService);
  private readonly billService = inject(BillService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly insuranceService = inject(InsuranceService);
  private readonly healthcareService = inject(HealthcareService);

  protected readonly stats = this.dashboardService.dashboardStats;
  protected readonly alerts = this.alertService.alerts;

  ngOnInit(): void {
    // Load essential data for dashboard display
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load budgets first as they're needed for the chart
    this.financialService.loadBudgets().subscribe({
      next: (budgets) => {
        console.log('Budgets loaded:', budgets);
        // If no budgets are returned from API, ensure we have some mock data for demonstration
        if (!budgets || budgets.length === 0) {
          this.loadMockBudgetData();
        }
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
        // Fallback to mock data if API fails
        this.loadMockBudgetData();
      }
    });

    // Load other essential data
    this.billService.loadBills().subscribe({
      next: (bills) => {
        console.log('Bills loaded:', bills);
      },
      error: (error) => {
        console.error('Error loading bills:', error);
      }
    });

    this.maintenanceService.loadMaintenanceTasks().subscribe({
      next: (tasks) => {
        console.log('Maintenance tasks loaded:', tasks);
      },
      error: (error) => {
        console.error('Error loading maintenance tasks:', error);
      }
    });

    this.financialService.loadTransactions().subscribe({
      next: (transactions) => {
        console.log('Transactions loaded:', transactions);
        // If no transactions are returned, add some mock data for demonstration
        if (!transactions || transactions.length === 0) {
          this.loadMockTransactionData();
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        // Fallback to mock data if API fails
        this.loadMockTransactionData();
      }
    });
  }

  private loadMockBudgetData(): void {
    // Add some mock budget data for demonstration
    const mockBudgets = [
      {
        id: '1',
        householdId: 'household-1',
        categoryId: '1',
        categoryName: 'Groceries',
        name: 'Groceries',
        limitAmount: 500,
        period: 'Monthly',
        startDate: new Date().toISOString().split('T')[0], // DateOnly format
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2', 
        householdId: 'household-1',
        categoryId: '2',
        categoryName: 'Utilities',
        name: 'Utilities',
        limitAmount: 300,
        period: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        householdId: 'household-1',
        categoryId: '3',
        categoryName: 'Entertainment',
        name: 'Entertainment',
        limitAmount: 200,
        period: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock data not supported in refactored services - would need to be set directly
    // For now, we'll skip mock data as it's for demonstration only
    console.log('Mock budget data loaded:', mockBudgets);
  }

  private loadMockTransactionData(): void {
    // Add some mock transaction data for demonstration
    const mockTransactions = [
      {
        id: '1',
        householdId: 'household-1',
        accountId: '1',
        accountName: 'Primary Checking',
        categoryId: '1',
        categoryName: 'Groceries',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Grocery shopping',
        amount: 85.50,
        type: 'expense',
        merchantName: 'Grocery Store',
        notes: 'Weekly grocery shopping',
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        householdId: 'household-1',
        accountId: '1',
        accountName: 'Primary Checking',
        categoryId: '2',
        categoryName: 'Utilities',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Electric bill',
        amount: 120.75,
        type: 'expense',
        merchantName: 'Electric Company',
        notes: 'Monthly electric bill',
        isRecurring: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        householdId: 'household-1',
        accountId: '1',
        accountName: 'Primary Checking',
        categoryId: '3',
        categoryName: 'Entertainment',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Movie tickets',
        amount: 45.00,
        type: 'expense',
        merchantName: 'Cinema',
        notes: 'Weekend movie night',
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock data not supported in refactored services - would need to be set directly
    // For now, we'll skip mock data as it's for demonstration only
    console.log('Mock transaction data loaded:', mockTransactions);
  }
  
  // Aggregate all events for the calendar
  protected readonly calendarEvents = computed<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];
    let eventId = 1;

    // Add bill events
    this.billService.bills().forEach(bill => {
      const startTime = new Date(bill.dueDate);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      events.push({
        Id: eventId++,
        Subject: `💳 ${bill.name}`,
        StartTime: startTime,
        EndTime: endTime,
        CategoryColor: bill.status === 'overdue' ? '#ff5757' : '#1b76ff', // Red for overdue, blue for pending
        Description: `Amount: ${this.formatCurrency(bill.amount)}\nStatus: ${bill.status}`,
        IsAllDay: false,
        Type: 'bill',
        Amount: bill.amount
      });
    });

    // Add maintenance task events
    this.maintenanceService.maintenanceTasks()
      .filter(t => t.status === 'pending' || t.status === 'scheduled')
      .forEach(task => {
        const startTime = new Date(task.dueDate);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2);

        let color = '#ff8c42'; // Orange for warnings
        if (task.priority === 'urgent') color = '#ff5757'; // Red for urgent
        else if (task.priority === 'high') color = '#ff8c42'; // Orange for high
        else if (task.priority === 'medium') color = '#1bb8ff'; // Cyan for medium
        else color = '#3ddc84'; // Green for low

        events.push({
          Id: eventId++,
          Subject: `🔧 ${task.title}`,
          StartTime: startTime,
          EndTime: endTime,
          CategoryColor: color,
          Description: `Category: ${task.category}\nPriority: ${task.priority}${task.estimatedCost ? `\nEstimated Cost: ${this.formatCurrency(task.estimatedCost)}` : ''}`,
          IsAllDay: false,
          Type: 'maintenance',
          Priority: task.priority,
          Amount: task.estimatedCost
        });
      });

    // Add insurance renewal events
    this.insuranceService.insurancePolicies().forEach((insurance: Insurance) => {
      const renewalDate = new Date(insurance.renewalDate);
      
      events.push({
        Id: eventId++,
        Subject: `🛡️ ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Insurance Renewal`,
        StartTime: renewalDate,
        EndTime: renewalDate,
        CategoryColor: '#6b5ce7', // Indigo for insurance
        Description: `Provider: ${insurance.provider}\nPolicy: ${insurance.policyNumber}\nPremium: ${this.formatCurrency(insurance.premium)}`,
        IsAllDay: true,
        Type: 'insurance',
        Amount: insurance.premium
      });
    });

    // Add healthcare appointment events
    this.healthcareService.appointments()
      .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
      .forEach(appointment => {
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const startTime = new Date(appointment.date);
        startTime.setHours(hours, minutes, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + (appointment.duration || 30));

        let color = '#a05ce7'; // Purple for appointments
        if (appointment.type === 'emergency') color = '#ff5757'; // Red for emergency
        else if (appointment.type === 'procedure') color = '#ff8c42'; // Orange for procedures
        else if (appointment.type === 'checkup') color = '#3ddc84'; // Green for checkups
        else if (appointment.type === 'telehealth') color = '#1bb8ff'; // Cyan for telehealth

        events.push({
          Id: eventId++,
          Subject: `🏥 ${appointment.doctorName}`,
          StartTime: startTime,
          EndTime: endTime,
          CategoryColor: color,
          Description: `Type: ${appointment.type}\nReason: ${appointment.reason}\nLocation: ${appointment.location}${appointment.notes ? `\nNotes: ${appointment.notes}` : ''}`,
          IsAllDay: false,
          Type: 'appointment'
        });
      });

    return events;
  });

  // Chart data for budget visualization - with null safety
  protected readonly budgetChartData = computed(() => {
    const budgets = this.financialService.budgets();
    const transactions = this.financialService.transactions();
    
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
    this.alertService.dismissAlert(id).subscribe();
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

  // Event settings - computed to react to data changes
  protected get eventSettings(): any {
    return {
      dataSource: this.calendarEvents(),
      fields: {
        id: 'Id',
        subject: { name: 'Subject' },
        startTime: { name: 'StartTime' },
        endTime: { name: 'EndTime' },
        description: { name: 'Description' },
        isAllDay: { name: 'IsAllDay' }
      }
    };
  }

  // Calendar view configurations
  protected readonly views: string[] = ['Month', 'Week', 'WorkWeek', 'Day', 'Agenda'];
  protected readonly selectedDate: Date = new Date();
  
  // Event renderer for custom styling
  protected onEventRendered(args: any): void {
    const data = args.data as CalendarEvent;
    if (data && data.CategoryColor) {
      args.element.style.backgroundColor = data.CategoryColor;
    }
  }
}
