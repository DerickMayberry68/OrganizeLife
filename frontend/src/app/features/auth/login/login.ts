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

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
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

