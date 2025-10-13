export interface Alert {
  id: string;
  householdId: string;
  
  // Alert Classification
  type: AlertType;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  
  // Alert Content
  title: string;
  message: string;
  description?: string;
  
  // Related Entity
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  
  // Status & Timing
  status: AlertStatus;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  
  // Recurrence
  isRecurring: boolean;
  recurrenceRule?: string;
  nextOccurrence?: Date;
}

export enum AlertType {
  REMINDER = 'Reminder',
  WARNING = 'Warning',
  ERROR = 'Error',
  INFO = 'Info',
  SUCCESS = 'Success'
}

export enum AlertCategory {
  BILLS = 'Bills',
  MAINTENANCE = 'Maintenance',
  HEALTHCARE = 'Healthcare',
  INSURANCE = 'Insurance',
  DOCUMENTS = 'Documents',
  INVENTORY = 'Inventory',
  BUDGET = 'Budget',
  FINANCIAL = 'Financial',
  SYSTEM = 'System'
}

export enum AlertSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum AlertPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

export enum AlertStatus {
  ACTIVE = 'Active',
  READ = 'Read',
  DISMISSED = 'Dismissed',
  EXPIRED = 'Expired',
  ARCHIVED = 'Archived'
}

export interface AlertStats {
  totalAlerts: number;
  unreadAlerts: number;
  criticalAlerts: number;
  highPriorityAlerts: number;
  alertsByCategory: { [key: string]: number };
  alertsBySeverity: { [key: string]: number };
}

export interface CreateAlertDto {
  householdId?: string;
  type: AlertType;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  title: string;
  message: string;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

