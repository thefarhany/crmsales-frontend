import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { DashboardResponse } from '../models/entity/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/dashboard
   * Fetch all dashboard data in a single call.
   * Backend returns role-specific data based on the authenticated user.
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<ApiResponse<DashboardResponse>>(this.apiUrl).pipe(map((res) => res.data!));
  }
}
