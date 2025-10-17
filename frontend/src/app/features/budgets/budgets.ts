import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import type { Budget, CreateBudgetDto } from '../../models/financial.model';

@Component({
  selector: 'app-budgets',
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
    ToolbarService,
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class Budgets implements OnInit {
  @ViewChild('budgetDialog') budgetDialog!: DialogComponent;

  private readonly financialService = inject(FinancialService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly budgets = this.financialService.budgets;
  protected readonly categories = this.financialService.categories;
  protected readonly isLoading = signal(false);
  protected readonly editMode = signal(false);
  protected readonly selectedBudget = signal<Budget | null>(null);

  // Computed values
  protected readonly totalBudgets = computed(() => this.budgets().length);

  protected readonly activeBudgets = computed(() =>
    this.budgets().filter(b => b.isActive).length
  );

  protected readonly totalBudgetAmount = computed(() =>
    this.budgets()
      .filter(b => b.isActive)
      .reduce((sum, b) => sum + b.limitAmount, 0)
  );

  protected readonly monthlyBudgets = computed(() =>
    this.budgets().filter(b => b.period === 'Monthly' && b.isActive).length
  );

  // Chart data
  protected readonly budgetsByCategoryChart = computed(() => {
    const data = this.budgets().filter(b => b.isActive);
    if (!data || data.length === 0) return [];

    const categoryTotals = data.reduce((acc: any, budget) => {
      const category = budget.categoryName || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += budget.limitAmount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, total]) => ({
      x: category,
      y: total,
      text: `${category}: $${(total as number).toFixed(2)}`
    }));
  });

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };
  protected readonly toolbar = ['Search'];

  // Chart settings
  protected readonly primaryXAxis: any = {
    valueType: 'Category',
    title: 'Categories',
    labelIntersectAction: 'Rotate45'
  };
  protected readonly primaryYAxis: any = {
    title: 'Amount ($)',
    labelFormat: 'c0',
    minimum: 0
  };
  protected readonly chartTitle = 'Budgets by Category';
  protected readonly tooltip = { enable: true, format: '${point.x}: ${point.y}' };
  protected readonly marker = {
    visible: true,
    height: 10,
    width: 10,
    dataLabel: { visible: false }
  };
  protected readonly chartBackground = 'white';
  protected readonly palettes = ['#1b76ff', '#1bb8ff', '#3ddc84', '#ff8c42', '#ff5757'];

  // Dialog settings
  protected readonly dialogWidth = '600px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly budgetDialogButtons = [
    { click: () => this.saveBudget(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.budgetDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected budgetForm: FormGroup;

  // Dropdown data
  protected readonly periods = ['Monthly', 'Quarterly', 'Yearly'];

  constructor() {
    effect(() => {
      const chartData = this.budgetsByCategoryChart();
      console.log('Budgets Chart Data:', chartData);
    });

    this.budgetForm = this.fb.group({
      categoryId: ['', Validators.required],
      name: ['', Validators.required],
      limitAmount: [0, [Validators.required, Validators.min(0.01)]],
      period: ['Monthly', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.financialService.loadBudgets().subscribe();
    this.financialService.loadCategories().subscribe();
    setTimeout(() => {
      this.isLoading.set(false);
    });
  }

  protected openBudgetDialog(budget?: Budget): void {
    this.editMode.set(!!budget);
    this.selectedBudget.set(budget || null);

    if (budget) {
      this.budgetForm.patchValue({
        categoryId: budget.categoryId,
        name: budget.name,
        limitAmount: budget.limitAmount,
        period: budget.period,
        startDate: new Date(budget.startDate),
        endDate: budget.endDate ? new Date(budget.endDate) : null,
        isActive: budget.isActive
      });
    } else {
      this.budgetForm.reset({
        period: 'Monthly',
        startDate: new Date(),
        isActive: true,
        limitAmount: 0
      });
    }
    this.budgetDialog.show();
  }

  protected saveBudget(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;

      if (this.editMode() && this.selectedBudget()) {
        const updates: Partial<Budget> = {
          categoryId: formValue.categoryId,
          name: formValue.name,
          limitAmount: formValue.limitAmount,
          period: formValue.period,
          startDate: formValue.startDate,
          endDate: formValue.endDate || undefined,
          isActive: formValue.isActive
        };

        this.financialService.updateBudget(this.selectedBudget()!.id, updates).subscribe({
          next: () => {
            this.budgetDialog.hide();
            this.budgetForm.reset();
            this.selectedBudget.set(null);
          },
          error: (error) => {
            console.error('Error updating budget:', error);
          }
        });
      } else {
        const budgetDto: CreateBudgetDto = {
          categoryId: formValue.categoryId,
          name: formValue.name,
          limitAmount: formValue.limitAmount,
          period: formValue.period,
          startDate: formValue.startDate,
          endDate: formValue.endDate || undefined,
          isActive: formValue.isActive !== undefined ? formValue.isActive : true
        };

        this.financialService.addBudget(budgetDto).subscribe({
          next: () => {
            this.budgetDialog.hide();
            this.budgetForm.reset({
              period: 'Monthly',
              startDate: new Date(),
              isActive: true,
              limitAmount: 0
            });
          },
          error: (error) => {
            console.error('Error saving budget:', error);
          }
        });
      }
    }
  }

  protected editBudget(budget: Budget): void {
    this.openBudgetDialog(budget);
  }

  protected deleteBudget(budget: Budget): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Delete Budget',
        text: `Are you sure you want to delete the budget "${budget.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.financialService.deleteBudget(budget.id).subscribe({
            next: () => {
              this.toastService.success('Budget Deleted', `Budget "${budget.name}" deleted successfully`);
            },
            error: (error) => {
              console.error('Error deleting budget:', error);
              this.toastService.error('Deletion Failed', 'Failed to delete budget');
            }
          });
        }
      });
    });
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

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'period') {
      const period = args.data.period;
      args.cell.innerHTML = `<span class="badge badge--info">${period}</span>`;
    }
    if (args.column?.field === 'isActive') {
      const isActive = args.data.isActive;
      if (isActive) {
        args.cell.innerHTML = '<span class="badge badge--success">Active</span>';
      } else {
        args.cell.innerHTML = '<span class="badge badge--default">Inactive</span>';
      }
    }
  }

  protected onActionBegin(args: any): void {
    if (args.requestType === 'beginEdit' || args.requestType === 'add') {
      this.openBudgetDialog(args.requestType === 'beginEdit' ? args.rowData : undefined);
      args.cancel = true;
    } else if (args.requestType === 'delete') {
      this.deleteBudget(args.data[0].id);
      args.cancel = true;
    }
  }
}

