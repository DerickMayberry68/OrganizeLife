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
  selector: 'app-inventory',
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
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class Inventory {
  @ViewChild('itemDialog') itemDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  protected readonly items = this.dataService.inventoryItems;

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly itemDialogButtons = [
    { click: () => this.saveItem(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.itemDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected itemForm: FormGroup;

  // Dropdown data
  protected readonly categories = ['Electronics', 'Appliances', 'Furniture', 'Tools', 'Kitchen', 'Other'];
  protected readonly locations = ['Living Room', 'Kitchen', 'Bedroom', 'Garage', 'Basement', 'Office', 'Other'];

  constructor() {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      purchaseDate: [new Date(), Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      notes: ['']
    });
  }

  protected openItemDialog(): void {
    this.itemForm.reset({
      purchaseDate: new Date(),
      purchasePrice: 0
    });
    this.itemDialog.show();
  }

  protected saveItem(): void {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const item = {
        id: Date.now().toString(),
        name: formValue.name,
        category: formValue.category,
        purchaseDate: formValue.purchaseDate,
        purchasePrice: formValue.purchasePrice,
        location: formValue.location,
        notes: formValue.notes || undefined
      };
      // Add to data service (you'll need to add this method)
      // this.dataService.addInventoryItem(item);
      this.itemDialog.hide();
      this.itemForm.reset({ purchaseDate: new Date(), purchasePrice: 0 });
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
