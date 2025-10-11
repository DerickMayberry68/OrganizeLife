# AI Prompt: Standardize Page Design

Use this prompt to update remaining pages to match the Dashboard and Financial page designs.

---

## Prompt

Update the [PAGE_NAME] component to match the design patterns, structure, and styling used in the Dashboard (`src/app/features/dashboard/`) and Financial (`src/app/features/financial/`) pages.

### Requirements:

1. **Add proper page structure:**
   - Wrap content in `<div class="[page-name]">`
   - Add page header with emoji icon and title
   - Add action buttons in `<div class="page-header__actions">`
   - Add loading state with spinner using `@if (isLoading())`

2. **Add stats overview section** (if applicable):
   - Use `<app-stat-card>` components
   - Show 3-4 key metrics at the top
   - Use appropriate variant colors and emoji icons

3. **Fix all Syncfusion charts:**
   - Import: `CategoryService, ColumnSeriesService, LegendService, TooltipService` from `@syncfusion/ej2-angular-charts`
   - Add these services to component `providers` array
   - Add null safety check: `if (!data || data.length === 0) return [];`
   - Configure axes with proper types (`any`):
     - `primaryXAxis`: valueType='Category', labelIntersectAction='Rotate45'
     - `primaryYAxis`: labelFormat='c0', minimum=0
   - Add three states in template:
     - Data exists: show chart with `[enableAnimation]="true"`
     - Loading: show spinner
     - Empty: show helpful message with CTA button
   - Use proper chart configuration with tooltips and markers

4. **Fix all Syncfusion grids:**
   - Import: `PageService, SortService, FilterService, GroupService`
   - Add to providers array
   - Add `[allowPaging]="true"`, `[allowSorting]="true"`, `[allowFiltering]="true"`
   - Set `pageSettings = { pageSize: 10 }` and `filterSettings = { type: 'Excel' }`
   - Add empty state when no data: `@else { <div class="empty-state">...</div> }`

5. **Implement dialogs for create/edit:**
   - Import `DialogComponent, DialogModule`
   - Add `@ViewChild` reference
   - Configure dialog buttons with save/cancel actions
   - Create reactive form with proper validation
   - Handle form submission with error handling
   - Show toast notifications on success/error

6. **Add proper empty states:**
   - Use emoji icons (📦, 📊, etc.)
   - Include helpful message explaining what the section is for
   - Add CTA button to create first item
   - Example:
     ```html
     <div class="empty-state">
       <p>📦 No items found.</p>
       <p>Get started by creating your first item.</p>
       <button class="btn btn--outline" (click)="openDialog()">+ Create Item</button>
     </div>
     ```

7. **Use consistent styling:**
   - Wrap sections in `<section class="[page-name]__section">`
   - Use cards: `<div class="card">` with `<div class="card-header">` and `<div class="card-content">`
   - Use consistent button classes: `btn--accent`, `btn--outline`, `btn--error`, `btn--success`
   - Use badge classes: `badge--success`, `badge--warning`, `badge--error`, `badge--info`

8. **Add data loading pattern:**
   - Create `ngOnInit()` that calls `loadData()` in `setTimeout`
   - Use `Promise.allSettled()` to load multiple endpoints
   - Set `isLoading.set(true)` before loading, `isLoading.set(false)` after
   - Log warnings for failed endpoints

9. **Use signals and computed values:**
   - Convert state to signals: `isLoading = signal(false)`
   - Use computed for derived values: `computed(() => ...)`
   - Reference reactive data from DataService

10. **Add utility methods:**
    - `formatCurrency(amount)` - USD currency formatting
    - `formatDate(date)` - Short date format
    - `formatDateTime(date)` - Full date with time
    - Keep methods consistent with Dashboard/Financial

11. **Follow Angular 18+ patterns:**
    - Use `@if`, `@for`, `@else` instead of `*ngIf`, `*ngFor`
    - Use standalone components
    - Use inject() for dependency injection
    - Track items by id: `@for (item of items(); track item.id)`

### Specific Fixes Needed:

- [ ] Import all required Syncfusion services (Category, ColumnSeries, Legend, Tooltip for charts)
- [ ] Add services to providers array
- [ ] Add null safety to all chart data computed values
- [ ] Fix axis configuration with proper types
- [ ] Add three-state rendering for charts (data/loading/empty)
- [ ] Add empty states to all lists/grids
- [ ] Add loading states
- [ ] Implement proper form validation
- [ ] Add utility formatting methods
- [ ] Use consistent card/button/badge styling
- [ ] Add emoji icons to headers and empty states
- [ ] Ensure all dialogs have proper buttons and animations

### Reference Files to Study:
- `src/app/features/dashboard/dashboard.ts`
- `src/app/features/dashboard/dashboard.html`
- `src/app/features/financial/financial.ts`
- `src/app/features/financial/financial.html`

Apply ALL patterns from these reference files to ensure visual and functional consistency across the application.

---

## Example Usage

To update the Bills page:
```
Update the Bills component to match the design patterns, structure, and styling used in the Dashboard and Financial pages. [Follow all requirements above]
```

To update the Maintenance page:
```
Update the Maintenance component to match the design patterns, structure, and styling used in the Dashboard and Financial pages. [Follow all requirements above]
```

