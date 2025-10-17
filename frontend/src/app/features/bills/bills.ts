import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillService } from '../../services/bill.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-bills',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatCard,
    GridModule,
    ChartModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule,
    CheckBoxModule,
    AppBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    PageService, 
    SortService, 
    FilterService, 
    GroupService,
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService
  ],
  templateUrl: './bills.html',
  styleUrl: './bills.scss'
})
export class Bills implements OnInit {
  @ViewChild('billDialog') billDialog!: DialogComponent;

  private readonly billService = inject(BillService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly bills = this.billService.bills;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalBills = computed(() => this.bills().length);
  
  protected readonly upcomingBills = computed(() => 
    this.bills().filter(b => {
      const daysUntil = this.getDaysUntil(b.dueDate);
      return daysUntil >= 0 && daysUntil <= 7 && b.status !== 'paid';
    }).length
  );

  protected readonly overdueBills = computed(() => 
    this.bills().filter(b => b.status === 'overdue').length
  );

  protected readonly totalDue = computed(() => 
    this.bills()
      .filter(b => b.status === 'pending' || b.status === 'overdue')
      .reduce((sum, b) => sum + b.amount, 0)
  );

  // Chart data with null safety
  protected readonly billsByCategoryChart = computed(() => {
    const data = this.bills();
    if (!data || data.length === 0) return [];
    
    const categoryTotals = data.reduce((acc: any, bill) => {
      const category = bill.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += bill.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, total]) => ({
      x: category,
      y: total,
      text: `${category}: $${(total as number).toFixed(2)}`
    }));
  });

  protected readonly upcomingBillsList = computed(() => 
    this.bills()
      .filter(b => {
        const daysUntil = this.getDaysUntil(b.dueDate);
        return daysUntil >= 0 && daysUntil <= 7 && b.status !== 'paid';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  );

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart settings with proper types
  protected readonly primaryXAxis: any = { 
    valueType: 'Category', 
    title: 'Categories',
    labelIntersectAction: 'Rotate45'
  };
  protected readonly primaryYAxis: any = { 
    title: 'Amount ($)', 
    labelFormat: 'c0',
    minimum: 0
  };
  protected readonly chartTitle = 'Bills by Category';
  protected readonly tooltip = { enable: true, format: '${point.x}: ${point.y}' };
  protected readonly marker = { 
    visible: true, 
    height: 10, 
    width: 10,
    dataLabel: { visible: false }
  };
  protected readonly chartBackground = 'white';
  protected readonly palettes = ['#d4af37'];

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly billDialogButtons = [
    { click: () => this.saveBill(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.billDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected billForm: FormGroup;

  // Dropdown data
  protected readonly categories = ['Utilities', 'Insurance', 'Subscription', 'Loan', 'Rent', 'Other'];
  protected readonly frequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];

  constructor() {
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.billsByCategoryChart();
      console.log('Bills Chart Data:', chartData);
    });

    this.billForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      dueDate: [new Date(), Validators.required],
      isRecurring: [false],
      frequency: ['monthly'],
      autoPayEnabled: [false],
      reminderDays: [3, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    // Bills are already loaded via DataService signals
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isLoading.set(false);
    });
  }

  protected openBillDialog(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.billForm.reset({
      dueDate: todayStr,
      isRecurring: false,
      frequency: 'monthly',
      autoPayEnabled: false,
      reminderDays: 3
    });
    this.billDialog.show();
  }

  protected saveBill(): void {
    if (this.billForm.valid) {
      const formValue = this.billForm.value;
      const bill = {
        name: formValue.name,
        amount: formValue.amount,
        category: formValue.category,
        dueDate: formValue.dueDate,
        isRecurring: formValue.isRecurring,
        frequency: formValue.frequency,
        status: 'pending' as const,
        autoPayEnabled: formValue.autoPayEnabled,
        reminderDays: formValue.reminderDays
      };
      this.billService.addBill(bill).subscribe({
        next: () => {
          this.billDialog.hide();
          const todayStr = new Date().toISOString().split('T')[0];
          this.billForm.reset({
            dueDate: todayStr,
            isRecurring: false,
            frequency: 'monthly',
            autoPayEnabled: false,
            reminderDays: 3
          });
        },
        error: (error) => {
          console.error('Error saving bill:', error);
        }
      });
    }
  }

  // Utility methods for grid formatters
  protected formatCurrency(args: any): string {
    if (!args.value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(args.value);
  }

  protected formatCurrencyValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  protected formatDate(args: any): string {
    if (!args.value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(args.value));
  }

  protected formatDateValue(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected getDaysUntilText(date: Date): string {
    const days = this.getDaysUntil(date);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    return `Due in ${days} days`;
  }

  protected getStatusBadge(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'info';
    }
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'status') {
      const status = args.data.status;
      const badge = this.getStatusBadge(status);
      args.cell.innerHTML = `<span class="badge badge--${badge}">${status}</span>`;
    }
    if (args.column?.field === 'autoPayEnabled') {
      args.cell.innerHTML = args.data.autoPayEnabled ? 
        '<span class="badge badge--success">Auto-Pay</span>' : 
        '<span class="badge badge--default">Manual</span>';
    }
  }
}
