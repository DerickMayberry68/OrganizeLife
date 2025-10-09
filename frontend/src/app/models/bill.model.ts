export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  category: string;
  isRecurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  autoPayEnabled: boolean;
  reminderDays: number;
}

export interface PaymentHistory {
  id: string;
  billId: string;
  paidDate: Date;
  amount: number;
  confirmationNumber?: string;
}

