export interface Insurance {
  id: string;
  type: InsuranceType;
  provider: string;
  policyNumber: string;
  premium: number;
  billingFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  startDate: Date;
  renewalDate: Date;
  coverage: string;
  deductible?: number;
  beneficiaries?: string[];
  documentUrl?: string;
}

export type InsuranceType = 
  | 'home'
  | 'auto'
  | 'health'
  | 'life'
  | 'disability'
  | 'umbrella'
  | 'other';

