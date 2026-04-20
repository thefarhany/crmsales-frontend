import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  UserResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../models/entity/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly API_URL = `${environment.apiUrl}/api/users/me`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(this.API_URL);
  }

  updateMyProfile(request: UpdateProfileRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(this.API_URL, request);
  }

  changeMyPassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/change-password`, request);
  }
}
