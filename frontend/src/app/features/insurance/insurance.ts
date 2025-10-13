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
  selector: 'app-insurance',
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
  templateUrl: './insurance.html',
  styleUrl: './insurance.scss'
})
export class Insurance implements OnInit {
  @ViewChild('policyDialog') policyDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly policies = this.dataService.insurancePolicies;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalPolicies = computed(() => this.policies().length);

  protected readonly totalPremiums = computed(() =>
    this.policies().reduce((sum, p) => sum + p.premium, 0)
  );

  protected readonly renewingSoon = computed(() =>
    this.policies().filter(p => {
      const days = this.getDaysUntilRenewal(p.renewalDate);
      return days >= 0 && days <= 30;
    }).length
  );

  protected readonly totalCoverage = computed(() => {
    const types = new Set(this.policies().map(p => p.type));
    return types.size;
  });

  // Chart data with null safety
  protected readonly policiesByTypeChart = computed(() => {
    const data = this.policies();
    if (!data || data.length === 0) return [];

    const typeCounts = data.reduce((acc: any, policy) => {
      const type = policy.type || 'Other';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      x: type.charAt(0).toUpperCase() + type.slice(1),
      y: count,
      text: `${type}: ${count} policies`
    }));
  });

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart settings with proper types
  protected readonly primaryXAxis: any = {
    valueType: 'Category',
    title: 'Policy Types',
    labelIntersectAction: 'Rotate45'
  };
  protected readonly primaryYAxis: any = {
    title: 'Number of Policies',
    labelFormat: 'n0',
    minimum: 0
  };
  protected readonly chartTitle = 'Policies by Type';
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
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.policiesByTypeChart();
      console.log('Insurance Chart Data:', chartData);
    });

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

  ngOnInit(): void {
    // Data is already loaded via DataService signals
    setTimeout(() => {
      this.isLoading.set(false);
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
      
      this.dataService.addInsurancePolicy(policy).subscribe({
        next: () => {
          this.policyDialog.hide();
          this.policyForm.reset({
            billingFrequency: 'annual',
            startDate: new Date(),
            renewalDate: new Date(),
            premium: 0,
            deductible: 0
          });
        },
        error: (error) => {
          console.error('Error saving insurance policy:', error);
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

  protected getDaysUntilRenewal(renewalDate: Date): number {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'type') {
      const type = args.data.type;
      args.cell.innerHTML = `<span class="badge badge--info">${type}</span>`;
    }
    if (args.column?.field === 'billingFrequency') {
      const frequency = args.data.billingFrequency;
      args.cell.innerHTML = `<span class="badge badge--default">${frequency}</span>`;
    }
  }
}
