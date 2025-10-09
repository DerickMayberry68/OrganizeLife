export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  location: string;
  warranty?: Warranty;
  maintenanceSchedule?: MaintenanceSchedule[];
  photos?: string[];
  notes?: string;
}

export interface Warranty {
  startDate: Date;
  endDate: Date;
  provider: string;
  documentUrl?: string;
}

export interface MaintenanceSchedule {
  id: string;
  task: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCompleted?: Date;
  nextDue: Date;
}

