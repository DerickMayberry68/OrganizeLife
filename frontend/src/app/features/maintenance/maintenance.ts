import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, AfterViewInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-maintenance',
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
    GroupService,
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService
  ],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss'
})
export class Maintenance implements OnInit, AfterViewInit {
  @ViewChild('taskDialog') taskDialog!: DialogComponent;

  private readonly maintenanceService = inject(MaintenanceService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly tasks = this.maintenanceService.maintenanceTasks;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalTasks = computed(() => this.tasks().length);

  protected readonly pendingTasks = computed(() =>
    this.tasks().filter(t => t.status === 'pending').length
  );

  protected readonly scheduledTasks = computed(() =>
    this.tasks().filter(t => t.status === 'scheduled').length
  );

  protected readonly completedTasks = computed(() =>
    this.tasks().filter(t => t.status === 'completed').length
  );

  protected readonly totalEstimatedCost = computed(() =>
    this.tasks()
      .filter(t => t.status !== 'completed' && t.estimatedCost)
      .reduce((sum, t) => sum + (t.estimatedCost || 0), 0)
  );

  protected readonly urgentTasks = computed(() =>
    this.tasks().filter(t => t.priority === 'urgent' && t.status !== 'completed').length
  );

  // Chart data with null safety
  protected readonly tasksByCategoryChart = computed(() => {
    const data = this.tasks();
    if (!data || data.length === 0) return [];

    const categoryCounts = data.reduce((acc: any, task) => {
      const category = task.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      x: category.charAt(0).toUpperCase() + category.slice(1),
      y: count,
      text: `${category}: ${count} tasks`
    }));
  });

  protected readonly tasksByStatusChart = computed(() => {
    const data = this.tasks();
    if (!data || data.length === 0) return [];

    const statusCounts = data.reduce((acc: any, task) => {
      const status = task.status || 'pending';
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      x: status.charAt(0).toUpperCase() + status.slice(1),
      y: count,
      text: `${status}: ${count} tasks`
    }));
  });

  protected readonly upcomingTasksList = computed(() =>
    this.tasks()
      .filter(t => t.status === 'pending' || t.status === 'scheduled')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  );

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
    title: 'Number of Tasks',
    labelFormat: 'n0',
    minimum: 0
  };
  protected readonly chartTitle = 'Tasks by Category';
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
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.tasksByCategoryChart();
      console.log('Maintenance Chart Data:', chartData);
    });

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
    // Load maintenance tasks when component initializes
    this.isLoading.set(true);
    this.maintenanceService.loadMaintenanceTasks().subscribe({
      next: (tasks) => {
        console.log('Loaded maintenance tasks:', tasks.length);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading maintenance tasks:', error);
        this.isLoading.set(false);
      }
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
      
      this.maintenanceService.addMaintenanceTask(task).subscribe({
        next: () => {
          this.taskDialog.hide();
          this.taskForm.reset({
            priority: 'medium',
            dueDate: new Date(),
            estimatedCost: 0,
            isRecurring: false,
            frequency: 'monthly'
          });
        },
        error: (error) => {
          console.error('Error saving maintenance task:', error);
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
      day: 'numeric'
    }).format(new Date(date));
  }

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected getDaysUntilText(date: Date): string {
    const days = this.getDaysUntil(date);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    return `Due in ${days} days`;
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

  protected getStatusBadge(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      case 'pending': return 'warning';
      default: return 'info';
    }
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'priority') {
      const priority = args.data.priority;
      const badge = this.getPriorityBadge(priority);
      args.cell.innerHTML = `<span class="badge badge--${badge}">${priority}</span>`;
    }
    if (args.column?.field === 'status') {
      const status = args.data.status;
      const badge = this.getStatusBadge(status);
      args.cell.innerHTML = `<span class="badge badge--${badge}">${status}</span>`;
    }
  }
}
