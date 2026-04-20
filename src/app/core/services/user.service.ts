import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  AdminResetPasswordRequest,
} from '../models/entity/user.model';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import { Role, UserStatus } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users dengan filter dan pagination
   * Backend: GET /api/users?role=&status=&keyword=&page=&size=
   */
  getAllUsers(
    role?: Role,
    status?: UserStatus,
    keyword?: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<UserResponse>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get<ApiResponse<PageResponse<UserResponse>>>(this.API_URL, {
      params,
      withCredentials: true,
    });
  }

  /**
   * Get user by ID
   * Backend: GET /api/users/{id}
   */
  getUserById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API_URL}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Create new user (ADMIN only)
   * Backend: POST /api/users
   */
  createUser(request: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(this.API_URL, request, {
      withCredentials: true,
    });
  }

  /**
   * Update user (ADMIN only)
   * Backend: PUT /api/users/{id}
   */
  updateUser(id: number, request: UpdateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.API_URL}/${id}`, request, {
      withCredentials: true,
    });
  }

  /**
   * Deactivate user (ADMIN only)
   * Backend: DELETE /api/users/{id}
   */
  deactivateUser(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  /**
   * Get current logged-in user
   * Backend: GET /api/users/me
   */
  getCurrentUser(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API_URL}/me`, {
      withCredentials: true,
    });
  }

  /**
   * Update own profile
   * Backend: PUT /api/users/me
   */
  updateProfile(request: UpdateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.API_URL}/me`, request, {
      withCredentials: true,
    });
  }

  // PUT /api/users/{id}/reset-password
  adminResetPassword(
    id: number,
    request: AdminResetPasswordRequest,
  ): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/${id}/reset-password`, request);
  }

  /**
   * Get users by role (untuk dropdown)
   * Backend: GET /api/users/by-role/{role}
   */
  getUsersByRole(role: Role): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.API_URL}/by-role/${role}`, {
      withCredentials: true,
    });
  }

  /**
   * Assign role to user (ADMIN only)
   * Backend: PUT /api/users/{id}/assign-role?role=
   */
  assignRole(id: number, role: Role): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.API_URL}/${id}/assign-role`, null, {
      params: { role },
      withCredentials: true,
    });
  }
}
