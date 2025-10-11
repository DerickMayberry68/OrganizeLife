// Healthcare Data Models

export interface Doctor {
  id: string;
  name: string;
  type: DoctorType;
  specialty?: string;
  phone: string;
  email?: string;
  address: string;
  officeHours?: string;
  acceptedInsurance: string[];
  website?: string;
  notes?: string;
}

export type DoctorType = 
  | 'primary-care'
  | 'specialist'
  | 'dentist'
  | 'optometrist'
  | 'therapist'
  | 'other';

export type MedicalSpecialty =
  | 'cardiology'
  | 'dermatology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'neurology'
  | 'oncology'
  | 'orthopedics'
  | 'pediatrics'
  | 'psychiatry'
  | 'pulmonology'
  | 'urology'
  | 'other';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  duration: number; // minutes
  type: AppointmentType;
  reason: string;
  location: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent?: boolean;
  recurring?: RecurringPattern;
}

export type AppointmentType =
  | 'checkup'
  | 'follow-up'
  | 'consultation'
  | 'procedure'
  | 'lab-work'
  | 'vaccination'
  | 'telehealth'
  | 'emergency'
  | 'other';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'rescheduled';

export interface RecurringPattern {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  endDate?: Date;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: Date;
  refillsRemaining: number;
  lastRefillDate?: Date;
  nextRefillDate?: Date;
  pharmacy: string;
  instructions: string;
  sideEffects?: string[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  reminderEnabled: boolean;
}

export interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  date: Date;
  provider: string;
  description: string;
  documentUrl?: string;
  attachments?: string[];
  category: string;
}

export type RecordType =
  | 'lab-result'
  | 'imaging'
  | 'vaccination'
  | 'procedure'
  | 'diagnosis'
  | 'note'
  | 'other';

export interface HealthProfile {
  bloodType?: string;
  allergies: Allergy[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  preferredPharmacy?: Pharmacy;
  insuranceId?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction: string;
  diagnosedDate?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  phone: string;
  address: string;
  hours: string;
  is24Hour: boolean;
}

// Dashboard statistics
export interface HealthcareStats {
  upcomingAppointments: number;
  activePrescriptions: number;
  prescriptionsNeedingRefill: number;
  doctorsCount: number;
}

