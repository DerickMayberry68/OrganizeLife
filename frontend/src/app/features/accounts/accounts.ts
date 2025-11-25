import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, AfterViewInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { ToastService } from '../../services/toast.service';
import Swal from 'sweetalert2';
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
export class Accounts implements OnInit, AfterViewInit {
  @ViewChild('accountDialog') accountDialog!: DialogComponent;
  @ViewChild('subscriptionDialog') subscriptionDialog!: DialogComponent;

  private readonly financialService = inject(FinancialService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly accounts = this.financialService.accounts;
  protected readonly subscriptions = this.financialService.subscriptions;
  protected readonly categories = this.financialService.categories;
  protected readonly frequencies = signal<any[]>([]);
  protected readonly isLoading = signal(false);
  protected editingAccountId: string | null = null;
  protected editingSubscriptionId: string | null = null;

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
  
  protected get accountDialogButtons() {
    return [
      { click: () => this.saveAccount(), buttonModel: { content: this.editingAccountId ? 'Update' : 'Save', isPrimary: true } },
      { click: () => this.accountDialog.hide(), buttonModel: { content: 'Cancel' } }
    ];
  }
  
  protected get subscriptionDialogButtons() {
    return [
      { click: () => this.saveSubscription(), buttonModel: { content: this.editingSubscriptionId ? 'Update' : 'Save', isPrimary: true } },
      { click: () => this.subscriptionDialog.hide(), buttonModel: { content: 'Cancel' } }
    ];
  }

  // Form groups
  protected accountForm: FormGroup;
  protected subscriptionForm: FormGroup;

  // Dropdown data
  protected readonly accountTypes = ['checking', 'savings', 'credit', 'investment', 'loan', 'other'];

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

  ngAfterViewInit(): void {
    // Force teal gradient on AppBar buttons
    setTimeout(() => {
      const buttons = document.querySelectorAll('.e-appbar.custom-appbar button.e-btn.e-primary');
      buttons.forEach((button: any) => {
        if (button && button.style) {
          button.style.background = 'linear-gradient(135deg, #108E91 0%, #20B6AA 100%)';
          button.style.backgroundColor = '#108E91';
          button.style.backgroundImage = 'linear-gradient(135deg, #108E91 0%, #20B6AA 100%)';
          button.style.color = 'white';
          button.style.border = 'none';
        }
      });
    }, 100);
  }

  ngOnInit(): void {
    // Load reference data
    this.financialService.loadCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load accounts and subscriptions data
    this.loadAccountsData();
  }

  private loadAccountsData(): void {
    this.isLoading.set(true);

    // Load accounts
    this.financialService.loadAccounts().subscribe({
      next: (accounts) => {
        console.log('Accounts loaded:', accounts);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        // If API fails, load some mock data for demonstration
        this.loadMockAccountsData();
      }
    });

    // Load subscriptions
    this.financialService.loadSubscriptions().subscribe({
      next: (subscriptions) => {
        console.log('Subscriptions loaded:', subscriptions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading subscriptions:', error);
        // If API fails, load some mock data for demonstration
        this.loadMockSubscriptionsData();
        this.isLoading.set(false);
      }
    });
  }

  private loadMockAccountsData(): void {
    // Add some mock account data for demonstration
    const mockAccounts = [
      {
        id: '1',
        name: 'Primary Checking',
        type: 'checking' as const,
        balance: 2500.75,
        institution: 'First National Bank',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'High Yield Savings',
        type: 'savings' as const,
        balance: 15000.00,
        institution: 'Online Savings Bank',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Credit Card',
        type: 'credit' as const,
        balance: -1250.50,
        institution: 'Credit Union',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Investment Account',
        type: 'investment' as const,
        balance: 45000.25,
        institution: 'Investment Firm',
        lastUpdated: new Date()
      }
    ];

    // Update the accounts signal with mock data
    // Mock data no longer supported in refactored services
    console.log('Mock accounts data loaded:', mockAccounts);
  }

  private loadMockSubscriptionsData(): void {
    // Add some mock subscription data for demonstration
    const mockSubscriptions = [
      {
        id: '1',
        name: 'Netflix',
        category: 'entertainment',
        amount: 15.99,
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Adobe Creative Cloud',
        category: 'software',
        amount: 52.99,
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Gym Membership',
        category: 'membership',
        amount: 45.00,
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        name: 'Microsoft Office 365',
        category: 'software',
        amount: 99.99,
        billingCycle: 'yearly' as const,
        nextBillingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      }
    ];

    // Update the subscriptions signal with mock data
    // Mock data no longer supported in refactored services
    console.log('Mock subscriptions data loaded:', mockSubscriptions);
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
        name: formValue.name,
        type: formValue.type,
        balance: formValue.balance,
        institution: formValue.institution,
        accountNumber: formValue.accountNumber || undefined,
        lastUpdated: new Date()
      };
      
      if (this.editingAccountId) {
        // Update existing account
        this.financialService.updateAccount(this.editingAccountId, account).subscribe({
          next: () => {
            this.accountDialog.hide();
            this.accountForm.reset({ balance: 0 });
            this.editingAccountId = null;
            this.toastService.success('Account Updated', `Account "${account.name}" updated successfully`);
          },
          error: (error) => {
            console.error('Error updating account:', error);
            this.toastService.error('Update Failed', 'Failed to update account');
          }
        });
      } else {
        // Create new account
        this.financialService.addAccount(account).subscribe({
          next: () => {
            this.accountDialog.hide();
            this.accountForm.reset({ balance: 0 });
            this.toastService.success('Account Created', `Account "${account.name}" created successfully`);
          },
          error: (error) => {
            console.error('Error saving account:', error);
            this.toastService.error('Creation Failed', 'Failed to create account');
          }
        });
      }
    }
  }

  protected saveSubscription(): void {
    if (this.subscriptionForm.valid) {
      const formValue = this.subscriptionForm.value;
      const subscription = {
        name: formValue.name,
        category: formValue.category,
        amount: formValue.amount,
        billingCycle: formValue.billingCycle,
        nextBillingDate: formValue.nextBillingDate
      };
      
      if (this.editingSubscriptionId) {
        // Update existing subscription
        this.financialService.updateSubscription(this.editingSubscriptionId, subscription).subscribe({
          next: () => {
            this.subscriptionDialog.hide();
            this.subscriptionForm.reset({
              billingCycle: 'monthly',
              nextBillingDate: new Date(),
              amount: 0
            });
            this.editingSubscriptionId = null;
            this.toastService.success('Subscription Updated', `Subscription "${subscription.name}" updated successfully`);
          },
          error: (error) => {
            console.error('Error updating subscription:', error);
            this.toastService.error('Update Failed', 'Failed to update subscription');
          }
        });
      } else {
        // Create new subscription
        this.financialService.addSubscription(subscription).subscribe({
          next: () => {
            this.subscriptionDialog.hide();
            this.subscriptionForm.reset({
              billingCycle: 'monthly',
              nextBillingDate: new Date(),
              amount: 0
            });
            this.toastService.success('Subscription Created', `Subscription "${subscription.name}" created successfully`);
          },
          error: (error) => {
            console.error('Error saving subscription:', error);
            this.toastService.error('Creation Failed', 'Failed to create subscription');
          }
        });
      }
    }
  }

  // Edit and Delete methods
  protected editAccount(account: any): void {
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      institution: account.institution,
      balance: account.balance
    });
    this.editingAccountId = account.id;
    this.accountDialog.show();
  }

  protected deleteAccount(account: any): void {
    Swal.fire({
      title: 'Delete Account',
      text: `Are you sure you want to delete the account "${account.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.financialService.deleteAccount(account.id).subscribe({
          next: () => {
            this.toastService.success('Account Deleted', `Account "${account.name}" deleted successfully`);
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.toastService.error('Deletion Failed', 'Failed to delete account');
          }
        });
      }
    });
  }

  protected editSubscription(subscription: any): void {
    this.subscriptionForm.patchValue({
      name: subscription.name,
      category: subscription.category,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle,
      nextBillingDate: new Date(subscription.nextBillingDate)
    });
    this.editingSubscriptionId = subscription.id;
    this.subscriptionDialog.show();
  }

  protected deleteSubscription(subscription: any): void {
    Swal.fire({
      title: 'Delete Subscription',
      text: `Are you sure you want to delete the subscription "${subscription.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.financialService.deleteSubscription(subscription.id).subscribe({
          next: () => {
            this.toastService.success('Subscription Deleted', `Subscription "${subscription.name}" deleted successfully`);
          },
          error: (error) => {
            console.error('Error deleting subscription:', error);
            this.toastService.error('Deletion Failed', 'Failed to delete subscription');
          }
        });
      }
    });
  }

  // Utility methods
  protected formatCurrency(args: any): string {
    // Handle both valueAccessor (direct value) and format (args.value) patterns
    const value = args.value !== undefined ? args.value : args;
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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
