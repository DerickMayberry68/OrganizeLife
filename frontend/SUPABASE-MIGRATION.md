# Supabase Migration Guide

## Overview

This document outlines the migration from .NET API backend to direct Supabase integration in the Angular frontend.

## ✅ Completed

### 1. Supabase Client Setup
- ✅ Installed `@supabase/supabase-js` package
- ✅ Created `SupabaseService` (`src/app/services/supabase.service.ts`)
  - Provides centralized Supabase client instance
  - Handles authentication state
- ✅ Created environment configuration (`src/app/config/environment.ts`)
  - Configure with environment variables: `NG_APP_SUPABASE_URL` and `NG_APP_SUPABASE_ANON_KEY`

### 2. Base Service Migration
- ✅ Updated `BaseApiService` to use Supabase instead of HTTP client
  - Replaced HTTP methods with Supabase query methods
  - Added helper methods for Supabase operations (insert, update, delete, soft delete)
  - Added household access checking

### 3. Authentication Service
- ✅ Converted `AuthService` to use Supabase Auth
  - Login/Register now use Supabase Auth directly
  - Household creation during registration
  - Session management via Supabase
  - User metadata handling

### 4. Domain Services (All Converted)
- ✅ Converted all domain services to use Supabase:
  - **AlertService** - Alerts and notifications
  - **BillService** - Bills and payment frequencies
  - **FinancialService** - Transactions, budgets, accounts, subscriptions, categories, financial goals
  - **HealthcareService** - Doctors, appointments, prescriptions, medical records
  - **InsuranceService** - Insurance policies
  - **InventoryService** - Inventory items
  - **MaintenanceService** - Maintenance tasks and service providers
  - **DocumentService** - Document management
  - All CRUD operations now use Supabase
  - Proper mapping between Supabase schema (snake_case) and TypeScript models (camelCase)
  - Maintained same interface for components

## ✅ All Services Converted!

All domain services have been successfully converted to use Supabase:

1. ✅ **AlertService** - Alerts/notifications
2. ✅ **BillService** - Bills and payment frequencies
3. ✅ **FinancialService** - Transactions, budgets, accounts, subscriptions, categories, financial goals
4. ✅ **HealthcareService** - Doctors, appointments, prescriptions, medical records
5. ✅ **InsuranceService** - Insurance policies
6. ✅ **InventoryService** - Inventory items
7. ✅ **MaintenanceService** - Maintenance tasks and service providers
8. ✅ **DocumentService** - Document management

## 📋 Conversion Pattern

Each service should follow this pattern (see `BillService` for reference):

### 1. Replace HTTP calls with Supabase queries

**Before:**
```typescript
return this.http.get<Bill[]>(`${this.API_URL}/Bills/household/${householdId}`, this.getHeaders())
```

**After:**
```typescript
return from(
  this.supabase
    .from('bills')
    .select('*')
    .eq('household_id', householdId)
    .is('deleted_at', null)
)
```

### 2. Map Supabase data to TypeScript models

Supabase returns snake_case columns, but TypeScript models use camelCase. Create mapping methods:

```typescript
private mapBillFromSupabase(data: any): Bill {
  return {
    id: data.id,
    name: data.name,
    amount: data.amount,
    dueDate: new Date(data.due_date), // snake_case → camelCase
    // ... rest of mapping
  };
}
```

### 3. Handle relationships with Supabase joins

Use Supabase's select syntax for joins:

```typescript
.select(`
  *,
  categories:category_id (name),
  frequencies:frequency_id (name)
`)
```

### 4. Convert date fields

Supabase stores dates as ISO strings or dates. Convert to Date objects:

```typescript
dueDate: new Date(data.due_date)
```

### 5. Handle inserts/updates

Convert camelCase to snake_case for database:

```typescript
const billData = {
  household_id: householdId,  // snake_case for DB
  name: bill.name,
  amount: bill.amount,
  due_date: bill.dueDate.toISOString().split('T')[0]  // Format date
};
```

## 🔧 Environment Configuration

### Configuration Values
Your Supabase configuration has been set in `src/app/config/environment.ts`:

- **URL**: `https://cwvkrkiejntyexfxzxpx.supabase.co`
- **AnonKey**: (configured in environment.ts)

### Environment Variables (Optional)
For production, you can override these with environment variables. A `.env` file has been created with your values.

**Note**: The AnonKey is safe to expose in frontend code (that's its purpose), but using environment variables is a best practice for production deployments.

For Angular to read environment variables, you may need to:
1. Install `@angular-devkit/build-angular` (usually already installed)
2. Environment variables prefixed with `NG_APP_` are automatically available
3. Or configure them in `angular.json` under build configurations

## 📝 Database Schema Notes

- Tables use snake_case (e.g., `household_id`, `created_at`)
- TypeScript models use camelCase (e.g., `householdId`, `createdAt`)
- Soft deletes use `deleted_at` column (null means not deleted)
- Household filtering: Always filter by `household_id` for multi-tenant data
- User authentication: Use Supabase Auth, user ID comes from `auth.users.id`

## 🚨 Important Considerations

### Row Level Security (RLS)
Supabase has RLS enabled by default. You'll need to either:
1. **Disable RLS** on tables (if using service role key for backend)
2. **Configure RLS policies** to allow authenticated users to access their household data

For this migration, you may want to disable RLS initially, then add policies later:

```sql
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Authentication
- Supabase Auth handles JWT tokens automatically
- No need for manual token management in HTTP interceptors
- Remove `authInterceptor` once all services are converted

### Error Handling
- Supabase errors have different structure than HTTP errors
- Check `response.error` after queries
- Use `throwError()` for RxJS error handling

## 📚 Next Steps

1. ✅ All services converted
2. ✅ Removed HTTP client and `authInterceptor` from `app.config.ts`
3. Test each service thoroughly with Supabase
4. Configure Supabase RLS policies or disable RLS (see below)
5. Update environment configuration for production if needed
6. Test authentication flow (login/register)
7. Verify all CRUD operations work correctly

## ✅ Migration Complete!

All services have been successfully converted to use Supabase. The application no longer requires a .NET API backend.

### Changes Made:
1. ✅ All 8 domain services converted to Supabase
2. ✅ AuthService uses Supabase Auth
3. ✅ BaseApiService uses Supabase client
4. ✅ HTTP client and authInterceptor removed from app.config.ts
5. ✅ Environment configuration set up with your Supabase credentials

## 🧪 Testing Checklist

For each converted service:
- [ ] Load list of items
- [ ] Add new item
- [ ] Update existing item
- [ ] Delete item (or soft delete)
- [ ] Filter by household
- [ ] Handle errors gracefully
- [ ] Map data correctly between DB and models
- [ ] Test authentication (login/register)
- [ ] Verify household access control

## 📖 References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Query Builder](https://supabase.com/docs/reference/javascript/select)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

