import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { GridModule, PageService, SortService, FilterService } from '@syncfusion/ej2-angular-grids';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-bills',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GridModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule,
    CheckBoxModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PageService, SortService, FilterService],
  templateUrl: './bills.html',
  styleUrl: './bills.scss'
})
export class Bills {
  @ViewChild('billDialog') billDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly bills = this.dataService.bills;
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

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

  protected openBillDialog(): void {
    this.billForm.reset({
      dueDate: new Date(),
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
        id: Date.now().toString(),
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
      this.dataService.addBill(bill);
      this.billDialog.hide();
      this.billForm.reset({
        dueDate: new Date(),
        isRecurring: false,
        frequency: 'monthly',
        autoPayEnabled: false,
        reminderDays: 3
      });
      this.toastService.success('Bill Added', `${formValue.name} has been scheduled successfully.`);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(args.value));
  }

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
