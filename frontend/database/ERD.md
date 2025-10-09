# TheButler - Entity Relationship Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ASP.NET CORE IDENTITY                        │
│                    (AspNetUsers, AspNetRoles, etc.)                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ user_id
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            HOUSEHOLDS                                 │
│  ┌──────────────┐         ┌──────────────┐      ┌────────────────┐ │
│  │  households  │◄────────│household_    │─────►│household_      │ │
│  │              │         │members       │      │settings        │ │
│  └──────────────┘         └──────────────┘      └────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
         │                           │
         │ household_id              │
         ▼                           ▼
┌────────────────────┐    ┌────────────────────────────────┐
│    FINANCIAL       │    │     BILLS & PAYMENTS           │
│                    │    │                                │
│  ┌──────────────┐ │    │  ┌──────────────┐             │
│  │  accounts    │◄┼────┼──│  bills       │             │
│  └──────────────┘ │    │  └──────────────┘             │
│         │          │    │         │                      │
│         │          │    │         ▼                      │
│         ▼          │    │  ┌──────────────┐             │
│  ┌──────────────┐ │    │  │payment_      │             │
│  │transactions  │ │    │  │history       │             │
│  └──────────────┘ │    │  └──────────────┘             │
│         │          │    │                                │
│         ▼          │    └────────────────────────────────┘
│  ┌──────────────┐ │
│  │budgets       │ │    ┌────────────────────────────────┐
│  └──────────────┘ │    │     MAINTENANCE                 │
│         │          │    │                                │
│         ▼          │    │  ┌──────────────┐             │
│  ┌──────────────┐ │    │  │service_      │             │
│  │budget_       │ │    │  │providers     │             │
│  │periods       │ │    │  └──────────────┘             │
│  └──────────────┘ │    │         │                      │
│                    │    │         ▼                      │
│  ┌──────────────┐ │    │  ┌──────────────┐             │
│  │financial_    │ │    │  │maintenance_  │             │
│  │goals         │ │    │  │tasks         │             │
│  └──────────────┘ │    │  └──────────────┘             │
│                    │    │                                │
│  ┌──────────────┐ │    └────────────────────────────────┘
│  │subscriptions │ │
│  └──────────────┘ │    ┌────────────────────────────────┐
└────────────────────┘    │     INVENTORY                   │
                          │                                │
                          │  ┌──────────────┐             │
                          │  │inventory_    │             │
                          │  │items         │             │
                          │  └──────────────┘             │
                          │         │                      │
                          │         ├──────────────┐       │
                          │         ▼              ▼       │
                          │  ┌──────────┐   ┌──────────┐  │
                          │  │warranties│   │item_     │  │
                          │  │          │   │maint_    │  │
                          │  │          │   │schedules │  │
                          │  └──────────┘   └──────────┘  │
                          └────────────────────────────────┘

┌────────────────────┐    ┌────────────────────────────────┐
│    DOCUMENTS       │    │     INSURANCE                   │
│                    │    │                                │
│  ┌──────────────┐ │    │  ┌──────────────┐             │
│  │documents     │ │    │  │insurance_    │             │
│  └──────────────┘ │    │  │policies      │             │
│         │          │    │  └──────────────┘             │
│         ▼          │    │         │                      │
│  ┌──────────────┐ │    │         ▼                      │
│  │document_tags │ │    │  ┌──────────────┐             │
│  └──────────────┘ │    │  │insurance_    │             │
│                    │    │  │beneficiaries │             │
└────────────────────┘    │  └──────────────┘             │
                          └────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM TABLES                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │notifications │  │reminders     │  │activity_logs │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        LOOKUP TABLES                                 │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │categories    │  │frequencies   │  │priorities    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐                                                   │
│  │insurance_    │                                                   │
│  │types         │                                                   │
│  └──────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Detailed Relationships

### Core Relationships

#### Households
```
AspNetUsers 1───────┐
                     │
                     │ user_id
                     ▼
households 1─────┬──household_members──N AspNetUsers
                 │
                 ├──household_settings (1:N)
                 │
                 ├──accounts (1:N)
                 ├──transactions (1:N)
                 ├──budgets (1:N)
                 ├──financial_goals (1:N)
                 ├──subscriptions (1:N)
                 ├──bills (1:N)
                 ├──maintenance_tasks (1:N)
                 ├──inventory_items (1:N)
                 ├──documents (1:N)
                 └──insurance_policies (1:N)
```

### Financial Module

#### Accounts & Transactions
```
accounts 1───────N transactions
                    │
                    ├──N budget_periods (via category & date)
                    └──1 bills (via payment_history)
```

#### Budgets & Tracking
```
budgets 1──────N budget_periods
   │
   └──1 categories
   
transactions ──(auto-trigger)──► budget_periods (updates spent_amount)
```

#### Subscriptions
```
subscriptions N───1 accounts
              │
              └──1 categories
```

### Bills & Payments

```
bills 1──────N payment_history
  │              │
  ├──1 accounts  └──1 transactions
  └──1 categories
```

### Maintenance Module

```
maintenance_tasks N───1 service_providers (shared)
                  │
                  ├──1 categories
                  └──1 priorities
```

### Inventory Module

```
inventory_items 1───┬──N warranties
                    │
                    └──N item_maintenance_schedules
```

### Documents Module

```
documents 1──────N document_tags (many-to-many via tag strings)
          │
          └──1 categories
```

### Insurance Module

```
insurance_policies 1───┬──N insurance_beneficiaries
                       │
                       ├──1 insurance_types
                       └──1 frequencies (billing)
```

### System Tables

```
notifications N───1 AspNetUsers
              │
              └──1 households (optional)

reminders N───1 households
          │
          └──1 AspNetUsers (optional - NULL = all household members)

activity_logs N───1 AspNetUsers
              │
              └──1 households (optional)
```

## Key Constraints

### Foreign Key Cascade Rules

| Parent Table | Child Table | On Delete Rule | Reason |
|--------------|-------------|----------------|---------|
| households | Most child tables | CASCADE | Household deletion removes all data |
| accounts | transactions | RESTRICT | Prevent deletion of account with transactions |
| categories | Most tables | SET NULL | Keep records even if category deleted |
| budgets | budget_periods | CASCADE | Period data tied to budget definition |
| bills | payment_history | CASCADE | Payment history belongs to bill |

### Unique Constraints

- `household_members`: (household_id, user_id) - User can only be in household once
- `household_settings`: (household_id, setting_key) - One value per setting
- `categories`: (name) - Category names must be unique
- `frequencies`: (name) - Frequency names must be unique
- `budget_periods`: (budget_id, period_start) - One period per start date

### Check Constraints

- `insurance_beneficiaries.percentage`: 0 to 100
- `service_providers.rating`: 0 to 5

## Indexes Summary

### Primary Performance Indexes

```
transactions:
  - household_id (filtering)
  - account_id (joins)
  - date (range queries)
  - category_id (grouping)

bills:
  - household_id (filtering)
  - due_date (sorting)
  - status (filtering)

maintenance_tasks:
  - household_id (filtering)
  - due_date (sorting)
  - status (filtering)

documents:
  - household_id (filtering)
  - expiry_date (WHERE expiry_date IS NOT NULL)

notifications:
  - (user_id, is_read) - composite index for unread queries
  - created_at (sorting)

activity_logs:
  - household_id (filtering)
  - user_id (filtering)
  - created_at (sorting)
  - (entity_type, entity_id) - composite for entity lookups
```

## Normalization Details

### 3NF Compliance

✅ **1NF (First Normal Form)**
- All tables have primary keys
- All columns contain atomic values
- No repeating groups (arrays used only where appropriate in PostgreSQL)

✅ **2NF (Second Normal Form)**
- No partial dependencies (all non-key attributes depend on entire primary key)
- Lookup tables separate from main entities

✅ **3NF (Third Normal Form)**
- No transitive dependencies
- Computed values moved to separate tables or calculated columns
- Examples:
  - `budget_periods` separate from `budgets` (period-specific data)
  - `payment_history` separate from `bills` (historical data)
  - `categories`, `frequencies`, `priorities` as separate lookup tables

### Beyond 3NF

Some tables approach **BCNF (Boyce-Codd Normal Form)**:
- `household_members`: Every determinant is a candidate key
- Lookup tables: Single-column natural keys

### Denormalization Decisions

Intentional denormalization for performance:
- `budget_periods.percentage_used`: Computed column (recalculated on write)
- `budget_periods.status`: Computed column (derived from percentage)

These are acceptable as they:
1. Are always up-to-date (GENERATED ALWAYS)
2. Significantly improve read performance
3. Cannot become stale or inconsistent

**Note**: `warranties.is_active` is stored as a regular boolean to avoid immutability issues with `CURRENT_DATE`. Check active warranties using `WHERE end_date >= CURRENT_DATE` in queries.

## Data Flow Examples

### Adding a Transaction
```
1. User creates transaction via API
2. Transaction inserted into transactions table
3. Trigger: update_account_balance() fires
   - Updates accounts.balance
4. Trigger: update_budget_period_spent() fires
   - Finds matching budget_period
   - Recalculates spent_amount and transaction_count
   - Computed columns (percentage_used, status) auto-update
5. Activity log entry created
```

### Paying a Bill
```
1. User marks bill as paid
2. payment_history record created
3. Transaction created (linked to payment_history)
4. Bill status updated to 'paid'
5. Account balance updated (via transaction trigger)
6. Notification created for user
7. Activity log entry created
```

### Budget Alert
```
1. Transaction added
2. Budget period spent_amount updated
3. If percentage_used > 80:
   - Background job checks threshold
   - Notification created for household admins
   - Reminder scheduled for next budget period
```

## Migration Strategy

### Phase 1: Core Setup
1. Create lookup tables
2. Create households structure
3. Link to ASP.NET Identity

### Phase 2: Financial
1. Create accounts
2. Create transactions with triggers
3. Create budgets and periods

### Phase 3: Bills & Subscriptions
1. Create bills and payment history
2. Create subscriptions

### Phase 4: Household Management
1. Create maintenance tasks
2. Create inventory and warranties
3. Create documents
4. Create insurance

### Phase 5: System Features
1. Create notifications and reminders
2. Create activity logs
3. Add views for reporting

---

**Legend:**
- `1───N` : One-to-Many relationship
- `1───1` : One-to-One relationship
- `N───N` : Many-to-Many relationship
- `(auto-trigger)` : Automatic database trigger
- `(optional)` : Nullable foreign key

