export interface MaintenanceTask {
  id: string;
  title: string;
  category: MaintenanceCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled';
  dueDate: Date;
  estimatedCost?: number;
  serviceProvider?: ServiceProvider;
  notes?: string;
  isRecurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  completedDate?: Date;
}

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'landscaping'
  | 'cleaning'
  | 'general'
  | 'other';

export interface ServiceProvider {
  id: string;
  name: string;
  category: MaintenanceCategory;
  phone: string;
  email?: string;
  website?: string;
  rating?: number;
  notes?: string;
}

