// Example Angular environment configuration for TheButler API
// Place this in your Angular project: src/environments/environment.ts

export const environment = {
  production: false,
  
  // Backend API Configuration
  apiUrl: 'https://localhost:7001/api', // Adjust port as needed
  apiTimeout: 30000, // 30 seconds
  
  // API Endpoints (auto-generated from controllers)
  endpoints: {
    // Categories
    categories: {
      base: '/categories',
      getAll: '/categories',
      getByType: (type: string) => `/categories/type/${type}`,
      getById: (id: string) => `/categories/${id}`,
      create: '/categories',
      update: (id: string) => `/categories/${id}`,
      delete: (id: string) => `/categories/${id}`,
      usage: (id: string) => `/categories/${id}/usage`
    },
    
    // Transactions
    transactions: {
      base: '/transactions',
      getByHousehold: (householdId: string) => `/transactions/household/${householdId}`,
      getByAccount: (accountId: string) => `/transactions/account/${accountId}`,
      getById: (id: string) => `/transactions/${id}`,
      create: '/transactions',
      update: (id: string) => `/transactions/${id}`,
      delete: (id: string) => `/transactions/${id}`,
      summary: (householdId: string) => `/transactions/household/${householdId}/summary`,
      search: (householdId: string) => `/transactions/household/${householdId}/search`
    },
    
    // Bills
    bills: {
      base: '/bills',
      getByHousehold: (householdId: string) => `/bills/household/${householdId}`,
      upcoming: (householdId: string) => `/bills/household/${householdId}/upcoming`,
      getById: (id: string) => `/bills/${id}`,
      create: '/bills',
      update: (id: string) => `/bills/${id}`,
      delete: (id: string) => `/bills/${id}`,
      markPaid: (id: string) => `/bills/${id}/mark-paid`,
      paymentHistory: (id: string) => `/bills/${id}/payment-history`,
      summary: (householdId: string) => `/bills/household/${householdId}/summary`
    },
    
    // Budgets
    budgets: {
      base: '/budgets',
      getByHousehold: (householdId: string) => `/budgets/household/${householdId}`,
      getById: (id: string) => `/budgets/${id}`,
      create: '/budgets',
      update: (id: string) => `/budgets/${id}`,
      delete: (id: string) => `/budgets/${id}`,
      performance: (id: string) => `/budgets/${id}/performance`,
      summary: (householdId: string) => `/budgets/household/${householdId}/summary`,
      alerts: (householdId: string) => `/budgets/household/${householdId}/alerts`
    },
    
    // Subscriptions
    subscriptions: {
      base: '/subscriptions',
      getByHousehold: (householdId: string) => `/subscriptions/household/${householdId}`,
      upcoming: (householdId: string) => `/subscriptions/household/${householdId}/upcoming`,
      getById: (id: string) => `/subscriptions/${id}`,
      create: '/subscriptions',
      update: (id: string) => `/subscriptions/${id}`,
      delete: (id: string) => `/subscriptions/${id}`,
      renew: (id: string) => `/subscriptions/${id}/renew`,
      cancel: (id: string) => `/subscriptions/${id}/cancel`,
      summary: (householdId: string) => `/subscriptions/household/${householdId}/summary`
    },
    
    // Accounts (existing)
    accounts: {
      base: '/accounts',
      getByHousehold: (householdId: string) => `/accounts/household/${householdId}`,
      getById: (id: string) => `/accounts/${id}`,
      create: '/accounts',
      update: (id: string) => `/accounts/${id}`,
      delete: (id: string) => `/accounts/${id}`,
      summary: (householdId: string) => `/accounts/household/${householdId}/summary`
    },
    
    // Setup/Auth (existing)
    setup: {
      register: '/setup/register',
      login: '/setup/login',
      user: (userId: string) => `/setup/user/${userId}`,
      testConfig: '/setup/test-config'
    }
  },
  
  // Supabase Configuration (if using directly from frontend)
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  
  // App Configuration
  app: {
    name: 'TheButler',
    version: '1.0.0',
    defaultHouseholdName: 'My Household'
  },
  
  // Feature Flags
  features: {
    enableBudgets: true,
    enableSubscriptions: true,
    enableBills: true,
    enableTransactions: true,
    enableDocuments: false, // Not yet implemented
    enableWarranties: false, // Not yet implemented
    enableInsurance: false // Not yet implemented
  },
  
  // UI Configuration
  ui: {
    itemsPerPage: 25,
    maxUploadSize: 10485760, // 10MB in bytes
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'USD',
    defaultTheme: 'light'
  },
  
  // Chart/Dashboard Configuration
  dashboard: {
    defaultDateRange: 30, // days
    maxTransactionsToShow: 100,
    upcomingBillsDays: 30,
    upcomingRenewalsDays: 30,
    budgetAlertThreshold: 80 // percentage
  }
};

// ============================================
// Production Environment Example
// ============================================

/*
// src/environments/environment.prod.ts

export const environment = {
  production: true,
  apiUrl: 'https://api.thebutler.app/api',
  apiTimeout: 30000,
  
  // ... same endpoints structure as above
  
  supabase: {
    url: process.env['SUPABASE_URL'],
    anonKey: process.env['SUPABASE_ANON_KEY']
  },
  
  // ... rest of config
};
*/

// ============================================
// Usage in Angular Services
// ============================================

/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByHousehold(householdId: string, filters?: any) {
    const endpoint = this.baseUrl + environment.endpoints.transactions.getByHousehold(householdId);
    return this.http.get(endpoint, { params: filters });
  }
}
*/

// ============================================
// HTTP Interceptor Example
// ============================================

/*
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add auth header for our API requests
    if (req.url.startsWith(environment.apiUrl)) {
      const token = this.authService.getAccessToken();
      
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }
    
    return next.handle(req);
  }
}

// Register in app.module.ts:
// providers: [
//   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
// ]
*/

// ============================================
// Error Interceptor Example
// ============================================

/*
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - user doesn't have access
          console.error('Access denied to household');
          this.router.navigate(['/unauthorized']);
        } else if (error.status === 404) {
          // Not found
          console.error('Resource not found');
        } else if (error.status === 500) {
          // Server error
          console.error('Server error:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }
}
*/

// ============================================
// Date Utility Helper
// ============================================

/*
// src/app/utils/date.utils.ts

export class DateUtils {
  // Convert JavaScript Date to DateOnly format (YYYY-MM-DD)
  static toDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert DateOnly string to JavaScript Date
  static fromDateOnly(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }

  // Get start of current month
  static getMonthStart(): string {
    const date = new Date();
    return this.toDateOnly(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  // Get end of current month
  static getMonthEnd(): string {
    const date = new Date();
    return this.toDateOnly(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  }

  // Get date N days ago
  static getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.toDateOnly(date);
  }

  // Get date N days from now
  static getDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.toDateOnly(date);
  }
}
*/

