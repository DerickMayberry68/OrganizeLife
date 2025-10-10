# Angular Frontend - API Quick Reference

Quick reference guide for integrating with TheButler backend API.

## 🔑 Authentication

All API requests require JWT authentication from Supabase.

```typescript
// Add to your HTTP interceptor or service
headers: {
  'Authorization': `Bearer ${this.authService.getAccessToken()}`
}
```

## 📋 Available API Controllers

### 1. Categories (System-Wide)
**Base:** `/api/categories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all active categories |
| GET | `/api/categories/type/{type}` | Get by type (Income/Expense/Transfer) |
| GET | `/api/categories/{id}` | Get single category |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/categories/{id}/usage` | Usage statistics |

---

### 2. Transactions
**Base:** `/api/transactions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/household/{householdId}` | Get all (with filters) |
| GET | `/api/transactions/account/{accountId}` | Get by account |
| GET | `/api/transactions/{id}` | Get single transaction |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/household/{householdId}/summary` | Dashboard summary |
| GET | `/api/transactions/household/{householdId}/search` | Search transactions |

**Query Parameters:**
- `startDate` (DateOnly)
- `endDate` (DateOnly)
- `accountId` (Guid)
- `categoryId` (Guid)
- `type` (string: "Income", "Expense", "Transfer")
- `searchTerm` (string)
- `limit` (int)

---

### 3. Bills
**Base:** `/api/bills`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills/household/{householdId}` | Get all bills |
| GET | `/api/bills/household/{householdId}/upcoming` | Upcoming bills |
| GET | `/api/bills/{id}` | Get single bill |
| POST | `/api/bills` | Create bill |
| PUT | `/api/bills/{id}` | Update bill |
| DELETE | `/api/bills/{id}` | Delete bill |
| POST | `/api/bills/{id}/mark-paid` | Mark as paid |
| GET | `/api/bills/{id}/payment-history` | Payment history |
| GET | `/api/bills/household/{householdId}/summary` | Dashboard summary |

**Query Parameters:**
- `status` (string: "Pending", "Paid", "Overdue", "Cancelled")
- `isRecurring` (boolean)
- `days` (int: for upcoming bills)

---

### 4. Budgets
**Base:** `/api/budgets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets/household/{householdId}` | Get all budgets |
| GET | `/api/budgets/{id}` | Get single budget |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
| GET | `/api/budgets/{id}/performance` | Budget performance |
| GET | `/api/budgets/household/{householdId}/summary` | Household summary |
| GET | `/api/budgets/household/{householdId}/alerts` | Over/near limit alerts |

**Query Parameters:**
- `isActive` (boolean)
- `startDate` (DateOnly)
- `endDate` (DateOnly)

---

### 5. Subscriptions
**Base:** `/api/subscriptions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/household/{householdId}` | Get all subscriptions |
| GET | `/api/subscriptions/household/{householdId}/upcoming` | Upcoming renewals |
| GET | `/api/subscriptions/{id}` | Get single subscription |
| POST | `/api/subscriptions` | Create subscription |
| PUT | `/api/subscriptions/{id}` | Update subscription |
| DELETE | `/api/subscriptions/{id}` | Delete subscription |
| POST | `/api/subscriptions/{id}/renew` | Manually renew |
| POST | `/api/subscriptions/{id}/cancel` | Cancel subscription |
| GET | `/api/subscriptions/household/{householdId}/summary` | Dashboard summary |

**Query Parameters:**
- `isActive` (boolean)
- `days` (int: for upcoming renewals)

---

## 📦 TypeScript Models

### Create Models Based on Response DTOs

```typescript
// models/category.model.ts
export interface Category {
  id: string;
  name: string;
  type: 'Income' | 'Expense' | 'Transfer';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// models/transaction.model.ts
export interface Transaction {
  id: string;
  householdId: string;
  accountId: string;
  accountName: string;
  categoryId?: string;
  categoryName?: string;
  date: string; // DateOnly format: "YYYY-MM-DD"
  description: string;
  amount: number;
  type: 'Income' | 'Expense' | 'Transfer';
  merchantName?: string;
  notes?: string;
  plaidTransactionId?: string;
  isRecurring: boolean;
  parentTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/bill.model.ts
export interface Bill {
  id: string;
  householdId: string;
  accountId?: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  amount: number;
  dueDate: string; // DateOnly format
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  isRecurring: boolean;
  frequencyId?: string;
  frequencyName?: string;
  paymentMethod?: string;
  autoPayEnabled: boolean;
  reminderDays?: number;
  payeeName?: string;
  payeeAccountNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/budget.model.ts
export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  limitAmount: number;
  period: 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string; // DateOnly format
  endDate?: string; // DateOnly format
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'Under Budget' | 'Near Limit' | 'Over Budget';
  periodStart: string;
  periodEnd: string;
  transactionCount: number;
}

// models/subscription.model.ts
export interface Subscription {
  id: string;
  householdId: string;
  accountId?: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  amount: number;
  billingCycleId: string;
  billingCycleName: string;
  nextBillingDate: string; // DateOnly format
  isActive: boolean;
  autoRenew: boolean;
  merchantWebsite?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Angular Service Examples

### CategoryService
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'https://your-api-url.com/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getByType(type: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/type/${type}`);
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  create(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### TransactionService
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'https://your-api-url.com/api/transactions';

  constructor(private http: HttpClient) {}

  getByHousehold(
    householdId: string, 
    filters?: {
      startDate?: string;
      endDate?: string;
      accountId?: string;
      categoryId?: string;
      type?: string;
    }
  ): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/household/${householdId}`,
      { params }
    );
  }

  getSummary(
    householdId: string,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get(
      `${this.apiUrl}/household/${householdId}/summary`,
      { params }
    );
  }

  create(transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  update(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(householdId: string, searchTerm: string, limit = 50): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('limit', limit.toString());
    
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/household/${householdId}/search`,
      { params }
    );
  }
}
```

### BudgetService
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetPerformance } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private apiUrl = 'https://your-api-url.com/api/budgets';

  constructor(private http: HttpClient) {}

  getByHousehold(householdId: string, isActive?: boolean): Observable<Budget[]> {
    let params = new HttpParams();
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }
    return this.http.get<Budget[]>(
      `${this.apiUrl}/household/${householdId}`,
      { params }
    );
  }

  getPerformance(
    budgetId: string,
    startDate?: string,
    endDate?: string
  ): Observable<BudgetPerformance> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<BudgetPerformance>(
      `${this.apiUrl}/${budgetId}/performance`,
      { params }
    );
  }

  getSummary(
    householdId: string,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get(
      `${this.apiUrl}/household/${householdId}/summary`,
      { params }
    );
  }

  getAlerts(householdId: string): Observable<BudgetPerformance[]> {
    return this.http.get<BudgetPerformance[]>(
      `${this.apiUrl}/household/${householdId}/alerts`
    );
  }

  create(budget: Partial<Budget>): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  update(id: string, budget: Partial<Budget>): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 🎨 Component Integration Examples

### Transaction List Component
```typescript
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;

  constructor(
    private transactionService: TransactionService,
    private householdService: HouseholdService
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    const householdId = this.householdService.getCurrentHouseholdId();
    
    this.transactionService.getByHousehold(householdId, {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading transactions', err);
        this.loading = false;
      }
    });
  }
}
```

### Budget Dashboard Component
```typescript
export class BudgetDashboardComponent implements OnInit {
  budgetSummary: any;
  alerts: BudgetPerformance[] = [];

  constructor(
    private budgetService: BudgetService,
    private householdService: HouseholdService
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    const householdId = this.householdService.getCurrentHouseholdId();
    
    // Load summary
    this.budgetService.getSummary(householdId).subscribe({
      next: (data) => this.budgetSummary = data
    });

    // Load alerts
    this.budgetService.getAlerts(householdId).subscribe({
      next: (data) => this.alerts = data
    });
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Date Format
Backend uses `DateOnly` (YYYY-MM-DD format), not full ISO dates:
```typescript
// ✅ Correct
const date = '2024-11-01';

// ❌ Wrong
const date = new Date().toISOString(); // Contains time
```

### 2. Household Context
Always include householdId from authenticated user:
```typescript
// Store after login
localStorage.setItem('currentHouseholdId', householdId);

// Use in requests
const householdId = localStorage.getItem('currentHouseholdId');
```

### 3. Guid Format
All IDs are GUIDs (UUIDs):
```typescript
// Example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### 4. Authorization
403 Forbidden means user doesn't belong to household:
```typescript
if (error.status === 403) {
  // User doesn't have access to this household
  this.router.navigate(['/unauthorized']);
}
```

---

## 🚀 Getting Started Checklist

- [ ] Set up HTTP interceptor for JWT authentication
- [ ] Create TypeScript models for all DTOs
- [ ] Create Angular services for each controller
- [ ] Implement error handling (401, 403, 404, 500)
- [ ] Add loading states to components
- [ ] Store current householdId after login
- [ ] Test all CRUD operations
- [ ] Implement pagination for large lists
- [ ] Add date picker components (use DateOnly format)
- [ ] Create dashboard components using summary endpoints

---

## 📚 Additional Resources

- **Swagger UI:** `https://your-api-url.com/swagger` (when backend is running)
- **Full Documentation:** See `CONTROLLERS-CREATED.md`
- **Backend Setup:** See `README.md` in backend folder

---

**Questions?** Check the full controller documentation in `CONTROLLERS-CREATED.md` or contact the backend team.

