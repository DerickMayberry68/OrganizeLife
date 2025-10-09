export interface DashboardStats {
  upcomingBills: number;
  overdueItems: number;
  maintenanceTasks: number;
  expiringDocuments: number;
  budgetStatus: BudgetStatus;
  recentActivity: ActivityItem[];
}

export interface BudgetStatus {
  totalBudget: number;
  totalSpent: number;
  percentageUsed: number;
  status: 'good' | 'warning' | 'critical';
}

export interface ActivityItem {
  id: string;
  type: 'bill' | 'transaction' | 'maintenance' | 'document' | 'insurance';
  title: string;
  timestamp: Date;
  icon: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  actionLabel?: string;
  actionRoute?: string;
}

