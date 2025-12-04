import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AuthService, RegisterResponse } from '../../../services/auth.service';

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
  successMessage = '';
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

    // Reset error and success messages
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    console.log('[RegisterComponent] Submitting registration form');

    this.authService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      householdName: this.householdName
    }).subscribe({
      next: (response: RegisterResponse) => {
        console.log('[RegisterComponent] Registration successful', response);
        
        // Check if email confirmation is required
        if (response.requiresEmailConfirmation) {
          console.log('[RegisterComponent] Email confirmation required');
          this.successMessage = `Registration successful! Please check your email (${response.email}) to confirm your account before signing in.`;
          this.errorMessage = '';
          this.isLoading = false;
          // Clear form after a delay
          setTimeout(() => {
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
            this.firstName = '';
            this.lastName = '';
            this.householdName = '';
            // Navigate to login after showing message
            setTimeout(() => {
              this.router.navigate(['/login'], { 
                queryParams: { 
                  email: response.email,
                  message: 'Please check your email to confirm your account.' 
                } 
              });
            }, 3000);
          }, 2000);
        } else {
          // Normal registration with session - navigate to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        console.error('[RegisterComponent] Registration failed', error);
        
        // Extract error message from various possible formats
        let errorMsg = 'Registration failed. Please try again.';
        
        // Handle different error object structures
        if (error?.message) {
          errorMsg = error.message;
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.error?.Message) {
          errorMsg = error.error.Message;
        } else if (error?.error?.error_description) {
          errorMsg = error.error.error_description;
        } else if (error?.error_description) {
          errorMsg = error.error_description;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        // Handle specific Supabase error codes and messages
        if (error?.code || error?.error?.code) {
          const code = error.code || error.error.code;
          switch (code) {
            case '23505': // Unique constraint violation
            case 'duplicate_email':
              errorMsg = 'This email is already registered. Please sign in instead.';
              break;
            case 'weak_password':
            case 'password_too_short':
              errorMsg = 'Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.';
              break;
            case 'invalid_email':
              errorMsg = 'Invalid email address. Please check and try again.';
              break;
            case 'signup_disabled':
              errorMsg = 'Registration is currently disabled. Please contact support.';
              break;
            case 'email_rate_limit_exceeded':
              errorMsg = 'Too many registration attempts. Please wait a few minutes and try again.';
              break;
            default:
              // Keep the extracted message or use a generic one
              if (errorMsg === 'Registration failed. Please try again.') {
                errorMsg = `Registration failed: ${code}. Please try again.`;
              }
          }
        }
        
        // Handle common error message patterns
        const errorLower = errorMsg.toLowerCase();
        if (errorLower.includes('user already registered') || 
            errorLower.includes('already registered') ||
            errorLower.includes('email already exists') ||
            errorLower.includes('duplicate')) {
          errorMsg = 'This email is already registered. Please sign in instead.';
        } else if (errorLower.includes('password') && 
                   (errorLower.includes('weak') || errorLower.includes('short') || errorLower.includes('invalid'))) {
          errorMsg = 'Password does not meet requirements. Please use a stronger password (at least 8 characters).';
        } else if (errorLower.includes('email') && 
                   (errorLower.includes('invalid') || errorLower.includes('format'))) {
          errorMsg = 'Invalid email address. Please check and try again.';
        } else if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
          errorMsg = 'Network error. Please check your internet connection and try again.';
        } else if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
          errorMsg = 'Too many attempts. Please wait a few minutes and try again.';
        }
        
        // Set error message and reset loading state
        this.errorMessage = errorMsg;
        this.successMessage = '';
        this.isLoading = false;
        
        // Ensure form is re-enabled
        console.log('[RegisterComponent] Error handled, form re-enabled');
      },
      complete: () => {
        // Always ensure loading is false when complete
        this.isLoading = false;
        console.log('[RegisterComponent] Registration observable completed');
      }
    });
  }
}

