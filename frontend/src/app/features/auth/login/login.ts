// src/app/features/auth/login/login.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';  // ← Add this import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TextBoxModule,
    CheckBoxModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = { email: this.email, password: this.password };

    try {
      // Old: await this.auth.login(request).toPromise();
      // New: 
      await firstValueFrom(this.auth.login(request));  // ← Just this change!

      console.log('Login successful! Redirecting...');
      await this.router.navigate(['/dashboard']);

    } catch (err: any) {
      console.error('Login failed:', err);
      this.errorMessage = err?.message || 'Invalid email or password';
    } finally {
      this.isLoading = false;
    }
  }
}