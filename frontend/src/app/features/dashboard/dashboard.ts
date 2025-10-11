import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { AlertComponent } from '../../shared/alert/alert';
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
    AlertComponent,
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
export class Dashboard {
  private readonly dataService = inject(DataService);

  protected readonly stats = this.dataService.dashboardStats;
  protected readonly alerts = this.dataService.alerts;
  
  // Aggregate all events for the calendar
  protected readonly calendarEvents = computed<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];
    let eventId = 1;

    // Add bill events
    this.dataService.bills().forEach(bill => {
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
    this.dataService.maintenanceTasks()
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
    this.dataService.insurancePolicies().forEach((insurance: Insurance) => {
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
    this.dataService.appointments()
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
