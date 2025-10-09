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
  selector: 'app-insurance',
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
  templateUrl: './insurance.html',
  styleUrl: './insurance.scss'
})
export class Insurance {
  @ViewChild('policyDialog') policyDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  protected readonly policies = this.dataService.insurancePolicies;

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly policyDialogButtons = [
    { click: () => this.savePolicy(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.policyDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected policyForm: FormGroup;

  // Dropdown data
  protected readonly insuranceTypes = ['home', 'auto', 'health', 'life', 'disability', 'umbrella', 'other'];
  protected readonly billingFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual'];

  constructor() {
    this.policyForm = this.fb.group({
      provider: ['', Validators.required],
      type: ['', Validators.required],
      policyNumber: ['', Validators.required],
      premium: [0, [Validators.required, Validators.min(0.01)]],
      billingFrequency: ['annual', Validators.required],
      startDate: [new Date(), Validators.required],
      renewalDate: [new Date(), Validators.required],
      coverage: ['', Validators.required],
      deductible: [0, Validators.min(0)]
    });
  }

  protected openPolicyDialog(): void {
    this.policyForm.reset({
      billingFrequency: 'annual',
      startDate: new Date(),
      renewalDate: new Date(),
      premium: 0,
      deductible: 0
    });
    this.policyDialog.show();
  }

  protected savePolicy(): void {
    if (this.policyForm.valid) {
      const formValue = this.policyForm.value;
      const policy = {
        id: Date.now().toString(),
        provider: formValue.provider,
        type: formValue.type,
        policyNumber: formValue.policyNumber,
        premium: formValue.premium,
        billingFrequency: formValue.billingFrequency,
        startDate: formValue.startDate,
        renewalDate: formValue.renewalDate,
        coverage: formValue.coverage,
        deductible: formValue.deductible || undefined
      };
      // this.dataService.addInsurancePolicy(policy);
      this.policyDialog.hide();
      this.policyForm.reset({
        billingFrequency: 'annual',
        startDate: new Date(),
        renewalDate: new Date(),
        premium: 0,
        deductible: 0
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

  protected getDaysUntilRenewal(renewalDate: Date): number {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
