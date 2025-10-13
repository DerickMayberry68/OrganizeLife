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
  selector: 'app-inventory',
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
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class Inventory implements OnInit {
  @ViewChild('itemDialog') itemDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly items = this.dataService.inventoryItems;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalItems = computed(() => this.items().length);

  protected readonly totalValue = computed(() =>
    this.items().reduce((sum, i) => sum + i.purchasePrice, 0)
  );

  protected readonly warrantyActive = computed(() =>
    this.items().filter(i => {
      if (!i.warranty?.endDate) return false;
      return new Date(i.warranty.endDate) > new Date();
    }).length
  );

  protected readonly totalCategories = computed(() => {
    const categories = new Set(this.items().map(i => i.category));
    return categories.size;
  });

  // Chart data with null safety
  protected readonly itemsByCategoryChart = computed(() => {
    const data = this.items();
    if (!data || data.length === 0) return [];

    const categoryValues = data.reduce((acc: any, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.purchasePrice;
      return acc;
    }, {});

    return Object.entries(categoryValues).map(([category, value]) => ({
      x: category.charAt(0).toUpperCase() + category.slice(1),
      y: value,
      text: `${category}: $${(value as number).toFixed(2)}`
    }));
  });

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
    title: 'Total Value',
    labelFormat: 'c0',
    minimum: 0
  };
  protected readonly chartTitle = 'Inventory Value by Category';
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
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.itemsByCategoryChart();
      console.log('Inventory Chart Data:', chartData);
    });

    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      purchaseDate: [new Date(), Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Data is already loaded via DataService signals
    setTimeout(() => {
      this.isLoading.set(false);
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
        name: formValue.name,
        category: formValue.category,
        purchaseDate: formValue.purchaseDate,
        purchasePrice: formValue.purchasePrice,
        location: formValue.location,
        notes: formValue.notes || undefined
      };
      
      this.dataService.addInventoryItem(item).subscribe({
        next: () => {
          this.itemDialog.hide();
          this.itemForm.reset({ purchaseDate: new Date(), purchasePrice: 0 });
        },
        error: (error) => {
          console.error('Error saving inventory item:', error);
        }
      });
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
    if (args.column?.field === 'category') {
      const category = args.data.category;
      args.cell.innerHTML = `<span class="badge badge--info">${category}</span>`;
    }
    if (args.column?.field === 'location') {
      const location = args.data.location;
      args.cell.innerHTML = `<span class="badge badge--default">${location}</span>`;
    }
  }
}
