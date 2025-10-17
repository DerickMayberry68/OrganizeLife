# Subscription Save Fix

## Problem
The "Add Subscription" dialog was not saving subscriptions. The form would submit successfully, show a success message, but the subscription would not appear in the list.

## Root Causes

### 1. **Commented Out Service Call**
In `src/app/features/accounts/accounts.ts`, the `saveSubscription()` method had the actual API call commented out:
```typescript
// this.dataService.addSubscription(subscription);
```

### 2. **Missing HouseholdId**
The backend API requires a `householdId` in the request body, but the frontend wasn't including it.

### 3. **Billing Cycle Mismatch**
- **Frontend**: Uses string values like `'monthly'`, `'yearly'`, `'quarterly'`
- **Backend**: Expects a `billingCycleId` (GUID) from the `Frequencies` reference table

## Solution

### 1. **Fixed Account Saving** (`src/app/features/accounts/accounts.ts`)
- Uncommented the `dataService.addAccount()` call
- Updated to properly subscribe to the observable
- Removed duplicate success toast (now handled by service)

### 2. **Fixed Subscription Saving** (`src/app/features/accounts/accounts.ts`)
- Uncommented the `dataService.addSubscription()` call
- Updated to properly subscribe to the observable
- Removed duplicate success toast (now handled by service)

### 3. **Load Frequencies on Init** (`src/app/features/accounts/accounts.ts`)
```typescript
ngOnInit(): void {
  // Load frequencies first (needed for subscriptions)
  this.dataService.loadFrequencies().subscribe({
    next: (frequencies) => {
      console.log('Frequencies loaded:', frequencies);
      // Then load accounts and subscriptions data
      this.loadAccountsData();
    },
    error: (error) => {
      console.error('Error loading frequencies:', error);
      // Still try to load accounts/subscriptions even if frequencies fail
      this.loadAccountsData();
    }
  });
}
```

### 4. **Updated Data Service** (`src/app/services/data.service.ts`)

#### Added Frequency Support
```typescript
// Frequency/Billing Cycle interface
export interface Frequency {
  id: string;
  name: string;
  intervalDays: number;
  createdAt: Date;
}

// Added frequency signal
private readonly frequenciesSignal = signal<Frequency[]>([]);
public readonly frequencies = this.frequenciesSignal.asReadonly();

// Method to load frequencies
public loadFrequencies(): Observable<Frequency[]> {
  return this.http.get<Frequency[]>(
    `${this.API_URL}/Frequencies`,
    this.getHeaders()
  ).pipe(
    tap(frequencies => this.frequenciesSignal.set(frequencies)),
    catchError(error => {
      console.error('Error loading frequencies:', error);
      this.toastService.error('Error', 'Failed to load billing cycles');
      return of([]);
    })
  );
}

// Helper to map billing cycle string to ID
private getFrequencyIdByName(name: string): string | null {
  const frequency = this.frequenciesSignal().find(
    f => f.name.toLowerCase() === name.toLowerCase()
  );
  return frequency?.id || null;
}
```

#### Updated `addAccount()` Method
```typescript
public addAccount(account: Omit<Account, 'id'>): Observable<Account> {
  const householdId = this.getHouseholdId();
  if (!householdId) {
    this.toastService.error('Error', 'No household selected');
    return of({} as Account);
  }

  // Prepare the DTO with householdId
  const createAccountDto = {
    householdId: householdId,
    name: account.name,
    type: account.type,
    institution: account.institution,
    accountNumberLast4: null, // Not provided by the form
    balance: account.balance,
    currency: 'USD'
  };

  return this.http.post<Account>(
    `${this.API_URL}/Accounts`,
    createAccountDto,
    this.getHeaders()
  ).pipe(
    tap(newAccount => {
      this.accountsSignal.update(items => [...items, newAccount]);
      this.toastService.success('Success', 'Account added successfully');
    }),
    catchError(error => {
      console.error('Error adding account:', error);
      this.toastService.error('Error', 'Failed to add account');
      throw error;
    })
  );
}
```

#### Updated `addSubscription()` Method
```typescript
public addSubscription(subscription: Omit<Subscription, 'id'>): Observable<Subscription> {
  const householdId = this.getHouseholdId();
  if (!householdId) {
    this.toastService.error('Error', 'No household selected');
    return of({} as Subscription);
  }

  // Map billing cycle string to frequency ID
  const billingCycleId = this.getFrequencyIdByName(subscription.billingCycle);
  if (!billingCycleId) {
    this.toastService.error('Error', `Billing cycle '${subscription.billingCycle}' not found. Please reload frequencies.`);
    return of({} as Subscription);
  }

  // Convert date to DateOnly format (YYYY-MM-DD)
  const nextBillingDate = subscription.nextBillingDate instanceof Date
    ? subscription.nextBillingDate.toISOString().split('T')[0]
    : subscription.nextBillingDate;

  // Prepare the DTO with householdId and billingCycleId
  const createSubscriptionDto = {
    householdId: householdId,
    accountId: null,
    categoryId: null,
    name: subscription.name,
    amount: subscription.amount,
    billingCycleId: billingCycleId,
    nextBillingDate: nextBillingDate,
    isActive: true,
    autoRenew: true,
    merchantWebsite: null,
    notes: null
  };

  return this.http.post<Subscription>(
    `${this.API_URL}/Subscriptions`,
    createSubscriptionDto,
    this.getHeaders()
  ).pipe(
    tap(newSubscription => {
      this.subscriptionsSignal.update(items => [...items, newSubscription]);
      this.toastService.success('Success', 'Subscription added successfully');
    }),
    catchError(error => {
      console.error('Error adding subscription:', error);
      this.toastService.error('Error', 'Failed to add subscription');
      throw error;
    })
  );
}
```

## Backend API Structure

### Frequencies Endpoint
- **GET** `/api/Frequencies` - Returns all available billing cycles
- Returns: `{ id: Guid, name: string, intervalDays: number, createdAt: DateTime }`

### Subscriptions Endpoint
- **POST** `/api/Subscriptions` - Creates a new subscription
- Expects: `CreateSubscriptionDto`
  - `householdId` (Guid) - **Required**
  - `billingCycleId` (Guid) - **Required** (from Frequencies table)
  - `name` (string)
  - `amount` (decimal)
  - `nextBillingDate` (DateOnly) - Format: "YYYY-MM-DD"
  - Other optional fields

### Accounts Endpoint
- **POST** `/api/Accounts` - Creates a new account
- Expects: `CreateAccountDto`
  - `householdId` (Guid) - **Required**
  - `name` (string)
  - `type` (string)
  - `institution` (string)
  - `balance` (decimal)
  - Other optional fields

## Testing

1. **Add Account**:
   - Click "Add Account" button
   - Fill in the form
   - Click "Save"
   - Account should appear in the grid immediately

2. **Add Subscription**:
   - Click "Add Subscription" button
   - Fill in the form (name, category, amount, billing cycle, next billing date)
   - Click "Save"
   - Subscription should appear in the grid immediately

## Key Changes Summary

| File | Change |
|------|--------|
| `accounts.ts` | - Uncommented API calls in `saveAccount()` and `saveSubscription()`<br>- Added proper subscription handling<br>- Load frequencies on init |
| `data.service.ts` | - Added `Frequency` interface and signal<br>- Added `loadFrequencies()` method<br>- Added `getFrequencyIdByName()` helper<br>- Updated `addAccount()` to include `householdId`<br>- Updated `addSubscription()` to map billing cycle and include `householdId` |

## Notes

- Frequencies must be loaded before subscriptions can be created
- The billing cycle mapping is case-insensitive (`'Monthly'`, `'monthly'`, etc.)
- Date handling converts JavaScript Date objects to DateOnly format (YYYY-MM-DD)
- All API calls now include proper error handling and user feedback via toasts

