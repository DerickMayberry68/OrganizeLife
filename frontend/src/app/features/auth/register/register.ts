import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TextBoxModule, CheckBoxModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  householdName = '';
  isLoading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  onSubmit(): void {
    // Validation
    if (!this.email || !this.password || !this.firstName || !this.lastName || !this.householdName) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      householdName: this.householdName
    }).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error.error?.message || error.error?.Message || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

