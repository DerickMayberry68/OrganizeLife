# Category Dropdown Update

## Changes Made

### Problem
The subscription form had hardcoded category options and used a text input instead of loading categories dynamically from the backend API (similar to how billing cycles/frequencies work).

### Solution
Updated the subscription form to use dropdown selects for both **Categories** and **Billing Cycles**, loading the options from the backend API.

---

## Files Modified

### 1. **`src/app/features/accounts/accounts.ts`**

#### Added Signals for Reference Data
```typescript
protected readonly categories = this.dataService.categories;
protected readonly frequencies = this.dataService.frequencies;
```

#### Removed Hardcoded Data
**Before:**
```typescript
protected readonly subscriptionCategories = ['entertainment', 'software', 'utilities', 'membership', 'other'];
protected readonly billingCycles = ['monthly', 'quarterly', 'annual'];
```

**After:**
```typescript
// Removed - now loaded from API
```

#### Updated `ngOnInit()` to Load Reference Data
```typescript
ngOnInit(): void {
  // Load reference data first (needed for subscriptions)
  this.dataService.loadFrequencies().subscribe({
    next: (frequencies) => {
      console.log('Frequencies loaded:', frequencies);
    },
    error: (error) => {
      console.error('Error loading frequencies:', error);
    }
  });

  this.dataService.loadCategories().subscribe({
    next: (categories) => {
      console.log('Categories loaded:', categories);
    },
    error: (error) => {
      console.error('Error loading categories:', error);
    }
  });

  // Load accounts and subscriptions data
  this.loadAccountsData();
}
```

---

### 2. **`src/app/features/accounts/accounts.html`**

#### Updated Category Field (Text Input → Dropdown)
**Before:**
```html
<div class="col-md-6 mb-3">
  <label for="subscriptionCategory" class="form-label">Category *</label>
  <input 
    type="text"
    id="subscriptionCategory"
    formControlName="category"
    class="form-control"
    placeholder="e.g., Entertainment, Productivity">
</div>
```

**After:**
```html
<div class="col-md-6 mb-3">
  <label for="subscriptionCategory" class="form-label">Category *</label>
  <select 
    id="subscriptionCategory"
    formControlName="category"
    class="form-control">
    <option value="">Select category</option>
    @for (category of categories(); track category.id) {
      <option [value]="category.name">{{ category.name }}</option>
    }
  </select>
</div>
```

#### Updated Billing Cycle Field (Hardcoded Options → Dynamic)
**Before:**
```html
<select 
  id="billingCycle"
  formControlName="billingCycle" 
  class="form-control">
  <option value="">Select billing cycle</option>
  @for (cycle of billingCycles; track cycle) {
    <option [value]="cycle">{{ cycle }}</option>
  }
</select>
```

**After:**
```html
<select 
  id="billingCycle"
  formControlName="billingCycle" 
  class="form-control">
  <option value="">Select billing cycle</option>
  @for (frequency of frequencies(); track frequency.id) {
    <option [value]="frequency.name">{{ frequency.name }}</option>
  }
</select>
```

---

### 3. **`src/app/services/data.service.ts`**

#### Added Helper Method to Get Category ID by Name
```typescript
// Helper method to get category ID by name
private getCategoryIdByName(name: string): string | null {
  const category = this.categoriesSignal().find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );
  return category?.id || null;
}
```

#### Updated `addSubscription()` Method
**Added category ID mapping:**
```typescript
// Map category string to category ID
const categoryId = this.getCategoryIdByName(subscription.category);
if (!categoryId) {
  this.toastService.error('Error', `Category '${subscription.category}' not found. Please reload categories.`);
  return of({} as Subscription);
}
```

**Updated DTO to include category ID:**
```typescript
const createSubscriptionDto = {
  householdId: householdId,
  accountId: null,
  categoryId: categoryId, // ✅ Now using mapped category ID
  name: subscription.name,
  amount: subscription.amount,
  billingCycleId: billingCycleId,
  nextBillingDate: nextBillingDate,
  isActive: true,
  autoRenew: true,
  merchantWebsite: null,
  notes: null
};
```

---

## How It Works Now

### 1. **Page Load Sequence**
```
Component Init → Load Frequencies → Load Categories → Load Accounts/Subscriptions
```

### 2. **User Adds Subscription**
```
User fills form → 
  Category dropdown (loaded from API) → 
  Billing Cycle dropdown (loaded from API) → 
  Click Save → 
  Map Category name to ID → 
  Map Billing Cycle name to ID → 
  Send to backend with IDs → 
  Subscription saved → 
  Appears in grid
```

### 3. **Data Flow**
```
Backend Categories API → DataService.loadCategories() → 
  categoriesSignal → categories() → 
  Dropdown options in form → 
  User selects category → 
  getCategoryIdByName() → 
  Send categoryId to backend
```

---

## Benefits

### ✅ **Dynamic Categories**
- Categories are loaded from the backend, not hardcoded
- Easy to add/modify categories without code changes
- Consistent with backend data

### ✅ **Consistent with Frequencies**
- Both categories and billing cycles now work the same way
- Loads reference data from API
- Maps user-friendly names to GUIDs

### ✅ **Better User Experience**
- Dropdown prevents typos and invalid entries
- Shows only valid categories from the database
- Consistent data entry across the application

### ✅ **Validation**
- Frontend validates that selected category exists
- Shows error message if category not found
- Prevents invalid submissions

---

## Testing

1. **Open Accounts Page**
   - Verify frequencies dropdown populates with backend data
   - Verify categories dropdown populates with backend data

2. **Add Subscription**
   - Click "Add Subscription"
   - Select a category from dropdown (e.g., "Entertainment")
   - Select a billing cycle from dropdown (e.g., "Monthly")
   - Fill in other fields
   - Click "Save"
   - Verify subscription appears in grid with correct category

3. **Check Console**
   - Should see "Frequencies loaded: [...]"
   - Should see "Categories loaded: [...]"
   - Should see "Subscriptions loaded: [...]"

---

## API Endpoints Used

- **GET** `/api/Frequencies` - Returns all billing cycles
- **GET** `/api/Categories` - Returns all categories
- **POST** `/api/Subscriptions` - Creates subscription with `categoryId` and `billingCycleId`

---

## Summary

Both **Categories** and **Billing Cycles** are now dynamic dropdowns that:
1. Load data from the backend API on component init
2. Display options in the subscription form
3. Map user-friendly names to GUIDs when saving
4. Provide validation and error messages

This ensures data consistency between frontend and backend, prevents invalid entries, and makes the system more maintainable.

