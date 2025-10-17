import { Component, inject, signal, computed, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthcareService } from '../../services/healthcare.service';
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
import { ComboBoxModule, DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ToastService } from '../../services/toast.service';
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
    AppBarModule,
    ComboBoxModule,
    DropDownListModule,
    CheckBoxModule,
    TextBoxModule,
    NumericTextBoxModule,
    DatePickerModule
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
export class Healthcare implements OnInit {
  private readonly healthcareService = inject(HealthcareService);
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    // Load all healthcare data when component initializes
    this.healthcareService.loadDoctors().subscribe();
    this.healthcareService.loadAppointments().subscribe();
    this.healthcareService.loadPrescriptions().subscribe();
  }

  @ViewChild('doctorDialog') doctorDialog!: DialogComponent;
  @ViewChild('appointmentDialog') appointmentDialog!: DialogComponent;
  @ViewChild('prescriptionDialog') prescriptionDialog!: DialogComponent;
  @ViewChild('doctorGrid') doctorGrid!: GridComponent;
  @ViewChild('appointmentGrid') appointmentGrid!: GridComponent;
  @ViewChild('prescriptionGrid') prescriptionGrid!: GridComponent;

  // Data signals
  protected readonly doctors = this.healthcareService.doctors;
  protected readonly appointments = this.healthcareService.appointments;
  protected readonly prescriptions = this.healthcareService.prescriptions;
  protected readonly healthcareStats = computed(() => ({
    totalDoctors: this.doctors().length,
    totalAppointments: this.appointments().length,
    activePrescriptions: this.prescriptions().filter(p => p.isActive).length,
    upcomingAppointments: this.appointments().filter(a => new Date(a.date) > new Date()).length,
    prescriptionsNeedingRefill: this.prescriptions().filter(p => p.isActive && p.refillsRemaining === 0).length,
    doctorsCount: this.doctors().length
  }));

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

  // Formatted doctor list for ComboBox (with primary doctor first)
  protected readonly doctorList = computed(() => {
    const doctors = this.doctors();
    const primary = doctors.filter(d => d.isPrimary);
    const others = doctors.filter(d => !d.isPrimary);
    
    // Sort primary first, then by name
    return [...primary, ...others].map(d => ({
      text: d.isPrimary ? `${d.name} ⭐ (Primary)` : d.name,
      value: d.name,
      id: d.id,
      isPrimary: d.isPrimary
    }));
  });

  // ComboBox fields mapping
  protected readonly comboBoxFields = { text: 'text', value: 'value' };

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
      acceptedInsurance: [],
      isPrimary: false
    });
    this.doctorDialog.show();
  }

  protected saveDoctor(): void {
    const doctor = this.doctorForm() as Doctor;
    
    if (this.editMode()) {
      this.healthcareService.updateDoctor(doctor.id, doctor).subscribe({
        next: () => {
          this.doctorDialog.hide();
          this.doctorForm.set({});
        },
        error: (error) => {
          console.error('Error saving doctor:', error);
        }
      });
    } else {
      const { id, ...doctorData } = doctor;
      this.healthcareService.addDoctor(doctorData).subscribe({
        next: () => {
          this.doctorDialog.hide();
          this.doctorForm.set({});
        },
        error: (error) => {
          console.error('Error saving doctor:', error);
        }
      });
    }
  }

  protected deleteDoctor(id: string): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Delete Doctor',
        text: 'Are you sure you want to delete this doctor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.healthcareService.deleteDoctor(id).subscribe({
            next: () => {
              this.toastService.success('Success', 'Doctor deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting doctor:', error);
              this.toastService.error('Error', 'Failed to delete doctor');
            }
          });
        }
      });
    });
  }

  protected togglePrimaryDoctor(doctor: Doctor): void {
    // If setting as primary, unmark all other primary doctors first
    if (!doctor.isPrimary) {
      const currentPrimary = this.doctors().find(d => d.isPrimary);
      if (currentPrimary) {
        const updatedPrimary = { ...currentPrimary, isPrimary: false };
        this.healthcareService.updateDoctor(currentPrimary.id, updatedPrimary).subscribe({
          error: (error) => {
            console.error('Error updating primary doctor:', error);
          }
        });
      }
    }

    // Toggle the current doctor's primary status
    const updatedDoctor = { ...doctor, isPrimary: !doctor.isPrimary };
    this.healthcareService.updateDoctor(doctor.id, updatedDoctor).subscribe({
      next: () => {
        this.toastService.success('Success', updatedDoctor.isPrimary ? 'Set as primary doctor' : 'Removed from primary');
      },
      error: (error) => {
        console.error('Error toggling primary doctor:', error);
        this.toastService.error('Error', 'Failed to update doctor');
      }
    });
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
      this.healthcareService.updateAppointment(appointment.id, appointment).subscribe({
        next: () => {
          this.appointmentDialog.hide();
          this.appointmentForm.set({});
        },
        error: (error) => {
          console.error('Error saving appointment:', error);
        }
      });
    } else {
      const { id, ...appointmentData } = appointment;
      this.healthcareService.addAppointment(appointmentData).subscribe({
        next: () => {
          this.appointmentDialog.hide();
          this.appointmentForm.set({});
        },
        error: (error) => {
          console.error('Error saving appointment:', error);
        }
      });
    }
  }

  protected deleteAppointment(id: string): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Delete Appointment',
        text: 'Are you sure you want to delete this appointment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.healthcareService.deleteAppointment(id).subscribe({
            next: () => {
              this.toastService.success('Success', 'Appointment deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting appointment:', error);
              this.toastService.error('Error', 'Failed to delete appointment');
            }
          });
        }
      });
    });
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
      this.healthcareService.updatePrescription(prescription.id, prescription).subscribe({
        next: () => {
          this.prescriptionDialog.hide();
          this.prescriptionForm.set({});
        },
        error: (error) => {
          console.error('Error saving prescription:', error);
        }
      });
    } else {
      const { id, ...prescriptionData } = prescription;
      this.healthcareService.addPrescription(prescriptionData).subscribe({
        next: () => {
          this.prescriptionDialog.hide();
          this.prescriptionForm.set({});
        },
        error: (error) => {
          console.error('Error saving prescription:', error);
        }
      });
    }
  }

  protected deletePrescription(id: string): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Delete Prescription',
        text: 'Are you sure you want to delete this prescription?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.healthcareService.deletePrescription(id).subscribe({
            next: () => {
              this.toastService.success('Success', 'Prescription deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting prescription:', error);
              this.toastService.error('Error', 'Failed to delete prescription');
            }
          });
        }
      });
    });
  }

  // Handle doctor selection from ComboBox
  protected onDoctorSelected(event: any): void {
    const selectedDoctor = this.doctorList().find(d => d.value === event.itemData?.value);
    if (selectedDoctor) {
      this.prescriptionForm.update(form => ({
        ...form,
        prescribedBy: selectedDoctor.value,
        doctorId: selectedDoctor.id
      }));
    }
  }

  // Handle manual entry in ComboBox (override)
  protected onDoctorChanged(event: any): void {
    const value = event.value;
    // If manually entered (not from list), clear doctorId
    const matchingDoctor = this.doctorList().find(d => d.value === value);
    this.prescriptionForm.update(form => ({
      ...form,
      prescribedBy: value,
      doctorId: matchingDoctor?.id || undefined
    }));
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

