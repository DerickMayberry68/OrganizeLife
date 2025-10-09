import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-accounts',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss'
})
export class Accounts {
  @ViewChild('accountDialog') accountDialog!: DialogComponent;
  @ViewChild('subscriptionDialog') subscriptionDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  protected readonly accounts = this.dataService.accounts;
  protected readonly subscriptions = this.dataService.subscriptions;

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
  protected readonly accountTypes = ['checking', 'savings', 'credit', 'investment'];
  protected readonly billingCycles = ['monthly', 'yearly', 'quarterly'];

  constructor() {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      institution: ['', Validators.required],
      balance: [0, Validators.required]
    });

    this.subscriptionForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      billingCycle: ['monthly', Validators.required],
      nextBillingDate: [new Date(), Validators.required]
    });
  }

  protected openAccountDialog(): void {
    this.accountForm.reset({ balance: 0 });
    this.accountDialog.show();
  }

  protected openSubscriptionDialog(): void {
    this.subscriptionForm.reset({
      billingCycle: 'monthly',
      nextBillingDate: new Date()
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
        institution: formValue.institution,
        balance: formValue.balance,
        lastUpdated: new Date()
      };
      // this.dataService.addAccount(account);
      this.accountDialog.hide();
      this.accountForm.reset({ balance: 0 });
    }
  }

  protected saveSubscription(): void {
    if (this.subscriptionForm.valid) {
      const formValue = this.subscriptionForm.value;
      const subscription = {
        id: Date.now().toString(),
        name: formValue.name,
        amount: formValue.amount,
        category: formValue.category,
        billingCycle: formValue.billingCycle,
        nextBillingDate: formValue.nextBillingDate
      };
      // this.dataService.addSubscription(subscription);
      this.subscriptionDialog.hide();
      this.subscriptionForm.reset({
        billingCycle: 'monthly',
        nextBillingDate: new Date()
      });
    }
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
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
}
