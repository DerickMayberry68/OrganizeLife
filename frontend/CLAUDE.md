# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Butler** is a household management system built with Angular 20, Supabase backend, and Syncfusion UI components. It manages finances, documents, healthcare, inventory, maintenance, insurance, and more.

## Common Commands

```bash
npm start              # Run dev server (ng serve on port 4200)
npm run build          # Production build
npm run watch          # Development with watch mode
npm test               # Run tests (Karma + Jasmine)
npm run validate:columns  # Validate column mappings
```

Version bumping (auto-increments and builds):
```bash
npm run build:patch    # Patch version bump + build
npm run build:minor    # Minor version bump + build
npm run build:major    # Major version bump + build
```

## Architecture

### Technology Stack
- **Angular 20** with standalone components (no NgModules)
- **Zoneless change detection** for performance
- **Angular signals** for reactive state management
- **Supabase** PostgreSQL backend with Row Level Security
- **Syncfusion EJ2** component library (Tailwind theme)
- **Bootstrap 5.3** utilities + custom SCSS

### Key Directories
```
src/app/
├── components/     # Layout: header, sidebar, theme-panel
├── features/       # Lazy-loaded feature modules
├── services/       # Business logic & Supabase integration
├── models/         # TypeScript interfaces
├── shared/         # Reusable components (stat-card, breadcrumb)
└── config/         # Environment configuration
```

### Service Architecture

All domain services extend `BaseApiService` which provides:
- Supabase query helpers: `selectFrom$`, `insertInto$`, `updateIn$`, `deleteFrom$`, `softDeleteFrom$`
- Signal management: `addToSignal`, `updateInSignal`, `removeFromSignal`
- Household access filtering for multi-tenant isolation

Core services:
- `SupabaseService` - Client initialization, readiness signals
- `AuthService` - Authentication, session management, household membership
- Domain services: `FinancialService`, `BillService`, `MaintenanceService`, `HealthcareService`, `InsuranceService`, `InventoryService`, `DocumentService`

### Data Flow Pattern
```
Component → Service (Observable/Signal) → Supabase Client → Mapper → TypeScript Model → Signal → Component
```

### Database Conventions
- **Table names**: snake_case (`household_members`, `transactions`)
- **Timestamps**: `created_at`, `updated_at`
- **Soft deletes**: `deleted_at` column (null = active)
- **Foreign keys**: `_id` suffix (`household_id`, `user_id`)
- **TypeScript models**: camelCase with mapper functions for conversion

## Critical Patterns

### Creating Components
```typescript
@Component({
  selector: 'app-feature',
  imports: [CommonModule, FormsModule, /* Syncfusion modules */],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './feature.html',
  styleUrl: './feature.scss'
})
export class FeatureComponent implements OnInit {
  private service = inject(FeatureService);
  protected data = this.service.data;  // Signal
  protected filtered = computed(() => /* derived value */);
}
```

### Creating Services
```typescript
@Injectable({ providedIn: 'root' })
export class MyService extends BaseApiService {
  private _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();

  loadItems(): Observable<Item[]> {
    return this.selectFrom$<DbItem>('my_table')
      .pipe(map(items => items.map(mapFromSupabase)));
  }
}
```

### Multi-Tenant Queries
Always filter by household:
```typescript
const householdId = this.authService.getDefaultHouseholdId();
this.supabase.client$.from('table')
  .select('*')
  .eq('household_id', householdId)
  .is('deleted_at', null)  // Exclude soft-deleted records
```

### Supabase Readiness
The Supabase client may not be immediately ready. Use:
```typescript
this.supabaseService.whenReady$().pipe(
  switchMap(() => /* your query */)
);
```

## UI Patterns

- **Confirmations**: Use SweetAlert2 (`Swal.fire()`), never native alerts
- **Notifications**: Use `ToastService` for user feedback
- **Grid components**: Syncfusion DataGrid with standard configuration
- **Forms**: Reactive forms with Syncfusion form controls

## Authentication Flow
1. User logs in via Supabase Auth
2. Household created during registration
3. JWT tokens auto-refresh
4. Session persists in localStorage
5. `authGuard` protects routes, redirects to `/login`

## Styling Guidelines

- Themes configured in `.cursor/rules/` documentation
- Primary color: Teal gradient (overrides Syncfusion purple)
- Dark mode supported via CSS variables
- Use Bootstrap utility classes for layout
- Component-specific styles in `.scss` files

## Environment Configuration

Development: `src/environments/environment.ts`
Production: `src/environments/environment.prod.ts`

Contains:
- Supabase URL and anon key
- Syncfusion license key

## Deployment

Deployed to Vercel. Configuration in `vercel.json`:
- SPA routing rewrites to index.html
- Output: `dist/HomeSynchronicity/browser`
