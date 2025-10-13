# Schema vs API Audit Report

## Executive Summary
This document compares the database schema with the current API implementation to identify mismatches.

---

## 🔴 **Critical Issues**

### 1. Categories Table - NOT Household-Scoped
**Database Schema:**
```sql
CREATE TABLE public.categories (
  id uuid,
  name varchar NOT NULL,
  type varchar NOT NULL,        -- 'Income' or 'Expense'
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp
  -- NO household_id!
);
```

**Impact:**
- Categories are GLOBAL, not per-household
- All households share the same categories
- CategoriesController may be filtering by household incorrectly

**Fix Required:**
- Remove household_id filtering from CategoriesController
- Categories should be system-wide lookup data
- OR add household_id to schema if categories should be per-household

---

### 2. Missing Tables in API

The following tables exist in the database but have NO API controllers:

| Table | Purpose | Priority |
|-------|---------|----------|
| `frequencies` | Lookup table for billing cycles | HIGH - Used by bills, subscriptions |
| `priorities` | Lookup table for priority levels | MEDIUM - Used by maintenance |
| `insurance_types` | Lookup table for insurance types | MEDIUM - Used by insurance policies |
| `activity_logs` | Audit trail for user actions | LOW - Optional feature |
| `notifications` | Legacy notification system | LOW - Replaced by alerts? |
| `reminders` | Scheduled reminders | LOW - May be replaced by alerts |
| `financial_goals` | Financial goal tracking | MEDIUM - Feature not implemented |
| `household_settings` | Per-household settings | MEDIUM - Configuration feature |

**Recommendation:**
- Create controllers for `frequencies`, `priorities`, `insurance_types` (lookup tables)
- Consider if `notifications` is duplicate of `alerts`
- Implement `financial_goals` controller if feature is needed

---

### 3. Missing Relationships in API

The following relationships exist in the database but may not be fully represented in the API:

#### **document_tags**
- Junction table for tags
- Not exposed in DocumentsController

#### **insurance_beneficiaries**
- Related to insurance policies
- Not exposed in InsuranceController

#### **item_maintenance_schedules**
- Related to inventory items
- Not exposed in InventoryController

#### **warranties**
- Related to inventory items
- Not exposed in InventoryController

#### **medication_schedules**
- Related to medications
- Not fully exposed in MedicationsController (may exist)

---

## ⚠️ **Schema Mismatches by Entity**

### Healthcare Entities

#### ✅ **healthcare_providers** - MATCHES
Schema columns align with HealthcareController

#### ✅ **appointments** - MATCHES
Schema columns align with AppointmentsController

#### ✅ **medications** - MATCHES
Schema columns align with MedicationsController

#### ⚠️ **medication_schedules** - PARTIAL
- Table exists in schema
- May not be fully exposed in API

#### ✅ **allergies** - MATCHES
Schema columns align with HealthcareController

#### ✅ **vaccinations** - MATCHES
Schema columns align with HealthcareController

#### ✅ **health_metrics** - MATCHES
Schema columns align with HealthcareController

#### ✅ **medical_records** - MATCHES
Schema columns align with HealthcareController

---

### Financial Entities

#### ✅ **accounts** - MATCHES
Schema columns align with AccountsController

#### ✅ **transactions** - MATCHES
Schema columns align with TransactionsController

#### ✅ **bills** - MATCHES
Schema columns align with BillsController

#### ✅ **budgets** - MATCHES
Schema columns align with BudgetsController

#### ✅ **budget_periods** - MATCHES
Auto-calculated fields exist in schema

#### ✅ **subscriptions** - MATCHES
Schema columns align with SubscriptionsController

#### ⚠️ **payment_history** - PARTIAL
- Table exists
- Referenced in PaymentsController but may need dedicated endpoints

---

### Household Entities

#### ✅ **households** - MATCHES
Schema columns align with SetupController

#### ✅ **household_members** - MATCHES
Schema columns align with SetupController

#### ❌ **household_settings** - MISSING
- Table exists in schema
- No API controller

---

### Property Entities

#### ✅ **maintenance_tasks** - MATCHES
Schema columns align with MaintenanceController

#### ⚠️ **service_providers** - PARTIAL
- Table exists
- May be referenced in MaintenanceController but needs dedicated endpoints

#### ✅ **inventory_items** - MATCHES
Schema columns align with InventoryController

#### ❌ **item_maintenance_schedules** - MISSING
- Table exists in schema
- Not exposed in API

#### ❌ **warranties** - MISSING
- Table exists in schema
- Not exposed in API

---

### Document Entities

#### ✅ **documents** - MATCHES
Schema columns align with DocumentsController

#### ❌ **document_tags** - MISSING
- Junction table exists
- Not exposed in API (tags functionality missing)

---

### Insurance Entities

#### ✅ **insurance_policies** - MATCHES
Schema columns align with InsuranceController

#### ❌ **insurance_types** - MISSING
- Lookup table exists
- No API controller for managing types

#### ❌ **insurance_beneficiaries** - MISSING
- Table exists in schema
- Not exposed in InsuranceController

---

### Notification/Alert Entities

#### ✅ **alerts** - MATCHES
Schema columns align with AlertsController

#### ⚠️ **notifications** - DUPLICATE?
- Older notifications table exists
- May be superseded by alerts table
- Consider deprecating

#### ❌ **reminders** - MISSING
- Table exists in schema
- May overlap with alerts functionality

---

## 🔧 **Recommended Actions**

### Priority 1: Critical Fixes
1. **Fix CategoriesController**
   - Remove household_id filtering (categories are global)
   - OR add household_id to categories table if per-household is needed

2. **Create Lookup Table Controllers**
   - FrequenciesController (GET only - system data)
   - PrioritiesController (GET only - system data)
   - InsuranceTypesController (GET only - system data)

### Priority 2: Missing Features
3. **Add Child Entity Endpoints**
   - `DocumentsController` - Add tag management
   - `InsuranceController` - Add beneficiary management
   - `InventoryController` - Add warranty & maintenance schedule management
   - `MedicationsController` - Verify schedule management exists

4. **Create Service Providers Controller**
   - ServiceProvidersController for managing service providers
   - Currently only referenced in MaintenanceController

### Priority 3: Optional Features
5. **Financial Goals Module**
   - Create FinancialGoalsController if feature is needed

6. **Household Settings**
   - Create HouseholdSettingsController for configuration

7. **Clarify Notifications vs Alerts**
   - Determine if `notifications` table is deprecated
   - Consider removing if fully replaced by `alerts`

---

## 📊 **Coverage Summary**

| Entity Type | Total Tables | Has API | Missing | Coverage % |
|-------------|--------------|---------|---------|------------|
| Lookup Tables | 3 | 0 | 3 | 0% |
| Healthcare | 8 | 8 | 0 | 100% |
| Financial | 7 | 6 | 1 | 86% |
| Household | 3 | 2 | 1 | 67% |
| Property | 5 | 2 | 3 | 40% |
| Documents | 2 | 1 | 1 | 50% |
| Insurance | 3 | 1 | 2 | 33% |
| Notifications | 3 | 1 | 2 | 33% |
| **TOTAL** | **34** | **21** | **13** | **62%** |

---

## 🎯 **Next Steps**

1. Review and confirm Categories table design decision
2. Implement lookup table controllers (Frequencies, Priorities, InsuranceTypes)
3. Add missing child entity endpoints
4. Create ServiceProvidersController
5. Consider implementing FinancialGoals and HouseholdSettings
6. Deprecate old notifications table if not needed

---

*Generated: 2025-10-13*

