import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { 
  GridModule, 
  PageService, 
  SortService, 
  FilterService, 
  ToolbarService,
  EditService,
  GridComponent
} from '@syncfusion/ej2-angular-grids';
import { 
  DialogModule,
  DialogComponent 
} from '@syncfusion/ej2-angular-popups';
import { 
  TabModule 
} from '@syncfusion/ej2-angular-navigations';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import type { 
  Doctor, 
  Appointment, 
  Prescription, 
  MedicalRecord,
  DoctorType,
  AppointmentType,
  AppointmentStatus 
} from '../../models/healthcare.model';

@Component({
  selector: 'app-healthcare',
  imports: [
    CommonModule,
    FormsModule,
    GridModule,
    DialogModule,
    TabModule,
    AppBarModule
  ],
  providers: [
    PageService,
    SortService,
    FilterService,
    ToolbarService,
    EditService
  ],
  templateUrl: './healthcare.html',
  styleUrl: './healthcare.scss',
  standalone: true
})
export class Healthcare {
  private readonly dataService = inject(DataService);

  @ViewChild('doctorDialog') doctorDialog!: DialogComponent;
  @ViewChild('appointmentDialog') appointmentDialog!: DialogComponent;
  @ViewChild('prescriptionDialog') prescriptionDialog!: DialogComponent;
  @ViewChild('doctorGrid') doctorGrid!: GridComponent;
  @ViewChild('appointmentGrid') appointmentGrid!: GridComponent;
  @ViewChild('prescriptionGrid') prescriptionGrid!: GridComponent;

  // Data signals
  protected readonly doctors = this.dataService.doctors;
  protected readonly appointments = this.dataService.appointments;
  protected readonly prescriptions = this.dataService.prescriptions;
  protected readonly healthcareStats = this.dataService.healthcareStats;

  // Filtered/computed data
  protected readonly upcomingAppointments = computed(() =>
    this.appointments()
      .filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  );

  protected readonly activePrescriptions = computed(() =>
    this.prescriptions().filter(rx => rx.isActive)
  );

  protected readonly refillsNeeded = computed(() =>
    this.prescriptions().filter(rx => 
      rx.isActive && 
      rx.refillsRemaining <= 2 &&
      (!rx.nextRefillDate || new Date(rx.nextRefillDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    )
  );

  // Form models
  protected doctorForm = signal<Partial<Doctor>>({});
  protected appointmentForm = signal<Partial<Appointment>>({});
  protected prescriptionForm = signal<Partial<Prescription>>({});
  protected editMode = signal(false);

  // Dropdown options
  protected readonly doctorTypes: DoctorType[] = [
    'primary-care',
    'specialist',
    'dentist',
    'optometrist',
    'therapist',
    'other'
  ];

  protected readonly appointmentTypes: AppointmentType[] = [
    'checkup',
    'follow-up',
    'consultation',
    'procedure',
    'lab-work',
    'vaccination',
    'telehealth',
    'emergency',
    'other'
  ];

  protected readonly appointmentStatuses: AppointmentStatus[] = [
    'scheduled',
    'confirmed',
    'completed',
    'cancelled',
    'no-show',
    'rescheduled'
  ];

  // Grid configurations
  protected readonly pageSettings = { pageSize: 10, pageSizes: [10, 20, 50] };
  protected readonly filterSettings = { type: 'Excel' };
  protected readonly toolbarOptions = ['Search'];

  // Doctor methods
  protected openDoctorDialog(doctor?: Doctor): void {
    this.editMode.set(!!doctor);
    this.doctorForm.set(doctor ? { ...doctor } : {
      type: 'primary-care',
      acceptedInsurance: []
    });
    this.doctorDialog.show();
  }

  protected saveDoctor(): void {
    const doctor = this.doctorForm() as Doctor;
    
    if (this.editMode()) {
      this.dataService.updateDoctor(doctor.id, doctor);
    } else {
      this.dataService.addDoctor({
        ...doctor,
        id: crypto.randomUUID()
      });
    }
    
    this.doctorDialog.hide();
    this.doctorForm.set({});
  }

  protected deleteDoctor(id: string): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.dataService.deleteDoctor(id);
    }
  }

  // Appointment methods
  protected openAppointmentDialog(appointment?: Appointment): void {
    this.editMode.set(!!appointment);
    this.appointmentForm.set(appointment ? { ...appointment } : {
      status: 'scheduled',
      type: 'checkup',
      duration: 30
    });
    this.appointmentDialog.show();
  }

  protected saveAppointment(): void {
    const appointment = this.appointmentForm() as Appointment;
    
    if (this.editMode()) {
      this.dataService.updateAppointment(appointment.id, appointment);
    } else {
      this.dataService.addAppointment({
        ...appointment,
        id: crypto.randomUUID()
      });
    }
    
    this.appointmentDialog.hide();
    this.appointmentForm.set({});
  }

  protected deleteAppointment(id: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.dataService.deleteAppointment(id);
    }
  }

  // Prescription methods
  protected openPrescriptionDialog(prescription?: Prescription): void {
    this.editMode.set(!!prescription);
    this.prescriptionForm.set(prescription ? { ...prescription } : {
      isActive: true,
      reminderEnabled: true,
      refillsRemaining: 0
    });
    this.prescriptionDialog.show();
  }

  protected savePrescription(): void {
    const prescription = this.prescriptionForm() as Prescription;
    
    if (this.editMode()) {
      this.dataService.updatePrescription(prescription.id, prescription);
    } else {
      this.dataService.addPrescription({
        ...prescription,
        id: crypto.randomUUID()
      });
    }
    
    this.prescriptionDialog.hide();
    this.prescriptionForm.set({});
  }

  protected deletePrescription(id: string): void {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.dataService.deletePrescription(id);
    }
  }

  // Utility methods
  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  protected formatDateTime(date: Date, time: string): string {
    return `${this.formatDate(date)} at ${time}`;
  }

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'scheduled': 'badge--info',
      'confirmed': 'badge--success',
      'completed': 'badge--success',
      'cancelled': 'badge--error',
      'no-show': 'badge--warning',
      'rescheduled': 'badge--warning'
    };
    return statusMap[status] || 'badge--info';
  }

  protected formatDoctorType(type: string): string {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

