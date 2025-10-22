import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppBarModule,
    ButtonModule,
    CheckBoxModule,
    SwitchModule,
    TextBoxModule,
    DropDownListModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  // Signals
  protected readonly isLoading = signal(false);
  protected readonly user = computed(() => this.authService.getCurrentUser());
  protected readonly activeTab = signal<string>('general');

  // Forms
  protected generalForm: FormGroup;
  protected notificationForm: FormGroup;
  protected privacyForm: FormGroup;
  protected appearanceForm: FormGroup;

  // Dropdown data
  protected readonly timezones = [
    { text: 'Eastern Time (ET)', value: 'America/New_York' },
    { text: 'Central Time (CT)', value: 'America/Chicago' },
    { text: 'Mountain Time (MT)', value: 'America/Denver' },
    { text: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { text: 'Alaska Time (AKT)', value: 'America/Anchorage' },
    { text: 'Hawaii Time (HT)', value: 'Pacific/Honolulu' }
  ];

  protected readonly languages = [
    { text: 'English', value: 'en' },
    { text: 'Spanish', value: 'es' },
    { text: 'French', value: 'fr' },
    { text: 'German', value: 'de' }
  ];

  protected readonly dateFormats = [
    { text: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { text: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { text: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
  ];

  protected readonly currencies = [
    { text: 'US Dollar ($)', value: 'USD' },
    { text: 'Euro (€)', value: 'EUR' },
    { text: 'British Pound (£)', value: 'GBP' },
    { text: 'Canadian Dollar (C$)', value: 'CAD' }
  ];

  protected readonly themes = [
    { text: 'Light', value: 'light' },
    { text: 'Dark', value: 'dark' },
    { text: 'Auto', value: 'auto' }
  ];

  constructor() {
    // Initialize forms
    this.generalForm = this.fb.group({
      timezone: ['America/New_York', Validators.required],
      language: ['en', Validators.required],
      dateFormat: ['MM/DD/YYYY', Validators.required],
      currency: ['USD', Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      billReminders: [true],
      budgetAlerts: [true],
      maintenanceReminders: [true],
      alertsEmail: [true],
      alertsPush: [false],
      alertsSMS: [false],
      weeklyDigest: [true],
      monthlyReport: [true]
    });

    this.privacyForm = this.fb.group({
      profileVisibility: [true],
      showEmail: [false],
      shareAnalytics: [true],
      twoFactorAuth: [false]
    });

    this.appearanceForm = this.fb.group({
      theme: ['light'],
      compactMode: [false],
      showSidebar: [true],
      animations: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    // TODO: Load settings from API or local storage
    // For now, using defaults
  }

  protected setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  protected saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      this.isLoading.set(true);
      
      // TODO: Implement API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.toastService.success('Success', 'General settings saved successfully');
      }, 1000);
    }
  }

  protected saveNotificationSettings(): void {
    if (this.notificationForm.valid) {
      this.isLoading.set(true);
      
      // TODO: Implement API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.toastService.success('Success', 'Notification preferences saved successfully');
      }, 1000);
    }
  }

  protected savePrivacySettings(): void {
    if (this.privacyForm.valid) {
      this.isLoading.set(true);
      
      // TODO: Implement API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.toastService.success('Success', 'Privacy settings saved successfully');
      }, 1000);
    }
  }

  protected saveAppearanceSettings(): void {
    if (this.appearanceForm.valid) {
      this.isLoading.set(true);
      
      // TODO: Implement API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.toastService.success('Success', 'Appearance settings saved successfully');
      }, 1000);
    }
  }

  protected exportData(): void {
    Swal.fire({
      title: 'Export Data',
      text: 'This will download all your household data in JSON format.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#108E91',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Export',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement data export
        this.toastService.success('Success', 'Data export started');
      }
    });
  }

  protected deleteAccount(): void {
    Swal.fire({
      title: 'Delete Account',
      text: 'Are you sure you want to delete your account? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff5757',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Require password confirmation
        Swal.fire({
          title: 'Enter Password',
          input: 'password',
          inputLabel: 'Please enter your password to confirm account deletion',
          inputPlaceholder: 'Enter your password',
          showCancelButton: true,
          confirmButtonColor: '#ff5757',
          confirmButtonText: 'Delete Account',
          inputValidator: (value) => {
            if (!value) {
              return 'Password is required';
            }
            return null;
          }
        }).then((passwordResult) => {
          if (passwordResult.isConfirmed) {
            // TODO: Implement account deletion API call
            this.toastService.error('Account Deletion', 'Account deletion feature coming soon');
          }
        });
      }
    });
  }

  protected resetSettings(): void {
    Swal.fire({
      title: 'Reset Settings',
      text: 'This will reset all settings to their default values.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#108E91',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset all forms to defaults
        this.generalForm.reset({
          timezone: 'America/New_York',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD'
        });
        this.notificationForm.reset({
          emailNotifications: true,
          billReminders: true,
          budgetAlerts: true,
          maintenanceReminders: true,
          alertsEmail: true,
          alertsPush: false,
          alertsSMS: false,
          weeklyDigest: true,
          monthlyReport: true
        });
        this.privacyForm.reset({
          profileVisibility: true,
          showEmail: false,
          shareAnalytics: true,
          twoFactorAuth: false
        });
        this.appearanceForm.reset({
          theme: 'light',
          compactMode: false,
          showSidebar: true,
          animations: true
        });
        
        this.toastService.success('Success', 'Settings reset to defaults');
      }
    });
  }
}

