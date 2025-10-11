# Design Standardization Prompt

## Objective
Update all remaining Angular components to match the design patterns, structure, and styling used in the Dashboard and Financial pages.

## Reference Pages
- **Dashboard** (`src/app/features/dashboard/`)
- **Financial** (`src/app/features/financial/`)

## Design Patterns to Apply

### 1. Page Structure & Layout

#### Header Section
```html
<div class="[page-name]">
  <!-- Optional: Breadcrumbs -->
  <app-breadcrumb [items]="breadcrumbs" />
  
  <!-- Page Header with Actions -->
  <h1 class="page-header">
    [Icon] Page Title
    <div class="page-header__actions">
      <button class="btn btn--accent" (click)="openDialog()">
        + Primary Action
      </button>
      <button class="btn btn--outline" (click)="secondaryAction()">
        Secondary Action
      </button>
    </div>
  </h1>

  <!-- Loading Indicator -->
  @if (isLoading()) {
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading [data type]...</p>
    </div>
  }
</div>
```

#### Stats Overview Section
```html
<section class="[page-name]__overview">
  <app-stat-card
    title="Stat Title"
    [value]="statValue()"
    icon="📊"
    variant="accent"
  />
  <!-- Repeat for 3-4 stats -->
</section>
```

#### Content Sections
```html
<section class="[page-name]__section">
  <div class="card">
    <div class="card-header">
      <h3>Section Title</h3>
    </div>
    <div class="card-content">
      <!-- Content here -->
    </div>
  </div>
</section>
```

### 2. Chart Integration (Syncfusion)

#### Required Imports
```typescript
import { 
  ChartModule, 
  CategoryService, 
  ColumnSeriesService, 
  LegendService, 
  TooltipService 
} from '@syncfusion/ej2-angular-charts';
```

#### Component Providers
```typescript
@Component({
  // ...
  providers: [
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService
  ]
})
```

#### Chart Configuration
```typescript
// Chart data with null safety
protected readonly chartData = computed(() => {
  const data = this.dataService.getData();
  
  if (!data || data.length === 0) {
    return [];
  }
  
  return data.map(item => ({
    x: item.label,
    y: item.value,
    text: `${item.label}: $${item.value}`
  }));
});

// Axis configuration
protected readonly primaryXAxis: any = {
  valueType: 'Category',
  title: 'X Axis Title',
  labelIntersectAction: 'Rotate45'
};

protected readonly primaryYAxis: any = {
  title: 'Y Axis Title',
  labelFormat: 'c0', // Currency format
  minimum: 0
};

protected readonly tooltip: any = {
  enable: true,
  format: '${point.x}: ${point.y}'
};

protected readonly marker: any = {
  visible: true,
  height: 10,
  width: 10,
  dataLabel: { visible: false }
};
```

#### Chart Template
```html
@if (!isLoading() && chartData().length > 0) {
  <ejs-chart
    style="display:block; width:100%;"
    [primaryXAxis]="primaryXAxis"
    [primaryYAxis]="primaryYAxis"
    [title]="chartTitle"
    [tooltip]="tooltip"
    [height]="'350'"
    [enableAnimation]="true">
    <e-series-collection>
      <e-series 
        [dataSource]="chartData()" 
        type='Column' 
        xName='x' 
        yName='y' 
        name='Series Name'
        [marker]="marker">
      </e-series>
    </e-series-collection>
  </ejs-chart>
} @else if (isLoading()) {
  <div class="empty-state">
    <div class="spinner"></div>
    <p>Loading chart data...</p>
  </div>
} @else {
  <div class="empty-state">
    <p>📊 No data available.</p>
    <p>Helpful message about how to add data.</p>
    <button class="btn btn--outline" (click)="openDialog()">+ Add Data</button>
  </div>
}
```

### 3. Data Grid Integration (Syncfusion)

#### Required Imports
```typescript
import { 
  GridModule, 
  PageService, 
  SortService, 
  FilterService, 
  GroupService 
} from '@syncfusion/ej2-angular-grids';
```

#### Component Providers
```typescript
providers: [
  PageService, 
  SortService, 
  FilterService, 
  GroupService
]
```

#### Grid Configuration
```typescript
protected readonly pageSettings = { pageSize: 10 };
protected readonly filterSettings = { type: 'Excel' };
```

#### Grid Template
```html
@if (data().length > 0) {
  <ejs-grid 
    [dataSource]="data()" 
    [allowPaging]="true"
    [allowSorting]="true"
    [allowFiltering]="true"
    [pageSettings]="pageSettings"
    [filterSettings]="filterSettings">
    <e-columns>
      <e-column field="fieldName" headerText="Column Header" width="120"></e-column>
      <!-- Add more columns -->
    </e-columns>
  </ejs-grid>
} @else {
  <div class="empty-state">
    <p>No data available</p>
  </div>
}
```

### 4. Dialog/Modal Patterns (Syncfusion)

#### Required Imports
```typescript
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
```

#### ViewChild Reference
```typescript
@ViewChild('dialogRef') dialog!: DialogComponent;
```

#### Dialog Configuration
```typescript
protected readonly dialogWidth = '500px';
protected readonly animationSettings = { effect: 'Zoom' };
protected readonly dialogButtons = [
  { 
    click: () => this.saveData(), 
    buttonModel: { content: 'Save', isPrimary: true } 
  },
  { 
    click: () => this.dialog.hide(), 
    buttonModel: { content: 'Cancel' } 
  }
];
```

#### Dialog Template
```html
<ejs-dialog
  #dialogRef
  header="Dialog Title"
  [width]="dialogWidth"
  [isModal]="true"
  [visible]="false"
  [animationSettings]="animationSettings"
  [buttons]="dialogButtons">
  <ng-template #content>
    <form [formGroup]="form" class="form">
      <div class="form-group">
        <label>Field Label *</label>
        <ejs-textbox formControlName="field" placeholder="Enter value"></ejs-textbox>
      </div>
      <!-- Add more form fields -->
    </form>
  </ng-template>
</ejs-dialog>
```

### 5. Form Patterns

#### Form Structure
```html
<form [formGroup]="form" class="form">
  <div class="form-group">
    <label>Field Label *</label>
    <ejs-textbox 
      formControlName="fieldName" 
      placeholder="Enter value">
    </ejs-textbox>
  </div>

  <div class="form-group">
    <label>Dropdown *</label>
    <ejs-dropdownlist
      formControlName="fieldName"
      [dataSource]="options()"
      [fields]="{ text: 'name', value: 'id' }"
      placeholder="Select option">
    </ejs-dropdownlist>
  </div>

  <div class="form-group">
    <label>Number Field *</label>
    <ejs-numerictextbox
      formControlName="amount"
      [min]="0"
      [step]="0.01"
      format="c2"
      placeholder="0.00">
    </ejs-numerictextbox>
  </div>

  <div class="form-group">
    <label>Date *</label>
    <ejs-datepicker formControlName="date"></ejs-datepicker>
  </div>

  <div class="form-group">
    <label>
      <input type="checkbox" formControlName="isActive" />
      Checkbox Label
    </label>
  </div>
</form>
```

#### Form Validation
```typescript
this.form = this.fb.group({
  fieldName: ['', Validators.required],
  amount: [0, [Validators.required, Validators.min(0.01)]],
  email: ['', [Validators.required, Validators.email]]
});

protected saveData(): void {
  if (this.form.valid) {
    const formValue = this.form.value;
    
    // Manual validation for critical fields
    if (!formValue.requiredField) {
      this.toastService.error('Validation Error', 'Please fill required field');
      return;
    }
    
    const dto = {
      field1: formValue.field1,
      field2: formValue.field2 || undefined // Handle optional fields
    };
    
    this.dataService.saveData(dto).subscribe({
      next: () => {
        this.dialog.hide();
        this.form.reset();
      },
      error: (error) => {
        console.error('Failed to save:', error);
      }
    });
  }
}
```

### 6. Empty States & Loading States

#### Empty State Pattern
```html
<div class="empty-state">
  <p>📦 No [items] found.</p>
  <p>Get started by creating your first [item].</p>
  <button class="btn btn--outline" (click)="openDialog()">+ Create [Item]</button>
</div>
```

#### Loading State Pattern
```html
@if (isLoading()) {
  <div class="loading-overlay">
    <div class="spinner"></div>
    <p>Loading data...</p>
  </div>
}
```

### 7. Card Layouts

#### Standard Card
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

#### Card with Actions
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
    <button class="btn btn--sm btn--outline" (click)="action()">Action</button>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

#### Accent Card
```html
<div class="card card--accent">
  <!-- Content -->
</div>
```

### 8. Data Display Patterns

#### List Items
```html
<div class="item-list">
  @for (item of items(); track item.id) {
    <div class="list-item">
      <div class="list-item__info">
        <h3 class="list-item__title">{{ item.title }}</h3>
        <span class="list-item__meta">{{ item.meta }}</span>
      </div>
      <div class="list-item__actions">
        <button class="btn btn--sm btn--outline" (click)="edit(item.id)">Edit</button>
        <button class="btn btn--sm btn--error" (click)="delete(item.id)">Delete</button>
      </div>
    </div>
  }
</div>
```

#### Badges
```html
<span class="badge badge--success">Success</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--error">Error</span>
<span class="badge badge--info">Info</span>
```

#### Progress Bars
```html
<div class="progress-bar">
  <div 
    class="progress-bar__fill progress-bar__fill--success"
    [style.width.%]="percentage">
  </div>
</div>
<div class="progress-bar__labels">
  <span>{{ currentValue }}</span>
  <span>{{ maxValue }}</span>
</div>
```

### 9. Component Lifecycle & Data Loading

#### OnInit Pattern
```typescript
ngOnInit(): void {
  // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
  setTimeout(() => {
    this.loadData();
  });
}

private loadData(): void {
  this.isLoading.set(true);
  
  Promise.allSettled([
    this.dataService.loadItems1().toPromise(),
    this.dataService.loadItems2().toPromise()
  ])
    .then((results) => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const endpoints = ['Items1', 'Items2'];
          console.warn(`Failed to load ${endpoints[index]}:`, result.reason);
        }
      });
      this.isLoading.set(false);
    })
    .catch(error => {
      console.error('Error loading data:', error);
      this.isLoading.set(false);
    });
}
```

### 10. Computed Values & Signals

```typescript
// Use signals for reactive state
protected readonly isLoading = signal(false);

// Use computed for derived values
protected readonly totalAmount = computed(() =>
  this.items().reduce((sum, item) => sum + item.amount, 0)
);

protected readonly filteredItems = computed(() =>
  this.items().filter(item => item.isActive)
);
```

### 11. Utility Methods

```typescript
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

protected formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
```

### 12. Button Styles

```html
<!-- Primary Action -->
<button class="btn btn--accent">[Action]</button>

<!-- Secondary Action -->
<button class="btn btn--outline">[Action]</button>

<!-- Small Button -->
<button class="btn btn--sm btn--outline">[Action]</button>

<!-- Error/Delete Action -->
<button class="btn btn--error">[Delete]</button>

<!-- Success Action -->
<button class="btn btn--success">[Save]</button>
```

### 13. Responsive Grid Layouts

```html
<div class="grid">
  @for (item of items(); track item.id) {
    <div class="card">
      <!-- Card content -->
    </div>
  }
</div>
```

Or specific grids:
```html
<div class="budget-grid">
  <!-- 2-3 column responsive grid -->
</div>

<div class="dashboard__grid">
  <!-- Dashboard-specific grid -->
</div>
```

### 14. Icon Usage

Use emoji icons consistently:
- 📊 Charts/Analytics
- 💰 Money/Budget
- 💳 Payments/Cards
- 📮 Bills/Mail
- 🔧 Maintenance/Tools
- ⚠️ Warnings/Alerts
- 📄 Documents
- 🏠 Home/Household
- ⚡ Quick Actions
- 📦 Items/Inventory

## Implementation Checklist

For each page to be updated:

- [ ] Add proper page structure with `<div class="[page-name]">`
- [ ] Add page header with title and action buttons
- [ ] Add loading state with `isLoading()` signal
- [ ] Add stats overview section if applicable
- [ ] Add content sections wrapped in cards
- [ ] Implement charts with proper services and null safety
- [ ] Implement grids with pagination, sorting, filtering
- [ ] Add dialogs for create/edit operations
- [ ] Add empty states with helpful messages and CTAs
- [ ] Implement proper form validation
- [ ] Add computed values for derived data
- [ ] Add utility methods for formatting
- [ ] Use consistent button styles
- [ ] Use emoji icons consistently
- [ ] Add proper error handling in subscriptions
- [ ] Test responsiveness on mobile/tablet/desktop

## Pages to Update

1. **Bills** (`src/app/features/bills/`)
2. **Maintenance** (`src/app/features/maintenance/`)
3. **Documents** (`src/app/features/documents/`)
4. **Household** (`src/app/features/household/`)
5. **Insurance** (`src/app/features/insurance/`)
6. **Inventory** (`src/app/features/inventory/`)
7. **Warranties** (`src/app/features/warranties/`)

## Notes

- Always use Angular 18+ control flow syntax (`@if`, `@for`, `@else`)
- Use signals for reactive state management
- Use computed for derived values
- Import only necessary Syncfusion modules
- Follow the same color scheme and spacing
- Maintain consistent error handling patterns
- Use the ToastService for user notifications
- Keep accessibility in mind (proper labels, ARIA attributes)

