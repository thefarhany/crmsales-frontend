import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../models/entity/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { Role } from '../models/enums/enums.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  currentUser = signal<LoginResponse | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Login user
   * Backend endpoint: POST /api/auth/login
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<
        ApiResponse<LoginResponse>
      >(`${this.API_URL}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data);
            this.toast.success(response.message || 'Login successful');
            this.redirectToDashboard(response.data.role);
          }
        }),
        catchError((error) => {
          this.toast.error(error.error?.message || 'Login failed');
          return throwError(() => error);
        }),
      );
  }

  /**
   * Logout user
   * Backend endpoint: POST /api/auth/logout
   */
  logout(): Observable<ApiResponse<null>> {
    return this.http
      .post<ApiResponse<null>>(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.clearAuth();
          this.toast.success(response.message || 'Logout successful');
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          this.clearAuth();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Forgot password - kirim reset token ke email
   * Backend endpoint: POST /api/auth/forgot-password
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/forgot-password`, request).pipe(
      tap((response) => {
        this.toast.success(response.message || 'Reset link sent to your email');
      }),
      catchError((error) => {
        this.toast.error(error.error?.message || 'Failed to send reset link');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Reset password dengan token
   * Backend endpoint: POST /api/auth/reset-password
   */
  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/reset-password`, request).pipe(
      tap((response) => {
        this.toast.success(response.message || 'Password reset successful');
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        this.toast.error(error.error?.message || 'Failed to reset password');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Validate reset token
   * Backend endpoint: GET /api/auth/validate-reset-token
   */
  validateResetToken(token: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/validate-reset-token`, {
      params: { token },
    });
  }

  /**
   * Refresh JWT token
   * Backend endpoint: POST /api/auth/refresh-token
   */
  refreshToken(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.API_URL}/refresh-token`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * Set current user dan simpan ke localStorage
   */
  private setCurrentUser(user: LoginResponse): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Load user dari localStorage (saat app reload)
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('currentUser');
  }

  /**
   * Redirect to dashboard based on user role
   */
  private redirectToDashboard(role: Role): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: Role): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: Role[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get current user role
   */
  getCurrentRole(): Role | undefined {
    return this.currentUser()?.role;
  }
}
