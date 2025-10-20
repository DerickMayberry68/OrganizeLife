import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TextBoxModule, CheckBoxModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Check for backdoor credentials
    const isBackdoorLogin = this.email === 'backdoor@dev.local' && this.password === 'backdoor';
    
    // Use backdoor login for dev credentials, regular login otherwise
    const loginObservable = isBackdoorLogin 
      ? this.authService.backdoorLogin({ email: this.email, password: this.password })
      : this.authService.login({ email: this.email, password: this.password });

    loginObservable.subscribe({
      next: (response) => {
        if (isBackdoorLogin) {
          console.log('🔓 Backdoor login successful - Development mode', response);
        } else {
          console.log('Login successful', response);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = error.error?.message || error.error?.Message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

