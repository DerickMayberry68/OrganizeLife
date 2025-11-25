import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Doctor, Appointment, Prescription, MedicalRecord } from '../models/healthcare.model';

/**
 * Healthcare Service
 * Handles healthcare-related operations including doctors, appointments, prescriptions, and medical records using Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class HealthcareService extends BaseApiService {

  // Healthcare signals
  private readonly doctorsSignal = signal<Doctor[]>([]);
  private readonly appointmentsSignal = signal<Appointment[]>([]);
  private readonly prescriptionsSignal = signal<Prescription[]>([]);
  private readonly medicalRecordsSignal = signal<MedicalRecord[]>([]);

  // Public readonly accessors
  public readonly doctors = this.doctorsSignal.asReadonly();
  public readonly appointments = this.appointmentsSignal.asReadonly();
  public readonly prescriptions = this.prescriptionsSignal.asReadonly();
  public readonly medicalRecords = this.medicalRecordsSignal.asReadonly();

  // Computed values
  public readonly upcomingAppointments = computed(() =>
    this.appointmentsSignal().filter(a =>
      new Date(a.date) > new Date() && a.status !== 'cancelled'
    )
  );

  public readonly activePrescriptions = computed(() =>
    this.prescriptionsSignal().filter(p => p.isActive)
  );

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * Check if Supabase client is available
   */
  private ensureSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }

  // ===== DOCTORS =====

  public loadDoctors(): Observable<Doctor[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('doctors')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const doctors = this.mapDoctorsFromSupabase(response.data || []);
        this.doctorsSignal.set(doctors);
        return doctors;
      }),
      catchError(error => {
        console.error('Error loading doctors:', error);
        this.toastService.error('Error', 'Failed to load doctors');
        return of([]);
      })
    );
  }

  public addDoctor(doctor: any): Observable<Doctor> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const doctorData = {
      household_id: householdId,
      name: doctor.name,
      type: doctor.type,
      specialty: doctor.specialty || null,
      phone: doctor.phone,
      email: doctor.email || null,
      address: doctor.address || null,
      office_hours: doctor.officeHours || null,
      accepted_insurance: doctor.acceptedInsurance || [],
      website: doctor.website || null,
      notes: doctor.notes || null,
      is_primary: doctor.isPrimary || false
    };

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newDoctor = this.mapDoctorFromSupabase(response.data);
        this.addToSignal(this.doctorsSignal, newDoctor);
        this.toastService.success('Success', 'Doctor added successfully');
        return newDoctor;
      }),
      catchError(error => {
        console.error('Error adding doctor:', error);
        this.toastService.error('Error', 'Failed to add doctor');
        return throwError(() => error);
      })
    );
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Observable<Doctor> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.specialty !== undefined) updateData.specialty = updates.specialty;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.officeHours !== undefined) updateData.office_hours = updates.officeHours;
    if (updates.acceptedInsurance !== undefined) updateData.accepted_insurance = updates.acceptedInsurance;
    if (updates.website !== undefined) updateData.website = updates.website;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary;

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('doctors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedDoctor = this.mapDoctorFromSupabase(response.data);
        this.updateInSignal(this.doctorsSignal, updatedDoctor);
        this.toastService.success('Success', 'Doctor updated successfully');
        return updatedDoctor;
      }),
      catchError(error => {
        console.error('Error updating doctor:', error);
        this.toastService.error('Error', 'Failed to update doctor');
        return throwError(() => error);
      })
    );
  }

  public deleteDoctor(id: string): Observable<void> {
    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('doctors')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.doctorsSignal, id);
        this.toastService.success('Success', 'Doctor deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting doctor:', error);
        this.toastService.error('Error', 'Failed to delete doctor');
        return throwError(() => error);
      })
    );
  }

  // ===== APPOINTMENTS =====

  public loadAppointments(): Observable<Appointment[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('appointments')
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('date', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const appointments = this.mapAppointmentsFromSupabase(response.data || []);
        this.appointmentsSignal.set(appointments);
        return appointments;
      }),
      catchError(error => {
        console.error('Error loading appointments:', error);
        this.toastService.error('Error', 'Failed to load appointments');
        return of([]);
      })
    );
  }

  public addAppointment(appointment: any): Observable<Appointment> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const appointmentData = {
      household_id: householdId,
      doctor_id: appointment.doctorId,
      date: appointment.date ? (typeof appointment.date === 'string' ? appointment.date : appointment.date.toISOString().split('T')[0]) : null,
      time: appointment.time || null,
      duration: appointment.duration || 30,
      type: appointment.type || 'checkup',
      reason: appointment.reason || null,
      location: appointment.location || null,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || null,
      reminder_sent: appointment.reminderSent || false
    };

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newAppointment = this.mapAppointmentFromSupabase(response.data);
        this.addToSignal(this.appointmentsSignal, newAppointment);
        this.toastService.success('Success', 'Appointment added successfully');
        return newAppointment;
      }),
      catchError(error => {
        console.error('Error adding appointment:', error);
        this.toastService.error('Error', 'Failed to add appointment');
        return throwError(() => error);
      })
    );
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    const updateData: any = {};
    
    if (updates.doctorId !== undefined) updateData.doctor_id = updates.doctorId;
    if (updates.date !== undefined) {
      updateData.date = updates.date 
        ? (typeof updates.date === 'string' ? updates.date : updates.date.toISOString().split('T')[0])
        : null;
    }
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.reason !== undefined) updateData.reason = updates.reason;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.reminderSent !== undefined) updateData.reminder_sent = updates.reminderSent;

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedAppointment = this.mapAppointmentFromSupabase(response.data);
        this.updateInSignal(this.appointmentsSignal, updatedAppointment);
        this.toastService.success('Success', 'Appointment updated successfully');
        return updatedAppointment;
      }),
      catchError(error => {
        console.error('Error updating appointment:', error);
        this.toastService.error('Error', 'Failed to update appointment');
        return throwError(() => error);
      })
    );
  }

  public deleteAppointment(id: string): Observable<void> {
    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('appointments')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.appointmentsSignal, id);
        this.toastService.success('Success', 'Appointment deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting appointment:', error);
        this.toastService.error('Error', 'Failed to delete appointment');
        return throwError(() => error);
      })
    );
  }

  // ===== PRESCRIPTIONS =====

  public loadPrescriptions(): Observable<Prescription[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('prescriptions')
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('prescribed_date', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const prescriptions = this.mapPrescriptionsFromSupabase(response.data || []);
        this.prescriptionsSignal.set(prescriptions);
        return prescriptions;
      }),
      catchError(error => {
        console.error('Error loading prescriptions:', error);
        this.toastService.error('Error', 'Failed to load prescriptions');
        return of([]);
      })
    );
  }

  public addPrescription(prescription: any): Observable<Prescription> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const prescriptionData = {
      household_id: householdId,
      doctor_id: prescription.doctorId || null,
      medication_name: prescription.medicationName,
      dosage: prescription.dosage || null,
      frequency: prescription.frequency || null,
      prescribed_date: prescription.prescribedDate ? (typeof prescription.prescribedDate === 'string' ? prescription.prescribedDate : prescription.prescribedDate.toISOString().split('T')[0]) : null,
      refills_remaining: prescription.refillsRemaining || 0,
      last_refill_date: prescription.lastRefillDate ? (typeof prescription.lastRefillDate === 'string' ? prescription.lastRefillDate : prescription.lastRefillDate.toISOString().split('T')[0]) : null,
      next_refill_date: prescription.nextRefillDate ? (typeof prescription.nextRefillDate === 'string' ? prescription.nextRefillDate : prescription.nextRefillDate.toISOString().split('T')[0]) : null,
      pharmacy: prescription.pharmacy || null,
      instructions: prescription.instructions || null,
      side_effects: prescription.sideEffects || [],
      is_active: prescription.isActive !== undefined ? prescription.isActive : true,
      start_date: prescription.startDate ? (typeof prescription.startDate === 'string' ? prescription.startDate : prescription.startDate.toISOString().split('T')[0]) : null,
      end_date: prescription.endDate ? (typeof prescription.endDate === 'string' ? prescription.endDate : prescription.endDate.toISOString().split('T')[0]) : null,
      reminder_enabled: prescription.reminderEnabled || false
    };

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newPrescription = this.mapPrescriptionFromSupabase(response.data);
        this.addToSignal(this.prescriptionsSignal, newPrescription);
        this.toastService.success('Success', 'Prescription added successfully');
        return newPrescription;
      }),
      catchError(error => {
        console.error('Error adding prescription:', error);
        this.toastService.error('Error', 'Failed to add prescription');
        return throwError(() => error);
      })
    );
  }

  public updatePrescription(id: string, updates: Partial<Prescription>): Observable<Prescription> {
    const updateData: any = {};
    
    if (updates.medicationName !== undefined) updateData.medication_name = updates.medicationName;
    if (updates.dosage !== undefined) updateData.dosage = updates.dosage;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.prescribedBy !== undefined) updateData.prescribed_by = updates.prescribedBy;
    if (updates.doctorId !== undefined) updateData.doctor_id = updates.doctorId;
    if (updates.refillsRemaining !== undefined) updateData.refills_remaining = updates.refillsRemaining;
    if (updates.pharmacy !== undefined) updateData.pharmacy = updates.pharmacy;
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions;
    if (updates.sideEffects !== undefined) updateData.side_effects = updates.sideEffects;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.reminderEnabled !== undefined) updateData.reminder_enabled = updates.reminderEnabled;
    if (updates.prescribedDate !== undefined) {
      updateData.prescribed_date = updates.prescribedDate 
        ? (typeof updates.prescribedDate === 'string' ? updates.prescribedDate : updates.prescribedDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.startDate !== undefined) {
      updateData.start_date = updates.startDate 
        ? (typeof updates.startDate === 'string' ? updates.startDate : updates.startDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.endDate !== undefined) {
      updateData.end_date = updates.endDate 
        ? (typeof updates.endDate === 'string' ? updates.endDate : updates.endDate.toISOString().split('T')[0])
        : null;
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('prescriptions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          doctors:doctor_id (name)
        `)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedPrescription = this.mapPrescriptionFromSupabase(response.data);
        this.updateInSignal(this.prescriptionsSignal, updatedPrescription);
        this.toastService.success('Success', 'Prescription updated successfully');
        return updatedPrescription;
      }),
      catchError(error => {
        console.error('Error updating prescription:', error);
        this.toastService.error('Error', 'Failed to update prescription');
        return throwError(() => error);
      })
    );
  }

  public deletePrescription(id: string): Observable<void> {
    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('prescriptions')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.prescriptionsSignal, id);
        this.toastService.success('Success', 'Prescription deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting prescription:', error);
        this.toastService.error('Error', 'Failed to delete prescription');
        return throwError(() => error);
      })
    );
  }

  // ===== MEDICAL RECORDS =====

  public loadMedicalRecords(): Observable<MedicalRecord[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('medical_records')
        .select('*')
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('date', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const records = this.mapMedicalRecordsFromSupabase(response.data || []);
        this.medicalRecordsSignal.set(records);
        return records;
      }),
      catchError(error => {
        console.error('Error loading medical records:', error);
        this.toastService.error('Error', 'Failed to load medical records');
        return of([]);
      })
    );
  }

  public addMedicalRecord(record: any): Observable<MedicalRecord> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const recordData = {
      household_id: householdId,
      type: record.type,
      title: record.title,
      date: record.date ? (typeof record.date === 'string' ? record.date : record.date.toISOString().split('T')[0]) : null,
      provider: record.provider || null,
      description: record.description || null,
      document_url: record.documentUrl || null,
      attachments: record.attachments || [],
      category: record.category || null
    };

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('medical_records')
        .insert(recordData)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newRecord = this.mapMedicalRecordFromSupabase(response.data);
        this.addToSignal(this.medicalRecordsSignal, newRecord);
        this.toastService.success('Success', 'Medical record added successfully');
        return newRecord;
      }),
      catchError(error => {
        console.error('Error adding medical record:', error);
        this.toastService.error('Error', 'Failed to add medical record');
        return throwError(() => error);
      })
    );
  }

  public updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Observable<MedicalRecord> {
    const updateData: any = {};
    
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.provider !== undefined) updateData.provider = updates.provider;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.documentUrl !== undefined) updateData.document_url = updates.documentUrl;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.date !== undefined) {
      updateData.date = updates.date 
        ? (typeof updates.date === 'string' ? updates.date : updates.date.toISOString().split('T')[0])
        : null;
    }

    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('medical_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedRecord = this.mapMedicalRecordFromSupabase(response.data);
        this.updateInSignal(this.medicalRecordsSignal, updatedRecord);
        this.toastService.success('Success', 'Medical record updated successfully');
        return updatedRecord;
      }),
      catchError(error => {
        console.error('Error updating medical record:', error);
        this.toastService.error('Error', 'Failed to update medical record');
        return throwError(() => error);
      })
    );
  }

  public deleteMedicalRecord(id: string): Observable<void> {
    const supabase = this.ensureSupabaseClient();
    return from(
      supabase
        .from('medical_records')
        .delete()
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.medicalRecordsSignal, id);
        this.toastService.success('Success', 'Medical record deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting medical record:', error);
        this.toastService.error('Error', 'Failed to delete medical record');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapDoctorFromSupabase(data: any): Doctor {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      specialty: data.specialty,
      phone: data.phone,
      email: data.email,
      address: data.address,
      officeHours: data.office_hours,
      acceptedInsurance: data.accepted_insurance || [],
      website: data.website,
      notes: data.notes,
      isPrimary: data.is_primary || false
    };
  }

  private mapDoctorsFromSupabase(data: any[]): Doctor[] {
    return data.map(item => this.mapDoctorFromSupabase(item));
  }

  private mapAppointmentFromSupabase(data: any): Appointment {
    return {
      id: data.id,
      doctorId: data.doctor_id,
      doctorName: data.doctors?.name || data.doctor_name || '',
      date: new Date(data.date),
      time: data.time || '',
      duration: data.duration || 30,
      type: data.type || 'checkup',
      reason: data.reason || '',
      location: data.location || '',
      status: data.status || 'scheduled',
      notes: data.notes,
      reminderSent: data.reminder_sent || false,
      recurring: data.recurring ? JSON.parse(data.recurring) : undefined
    };
  }

  private mapAppointmentsFromSupabase(data: any[]): Appointment[] {
    return data.map(item => this.mapAppointmentFromSupabase(item));
  }

  private mapPrescriptionFromSupabase(data: any): Prescription {
    return {
      id: data.id,
      medicationName: data.medication_name,
      dosage: data.dosage || '',
      frequency: data.frequency || '',
      prescribedBy: data.doctors?.name || data.prescribed_by || '',
      doctorId: data.doctor_id,
      prescribedDate: data.prescribed_date ? new Date(data.prescribed_date) : new Date(),
      refillsRemaining: data.refills_remaining || 0,
      lastRefillDate: data.last_refill_date ? new Date(data.last_refill_date) : undefined,
      nextRefillDate: data.next_refill_date ? new Date(data.next_refill_date) : undefined,
      pharmacy: data.pharmacy || '',
      instructions: data.instructions || '',
      sideEffects: data.side_effects || [],
      isActive: data.is_active || false,
      startDate: data.start_date ? new Date(data.start_date) : new Date(),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      reminderEnabled: data.reminder_enabled || false
    };
  }

  private mapPrescriptionsFromSupabase(data: any[]): Prescription[] {
    return data.map(item => this.mapPrescriptionFromSupabase(item));
  }

  private mapMedicalRecordFromSupabase(data: any): MedicalRecord {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      date: data.date ? new Date(data.date) : new Date(),
      provider: data.provider || '',
      description: data.description || '',
      documentUrl: data.document_url,
      attachments: data.attachments || [],
      category: data.category || ''
    };
  }

  private mapMedicalRecordsFromSupabase(data: any[]): MedicalRecord[] {
    return data.map(item => this.mapMedicalRecordFromSupabase(item));
  }
}
