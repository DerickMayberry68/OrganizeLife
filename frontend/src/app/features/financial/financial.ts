import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';
import { ChartModule } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

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
    DropDownListModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PageService, SortService, FilterService, GroupService],
  templateUrl: './financial.html',
  styleUrl: './financial.scss'
})
export class Financial {
  @ViewChild('transactionDialog') transactionDialog!: DialogComponent;
  @ViewChild('budgetDialog') budgetDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly budgets = this.dataService.budgets;
  protected readonly transactions = this.dataService.transactions;
  protected readonly financialGoals = this.dataService.financialGoals;

  protected readonly totalBudget = computed(() =>
    this.budgets().reduce((sum, b) => sum + b.limit, 0)
  );

  protected readonly totalSpent = computed(() =>
    this.budgets().reduce((sum, b) => sum + b.spent, 0)
  );

  protected readonly budgetRemaining = computed(() =>
    this.totalBudget() - this.totalSpent()
  );

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart data
  protected readonly budgetChartData = computed(() => {
    return this.budgets().map(b => ({
      x: b.category,
      y: b.spent,
      limit: b.limit,
      text: `${b.category}: $${b.spent}`
    }));
  });

  protected readonly primaryXAxis = { valueType: 'Category', title: 'Categories' };
  protected readonly primaryYAxis = { title: 'Amount ($)', labelFormat: '${value}' };
  protected readonly chartTitle = 'Budget vs Spending';
  protected readonly tooltip = { enable: true };
  protected readonly marker = { visible: true, height: 10, width: 10 };

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
  protected readonly categories = ['Groceries', 'Entertainment', 'Utilities', 'Transportation', 'Healthcare', 'Shopping', 'Dining', 'Other'];
  protected readonly budgetPeriods = ['monthly', 'yearly'];

  constructor() {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      type: ['expense', Validators.required],
      date: [new Date(), Validators.required]
    });

    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit: [0, [Validators.required, Validators.min(1)]],
      period: ['monthly', Validators.required]
    });
  }

  protected openTransactionDialog(): void {
    this.transactionForm.reset({
      type: 'expense',
      date: new Date()
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
      const transaction = {
        id: Date.now().toString(),
        date: formValue.date,
        description: formValue.description,
        amount: formValue.amount,
        category: formValue.category,
        type: formValue.type
      };
      this.dataService.addTransaction(transaction);
      this.transactionDialog.hide();
      this.transactionForm.reset({ type: 'expense', date: new Date() });
      this.toastService.success('Transaction Added', `${formValue.description} has been recorded successfully.`);
    }
  }

  protected saveBudget(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const budget = {
        id: Date.now().toString(),
        category: formValue.category,
        limit: formValue.limit,
        spent: 0,
        period: formValue.period
      };
      this.dataService.addBudget(budget);
      this.budgetDialog.hide();
      this.budgetForm.reset({ period: 'monthly' });
      this.toastService.success('Budget Created', `${formValue.category} budget has been set successfully.`);
    }
  }

  protected formatCurrency(args: any): string {
    if (!args.value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(args.value);
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

  protected getBudgetPercentage(spent: number, limit: number): number {
    return (spent / limit) * 100;
  }

  protected getBudgetStatus(percentage: number): 'success' | 'warning' | 'error' {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  }
}
