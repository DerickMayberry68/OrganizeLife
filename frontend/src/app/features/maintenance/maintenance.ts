import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-maintenance',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule,
    CheckBoxModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss'
})
export class Maintenance {
  @ViewChild('taskDialog') taskDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly tasks = this.dataService.maintenanceTasks;

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly taskDialogButtons = [
    { click: () => this.saveTask(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.taskDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected taskForm: FormGroup;

  // Dropdown data
  protected readonly categories = ['plumbing', 'electrical', 'hvac', 'appliance', 'landscaping', 'cleaning', 'general', 'other'];
  protected readonly priorities = ['low', 'medium', 'high', 'urgent'];
  protected readonly frequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: [new Date(), Validators.required],
      estimatedCost: [0, Validators.min(0)],
      notes: [''],
      isRecurring: [false],
      frequency: ['monthly']
    });
  }

  protected openTaskDialog(): void {
    this.taskForm.reset({
      priority: 'medium',
      dueDate: new Date(),
      estimatedCost: 0,
      isRecurring: false,
      frequency: 'monthly'
    });
    this.taskDialog.show();
  }

  protected saveTask(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const task = {
        id: Date.now().toString(),
        title: formValue.title,
        category: formValue.category,
        priority: formValue.priority,
        status: 'pending' as const,
        dueDate: formValue.dueDate,
        estimatedCost: formValue.estimatedCost || undefined,
        notes: formValue.notes || undefined,
        isRecurring: formValue.isRecurring,
        frequency: formValue.frequency
      };
      this.dataService.addMaintenanceTask(task);
      this.taskDialog.hide();
      this.taskForm.reset({
        priority: 'medium',
        dueDate: new Date(),
        estimatedCost: 0,
        isRecurring: false,
        frequency: 'monthly'
      });
      this.toastService.success('Task Created', `${formValue.title} has been scheduled successfully.`);
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

  protected getPriorityBadge(priority: string): string {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  }
}
