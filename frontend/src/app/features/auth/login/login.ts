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
    console.log('🔵 Login form submitted!');
    console.log('🔵 Email:', this.email);
    console.log('🔵 Password length:', this.password?.length || 0);
    
    if (!this.email || !this.password) {
      console.warn('⚠️ Login form validation failed - missing email or password');
      this.errorMessage = 'Please enter email and password';
      return;
    }

    console.log('🔵 Starting login process...');
    this.isLoading = true;
    this.errorMessage = '';

    // Check for backdoor credentials
    const isBackdoorLogin = this.email === 'backdoor@dev.local' && this.password === 'backdoor';
    
    // Use backdoor login for dev credentials, regular login otherwise
    console.log('🔵 Using', isBackdoorLogin ? 'backdoor' : 'regular', 'login');
    const loginObservable = isBackdoorLogin 
      ? this.authService.backdoorLogin({ email: this.email, password: this.password })
      : this.authService.login({ email: this.email, password: this.password });

    console.log('🔵 Subscribing to login observable...');
    loginObservable.subscribe({
      next: (response) => {
        console.log('✅ Login successful', response);
        this.isLoading = false;
        
        // Verify user was stored
        const verifyUser = localStorage.getItem('butler_user');
        console.log('✅ Login - Verification check - localStorage has user:', verifyUser ? 'YES' : 'NO');
        if (verifyUser) {
          try {
            const parsed = JSON.parse(verifyUser);
            console.log('✅ Login - Stored user:', parsed);
          } catch (e) {
            console.error('❌ Login - Error parsing stored user:', e);
          }
        }
        
        // Navigate after login - use Promise.resolve for better zoneless compatibility
        console.log('Starting navigation process...');
        Promise.resolve().then(async () => {
          console.log('Navigating to dashboard...');
          
          // Quick auth check with timeout
          try {
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const authCheck = Promise.race([
              this.authService.isAuthenticated(),
              new Promise<boolean>((resolve) => {
                timeoutId = setTimeout(() => {
                  console.warn('Auth check timed out after 2s, assuming authenticated');
                  resolve(true); // Assume authenticated if check times out
                }, 2000);
              })
            ]);
            const isAuth = await authCheck;
            if (timeoutId) clearTimeout(timeoutId);
            console.log('Pre-navigation auth check result:', isAuth);
          } catch (error) {
            console.warn('Auth check error:', error);
            // Continue anyway - login was successful
          }
          
          // Navigate to dashboard
          console.log('Attempting router navigation...');
          try {
            await this.router.navigate(['/dashboard']);
            console.log('Router navigation successful!');
          } catch (error) {
            console.error('Router navigation failed:', error);
            // Fallback to window.location
            window.location.href = '/dashboard';
          }
        });
      },
      error: (error) => {
        console.error('Login failed', error);
        this.isLoading = false;
        // Handle different error types
        if (error?.message) {
          this.errorMessage = error.message;
        } else if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (typeof error === 'string') {
          this.errorMessage = error;
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      }
    });
    
    // Safety timeout - reset loading state after 30 seconds
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Login request timed out');
        this.isLoading = false;
        this.errorMessage = 'Login request timed out. Please check your connection and try again.';
      }
    }, 30000);
  }
}

