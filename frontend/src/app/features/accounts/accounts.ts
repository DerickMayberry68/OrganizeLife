import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-accounts',
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
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss'
})
export class Accounts implements OnInit {
  @ViewChild('accountDialog') accountDialog!: DialogComponent;
  @ViewChild('subscriptionDialog') subscriptionDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly accounts = this.dataService.accounts;
  protected readonly subscriptions = this.dataService.subscriptions;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalAccounts = computed(() => this.accounts().length);

  protected readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.balance, 0)
  );

  protected readonly totalSubscriptions = computed(() => this.subscriptions().length);

  protected readonly yearlySubscriptionCost = computed(() =>
    this.subscriptions()
      .reduce((sum, s) => {
        const yearlyAmount = s.billingCycle === 'yearly' ? s.amount :
                            s.billingCycle === 'quarterly' ? s.amount * 4 :
                            s.amount * 12;
        return sum + yearlyAmount;
      }, 0)
  );

  // Chart data with null safety
  protected readonly accountsByTypeChart = computed(() => {
    const data = this.accounts();
    if (!data || data.length === 0) return [];

    const typeBalances = data.reduce((acc: any, account) => {
      const type = account.type || 'Other';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += account.balance;
      return acc;
    }, {});

    return Object.entries(typeBalances).map(([type, balance]) => ({
      x: type.charAt(0).toUpperCase() + type.slice(1),
      y: balance,
      text: `${type}: $${(balance as number).toFixed(2)}`
    }));
  });

  protected readonly subscriptionsByCategoryChart = computed(() => {
    const data = this.subscriptions();
    if (!data || data.length === 0) return [];

    const categoryCosts = data.reduce((acc: any, sub) => {
      const category = sub.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sub.amount;
      return acc;
    }, {});

    return Object.entries(categoryCosts).map(([category, total]) => ({
      x: category.charAt(0).toUpperCase() + category.slice(1),
      y: total,
      text: `${category}: $${(total as number).toFixed(2)}`
    }));
  });

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart settings with proper types
  protected readonly primaryXAxis: any = {
    valueType: 'Category',
    title: 'Account Types',
    labelIntersectAction: 'Rotate45'
  };
  protected readonly primaryYAxis: any = {
    title: 'Balance',
    labelFormat: 'c0',
    minimum: 0
  };
  protected readonly chartTitle = 'Accounts by Type';
  protected readonly tooltip = { enable: true, format: '${point.x}: ${point.y}' };
  protected readonly marker = {
    visible: true,
    height: 10,
    width: 10,
    dataLabel: { visible: false }
  };
  protected readonly chartBackground = 'white';
  protected readonly palettes = ['#d4af37', '#49b6d6', '#32a932', '#f59c1a', '#e74c3c'];

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly accountDialogButtons = [
    { click: () => this.saveAccount(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.accountDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];
  protected readonly subscriptionDialogButtons = [
    { click: () => this.saveSubscription(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.subscriptionDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form groups
  protected accountForm: FormGroup;
  protected subscriptionForm: FormGroup;

  // Dropdown data
  protected readonly accountTypes = ['checking', 'savings', 'credit', 'investment', 'loan', 'other'];
  protected readonly subscriptionCategories = ['entertainment', 'software', 'utilities', 'membership', 'other'];
  protected readonly billingCycles = ['monthly', 'quarterly', 'annual'];

  constructor() {
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.accountsByTypeChart();
      console.log('Accounts Chart Data:', chartData);
    });

    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      institution: ['', Validators.required],
      accountNumber: ['']
    });

    this.subscriptionForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      billingCycle: ['monthly', Validators.required],
      nextBillingDate: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    // Data is already loaded via DataService signals
    setTimeout(() => {
      this.isLoading.set(false);
    });
  }

  protected openAccountDialog(): void {
    this.accountForm.reset({
      balance: 0
    });
    this.accountDialog.show();
  }

  protected openSubscriptionDialog(): void {
    this.subscriptionForm.reset({
      billingCycle: 'monthly',
      nextBillingDate: new Date(),
      amount: 0
    });
    this.subscriptionDialog.show();
  }

  protected saveAccount(): void {
    if (this.accountForm.valid) {
      const formValue = this.accountForm.value;
      const account = {
        id: Date.now().toString(),
        name: formValue.name,
        type: formValue.type,
        balance: formValue.balance,
        institution: formValue.institution,
        accountNumber: formValue.accountNumber || undefined
      };
      // this.dataService.addAccount(account);
      this.accountDialog.hide();
      this.accountForm.reset({ balance: 0 });
      this.toastService.success('Account Added', `${formValue.name} has been added successfully.`);
    }
  }

  protected saveSubscription(): void {
    if (this.subscriptionForm.valid) {
      const formValue = this.subscriptionForm.value;
      const subscription = {
        id: Date.now().toString(),
        name: formValue.name,
        category: formValue.category,
        amount: formValue.amount,
        billingCycle: formValue.billingCycle,
        nextBillingDate: formValue.nextBillingDate
      };
      // this.dataService.addSubscription(subscription);
      this.subscriptionDialog.hide();
      this.subscriptionForm.reset({
        billingCycle: 'monthly',
        nextBillingDate: new Date(),
        amount: 0
      });
      this.toastService.success('Subscription Added', `${formValue.name} has been added successfully.`);
    }
  }

  // Utility methods
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
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'type') {
      const type = args.data.type;
      args.cell.innerHTML = `<span class="badge badge--info">${type}</span>`;
    }
    if (args.column?.field === 'category') {
      const category = args.data.category;
      args.cell.innerHTML = `<span class="badge badge--info">${category}</span>`;
    }
  }
}
