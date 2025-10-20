import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  householdName: string;
}

export interface HouseholdMembership {
  householdId: string;
  householdName: string;
  role: string;
  joinedAt: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  households: HouseholdMembership[];
}

export interface RegisterResponse {
  userId: string;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  defaultHouseholdId: string;
  defaultHouseholdName: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  households: HouseholdMembership[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = 'https://localhost:7157/api';
  private readonly TOKEN_KEY = 'butler_access_token';
  private readonly REFRESH_TOKEN_KEY = 'butler_refresh_token';
  private readonly USER_KEY = 'butler_user';
  
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if token is expired on init
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/setup/register`, request)
      .pipe(
        tap(response => {
          // Extract user metadata from token
          const userMetadata = this.extractUserMetadata(response.accessToken);
          
          // Store tokens and user info
          this.storeAuthData(
            response.accessToken, 
            response.refreshToken,
            {
              userId: response.userId,
              email: response.email,
              firstName: userMetadata.firstName,
              lastName: userMetadata.lastName,
              households: [{
                householdId: response.defaultHouseholdId,
                householdName: response.defaultHouseholdName,
                role: 'Admin',
                joinedAt: new Date().toISOString()
              }]
            }
          );
        })
      );
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/setup/login`, request)
      .pipe(
        tap(response => {
          // Extract user metadata from token
          const userMetadata = this.extractUserMetadata(response.accessToken);
          
          // Store tokens and user info
          this.storeAuthData(
            response.accessToken,
            response.refreshToken,
            {
              userId: response.userId,
              email: response.email,
              firstName: userMetadata.firstName,
              lastName: userMetadata.lastName,
              households: response.households
            }
          );
        })
      );
  }

  /**
   * Backdoor login for development - bypasses backend authentication
   * Use credentials: email="backdoor@dev.local" password="backdoor"
   */
  backdoorLogin(request: LoginRequest): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      // Create a mock JWT token (doesn't need to be valid, just parseable)
      const mockToken = this.createMockToken();
      
      const mockResponse: LoginResponse = {
        userId: 'dev-user-id',
        email: request.email,
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 86400, // 24 hours
        refreshToken: 'mock-refresh-token',
        households: [
          {
            householdId: 'dev-household-id',
            householdName: 'Dev Household',
            role: 'Admin',
            joinedAt: new Date().toISOString()
          }
        ]
      };

      // Store the mock auth data
      this.storeAuthData(
        mockResponse.accessToken,
        mockResponse.refreshToken,
        {
          userId: mockResponse.userId,
          email: mockResponse.email,
          firstName: 'Dev',
          lastName: 'User',
          households: mockResponse.households
        }
      );

      // Emit the response and complete
      observer.next(mockResponse);
      observer.complete();
    });
  }

  /**
   * Create a mock JWT token for development purposes
   */
  private createMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    // Token expires in 24 hours
    const expirationTime = Math.floor(Date.now() / 1000) + 86400;
    
    const payload = btoa(JSON.stringify({
      sub: 'dev-user-id',
      email: 'backdoor@dev.local',
      exp: expirationTime,
      user_metadata: {
        first_name: 'Dev',
        last_name: 'User'
      }
    }));
    
    const signature = 'mock-signature';
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Logout and clear storage
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get the access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  /**
   * Get current user
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user's default household ID
   */
  getDefaultHouseholdId(): string | null {
    const user = this.getCurrentUser();
    return user?.households?.[0]?.householdId || null;
  }

  /**
   * Store authentication data
   */
  private storeAuthData(accessToken: string, refreshToken: string, user: CurrentUser): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): CurrentUser | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } catch {
      return true;
    }
  }

  /**
   * Extract user metadata (firstName, lastName) from JWT token
   */
  private extractUserMetadata(token: string): { firstName?: string; lastName?: string } {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userMetadata = payload.user_metadata || {};
      
      return {
        firstName: userMetadata.first_name || undefined,
        lastName: userMetadata.last_name || undefined
      };
    } catch {
      return {};
    }
  }

  /**
   * Get authorization header
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Update current user data in localStorage
   */
  updateCurrentUser(updatedUser: CurrentUser): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  }
}

