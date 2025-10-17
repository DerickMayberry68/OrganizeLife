import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppBarModule,
    DialogModule,
    ButtonModule,
    TextBoxModule,
    CheckBoxModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  @ViewChild('passwordDialog') passwordDialog!: DialogComponent;

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Signals
  protected readonly isLoading = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly user = computed(() => this.authService.getCurrentUser());

  // Form
  protected profileForm: FormGroup;
  protected passwordForm: FormGroup;

  // Computed values
  protected readonly userStats = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return null;

    return {
      memberSince: this.getMemberSince(currentUser),
      householdCount: currentUser.households?.length || 0,
      primaryHousehold: currentUser.households?.[0]?.householdName || 'No household',
      role: currentUser.households?.[0]?.role || 'Member'
    };
  });

  // Dialog settings
  protected readonly passwordDialogButtons = [
    { click: () => this.updatePassword(), buttonModel: { content: 'Update Password', isPrimary: true } },
    { click: () => this.passwordDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email
      });
    }
  }

  private getMemberSince(user: CurrentUser): string {
    if (!user.households || user.households.length === 0) {
      return 'Unknown';
    }
    
    const earliestJoin = user.households.reduce((earliest, household) => {
      const joinDate = new Date(household.joinedAt);
      return joinDate < earliest ? joinDate : earliest;
    }, new Date(user.households[0].joinedAt));

    return earliestJoin.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  protected startEditing(): void {
    this.isEditing.set(true);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.loadUserData(); // Reset form to original values
  }

  protected updateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      
      const formValue = this.profileForm.value;
      const updateData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email
      };

      // TODO: Implement profile update API call
      // For now, simulate success
      setTimeout(() => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.toastService.success('Success', 'Profile updated successfully');
        
        // Update local user data
        const currentUser = this.user();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email
          };
          this.authService.updateCurrentUser(updatedUser);
        }
      }, 1000);
    }
  }

  protected openPasswordDialog(): void {
    this.passwordForm.reset();
    this.passwordDialog.show();
  }

  protected updatePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);
      
      const formValue = this.passwordForm.value;
      
      // TODO: Implement password update API call
      // For now, simulate success
      setTimeout(() => {
        this.isLoading.set(false);
        this.passwordDialog.hide();
        this.toastService.success('Success', 'Password updated successfully');
        this.passwordForm.reset();
      }, 1000);
    }
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Utility methods
  protected getInitials(user: CurrentUser): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  protected getPasswordError(): string {
    const confirmPassword = this.passwordForm.get('confirmPassword');
    if (confirmPassword?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
