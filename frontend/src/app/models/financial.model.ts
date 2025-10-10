// Transaction Response DTO (from API)
export interface Transaction {
  id: string;
  householdId: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  date: Date;
  description: string;
  amount: number;
  type: string; // 'income' | 'expense'
  merchantName?: string;
  notes?: string;
  plaidTransactionId?: string;
  isRecurring: boolean;
  parentTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Create DTO (to API)
export interface CreateTransactionDto {
  householdId?: string; // Optional here, will be set by service
  accountId: string;
  categoryId?: string;
  date: Date | string; // Accept both Date object and ISO string
  description: string;
  amount: number;
  type: string;
  merchantName?: string;
  notes?: string;
  isRecurring?: boolean;
  parentTransactionId?: string;
}

// Budget Response DTO (from API)
export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  limitAmount: number;
  period: string; // e.g., "Monthly", "Quarterly", "Yearly"
  startDate: string; // DateOnly format
  endDate?: string; // DateOnly format
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Budget Create DTO (to API)
export interface CreateBudgetDto {
  householdId?: string; // Optional here, will be set by service
  categoryId: string; // Required
  name: string;
  limitAmount: number;
  period: string;
  startDate: Date | string; // Accept both Date object and DateOnly string
  endDate?: Date | string;
  isActive?: boolean;
}

// Budget Performance DTO (from API)
export interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: string; // "Under Budget", "Near Limit", "Over Budget"
  periodStart: string;
  periodEnd: string;
  transactionCount: number;
}

// Category model
export interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  institution: string;
  lastUpdated: Date;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  nextBillingDate: Date;
  category: string;
}

