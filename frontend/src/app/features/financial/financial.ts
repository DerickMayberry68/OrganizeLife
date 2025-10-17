import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
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
  selector: 'app-financial',
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
  templateUrl: './financial.html',
  styleUrl: './financial.scss'
})
export class Financial implements OnInit {
  @ViewChild('transactionDialog') transactionDialog!: DialogComponent;
  @ViewChild('budgetDialog') budgetDialog!: DialogComponent;

  private readonly financialService = inject(FinancialService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly budgets = this.financialService.budgets;
  protected readonly transactions = this.financialService.transactions;
  protected readonly financialGoals = this.financialService.financialGoals;
  protected readonly accounts = this.financialService.accounts;
  protected readonly categories = this.financialService.categories;

  protected readonly totalBudget = computed(() =>
    this.budgets().reduce((sum, b) => sum + b.limitAmount, 0)
  );

  protected readonly totalSpent = computed(() =>
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  protected readonly budgetRemaining = computed(() =>
    this.totalBudget() - this.totalSpent()
  );

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart data - with null safety
  protected readonly budgetChartData = computed(() => {
    const budgets = this.budgets();
    const transactions = this.transactions();
    
    // Return empty array if no budgets
    if (!budgets || budgets.length === 0) {
      return [];
    }
    
    return budgets.map(b => {
      // Calculate spent for this budget period
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        x: b.name,
        y: spent,
        limit: b.limitAmount,
        text: `${b.name}: $${spent}`
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
  
  protected readonly chartTitle = 'Budget vs Spending';
  
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
  
  protected readonly chartBackground = 'white';
  protected readonly palettes = ['#d4af37', '#1a1a2e'];

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly transactionDialogButtons = [
    { click: () => this.saveTransaction(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.transactionDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];
  protected readonly budgetDialogButtons = [
    { click: () => this.saveBudget(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.budgetDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form groups
  protected transactionForm: FormGroup;
  protected budgetForm: FormGroup;

  // Dropdown data
  protected readonly transactionTypes = ['income', 'expense'];
  protected readonly budgetPeriods = ['Monthly', 'Quarterly', 'Yearly'];

  protected readonly isLoading = signal(false);

  constructor() {
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.budgetChartData();
      console.log('Budget Chart Data:', chartData);
      console.log('Budgets:', this.budgets());
      console.log('Transactions:', this.transactions());
    });
    
    // Format today's date as YYYY-MM-DD for HTML date inputs
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.transactionForm = this.fb.group({
      accountId: ['', Validators.required],
      categoryId: [''],
      date: [todayStr, Validators.required],
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['expense', Validators.required],
      merchantName: [''],
      notes: [''],
      isRecurring: [false]
    });

    this.budgetForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      limitAmount: [0, [Validators.required, Validators.min(1)]],
      period: ['Monthly', Validators.required],
      startDate: [todayStr, Validators.required],
      endDate: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadFinancialData();
    });
  }

  private loadFinancialData(): void {
    this.isLoading.set(true);
    
    // Load all financial data in parallel (using allSettled to allow some to fail)
    Promise.allSettled([
      this.financialService.loadTransactions().toPromise(),
      this.financialService.loadBudgets().toPromise(),
      // this.financialService.loadFinancialGoals().toPromise(), // Endpoint not available yet
      this.financialService.loadAccounts().toPromise(),
      // this.financialService.loadSubscriptions().toPromise(), // Optional
      this.financialService.loadCategories().toPromise()
    ])
      .then((results) => {
        // Log any failures
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpoints = ['Transactions', 'Budgets', 'Accounts', 'Categories'];
            console.warn(`Failed to load ${endpoints[index]}:`, result.reason);
          }
        });
        this.isLoading.set(false);
      })
      .catch(error => {
        console.error('Error loading financial data:', error);
        this.isLoading.set(false);
      });
  }

  protected openTransactionDialog(): void {
    // Check if accounts are loaded
    if (this.accounts().length === 0) {
      this.toastService.error('No Accounts', 'Please create an account first before adding transactions');
      return;
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    this.transactionForm.reset({
      type: 'expense',
      date: todayStr,
      isRecurring: false
    });
    this.transactionDialog.show();
  }

  protected openBudgetDialog(): void {
    this.budgetForm.reset({
      period: 'monthly'
    });
    this.budgetDialog.show();
  }

  protected saveTransaction(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      console.log('Form Value:', formValue);
      console.log('Form Valid:', this.transactionForm.valid);
      console.log('Form Errors:', this.transactionForm.errors);
      
      // Validate required fields manually
      if (!formValue.accountId) {
        this.toastService.error('Validation Error', 'Please select an account');
        return;
      }
      
      if (!formValue.description) {
        this.toastService.error('Validation Error', 'Please enter a description');
        return;
      }
      
      if (!formValue.amount || formValue.amount <= 0) {
        this.toastService.error('Validation Error', 'Please enter a valid amount');
        return;
      }
      
      const dto = {
        accountId: formValue.accountId,
        categoryId: formValue.categoryId || undefined,
        date: formValue.date,
        description: formValue.description,
        amount: formValue.amount,
        type: formValue.type,
        merchantName: formValue.merchantName || undefined,
        notes: formValue.notes || undefined,
        isRecurring: formValue.isRecurring || false
      };
      
      console.log('DTO being sent to service:', dto);
      
      this.financialService.addTransaction(dto).subscribe({
        next: () => {
          this.transactionDialog.hide();
          this.transactionForm.reset({ 
            type: 'expense', 
            date: new Date(),
            isRecurring: false
          });
        },
        error: (error) => {
          console.error('Failed to save transaction:', error);
        }
      });
    } else {
      console.error('Form is invalid:', this.transactionForm.errors);
      this.toastService.error('Validation Error', 'Please fill in all required fields');
    }
  }

  protected saveBudget(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const dto = {
        name: formValue.name,
        categoryId: formValue.categoryId,
        limitAmount: formValue.limitAmount,
        period: formValue.period,
        startDate: formValue.startDate,
        endDate: formValue.endDate || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      
      this.financialService.addBudget(dto).subscribe({
        next: () => {
          this.budgetDialog.hide();
          this.budgetForm.reset({ 
            period: 'Monthly',
            startDate: new Date(),
            isActive: true
          });
        },
        error: (error) => {
          console.error('Failed to save budget:', error);
        }
      });
    }
  }

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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(args.value));
  }

  protected formatAmount(args: any): string {
    if (!args.value) return '';
    return this.formatCurrency(args);
  }

  protected getBudgetSpent(budget: any): number {
    // Calculate spent amount for this budget
    return this.transactions()
      .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  protected getBudgetPercentage(budget: any): number {
    const spent = this.getBudgetSpent(budget);
    return budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
  }

  protected getBudgetStatus(percentage: number): 'success' | 'warning' | 'error' {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  }
}
