import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Doctor, Appointment, Prescription, MedicalRecord } from '../models/healthcare.model';

/**
 * Healthcare Service
 * Handles healthcare-related operations including doctors, appointments, prescriptions, and medical records
 */
@Injectable({
  providedIn: 'root'
})
export class HealthcareService extends BaseApiService {
  private readonly authService = inject(AuthService);

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
   * Get auth headers
   */
  private getHeaders() {
    const headers = this.authService.getAuthHeaders();
    if (!headers.has('Content-Type')) {
      return {
        headers: headers.set('Content-Type', 'application/json')
      };
    }
    return { headers };
  }

  // ===== DOCTORS =====

  public loadDoctors(): Observable<Doctor[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Doctor[]>(
      `${this.API_URL}/Doctors/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(doctors => this.doctorsSignal.set(doctors)),
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
      return of({} as Doctor);
    }

    return this.http.post<Doctor>(
      `${this.API_URL}/Doctors`,
      doctor,
      this.getHeaders()
    ).pipe(
      tap(newDoctor => {
        this.addToSignal(this.doctorsSignal, newDoctor);
        this.toastService.success('Success', 'Doctor added successfully');
      }),
      catchError(error => {
        console.error('Error adding doctor:', error);
        this.toastService.error('Error', 'Failed to add doctor');
        throw error;
      })
    );
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(
      `${this.API_URL}/Doctors/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedDoctor => {
        this.updateInSignal(this.doctorsSignal, updatedDoctor);
        this.toastService.success('Success', 'Doctor updated successfully');
      }),
      catchError(error => {
        console.error('Error updating doctor:', error);
        this.toastService.error('Error', 'Failed to update doctor');
        throw error;
      })
    );
  }

  public deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Doctors/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.doctorsSignal, id);
        this.toastService.success('Success', 'Doctor deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting doctor:', error);
        this.toastService.error('Error', 'Failed to delete doctor');
        throw error;
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

    return this.http.get<Appointment[]>(
      `${this.API_URL}/Appointments/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(appointments => this.appointmentsSignal.set(appointments)),
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
      return of({} as Appointment);
    }

    return this.http.post<Appointment>(
      `${this.API_URL}/Appointments`,
      appointment,
      this.getHeaders()
    ).pipe(
      tap(newAppointment => {
        this.addToSignal(this.appointmentsSignal, newAppointment);
        this.toastService.success('Success', 'Appointment added successfully');
      }),
      catchError(error => {
        console.error('Error adding appointment:', error);
        this.toastService.error('Error', 'Failed to add appointment');
        throw error;
      })
    );
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.API_URL}/Appointments/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedAppointment => {
        this.updateInSignal(this.appointmentsSignal, updatedAppointment);
        this.toastService.success('Success', 'Appointment updated successfully');
      }),
      catchError(error => {
        console.error('Error updating appointment:', error);
        this.toastService.error('Error', 'Failed to update appointment');
        throw error;
      })
    );
  }

  public deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Appointments/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.appointmentsSignal, id);
        this.toastService.success('Success', 'Appointment deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting appointment:', error);
        this.toastService.error('Error', 'Failed to delete appointment');
        throw error;
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

    return this.http.get<Prescription[]>(
      `${this.API_URL}/Prescriptions/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(prescriptions => this.prescriptionsSignal.set(prescriptions)),
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
      return of({} as Prescription);
    }

    return this.http.post<Prescription>(
      `${this.API_URL}/Prescriptions`,
      prescription,
      this.getHeaders()
    ).pipe(
      tap(newPrescription => {
        this.addToSignal(this.prescriptionsSignal, newPrescription);
        this.toastService.success('Success', 'Prescription added successfully');
      }),
      catchError(error => {
        console.error('Error adding prescription:', error);
        this.toastService.error('Error', 'Failed to add prescription');
        throw error;
      })
    );
  }

  public updatePrescription(id: string, updates: Partial<Prescription>): Observable<Prescription> {
    return this.http.put<Prescription>(
      `${this.API_URL}/Prescriptions/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedPrescription => {
        this.updateInSignal(this.prescriptionsSignal, updatedPrescription);
        this.toastService.success('Success', 'Prescription updated successfully');
      }),
      catchError(error => {
        console.error('Error updating prescription:', error);
        this.toastService.error('Error', 'Failed to update prescription');
        throw error;
      })
    );
  }

  public deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Prescriptions/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.prescriptionsSignal, id);
        this.toastService.success('Success', 'Prescription deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting prescription:', error);
        this.toastService.error('Error', 'Failed to delete prescription');
        throw error;
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

    return this.http.get<MedicalRecord[]>(
      `${this.API_URL}/MedicalRecords/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(records => this.medicalRecordsSignal.set(records)),
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
      return of({} as MedicalRecord);
    }

    return this.http.post<MedicalRecord>(
      `${this.API_URL}/MedicalRecords`,
      record,
      this.getHeaders()
    ).pipe(
      tap(newRecord => {
        this.addToSignal(this.medicalRecordsSignal, newRecord);
        this.toastService.success('Success', 'Medical record added successfully');
      }),
      catchError(error => {
        console.error('Error adding medical record:', error);
        this.toastService.error('Error', 'Failed to add medical record');
        throw error;
      })
    );
  }

  public updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(
      `${this.API_URL}/MedicalRecords/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedRecord => {
        this.updateInSignal(this.medicalRecordsSignal, updatedRecord);
        this.toastService.success('Success', 'Medical record updated successfully');
      }),
      catchError(error => {
        console.error('Error updating medical record:', error);
        this.toastService.error('Error', 'Failed to update medical record');
        throw error;
      })
    );
  }

  public deleteMedicalRecord(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/MedicalRecords/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.medicalRecordsSignal, id);
        this.toastService.success('Success', 'Medical record deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting medical record:', error);
        this.toastService.error('Error', 'Failed to delete medical record');
        throw error;
      })
    );
  }
}

