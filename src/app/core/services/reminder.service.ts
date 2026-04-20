import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import {
  AiReminderResponse,
  ReminderSettingResponse,
  ManualReminderRequest,
  UpdateReminderSettingRequest,
} from '../models/entity/reminder.model';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  private apiUrl = `${environment.apiUrl}/api/reminders`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/reminders — Get all reminders (pageable)
   */
  getAllReminders(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<AiReminderResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<AiReminderResponse>>>(this.apiUrl, { params });
  }

  /**
   * GET /api/reminders/{id} — Get reminder by ID
   */
  getReminderById(id: number): Observable<ApiResponse<AiReminderResponse>> {
    return this.http.get<ApiResponse<AiReminderResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/reminders/pending — Get pending reminders
   */
  getPendingReminders(): Observable<ApiResponse<AiReminderResponse[]>> {
    return this.http.get<ApiResponse<AiReminderResponse[]>>(`${this.apiUrl}/pending`);
  }

  /**
   * POST /api/reminders/send-manual — Send manual reminder
   */
  sendManualReminder(request: ManualReminderRequest): Observable<ApiResponse<AiReminderResponse>> {
    return this.http.post<ApiResponse<AiReminderResponse>>(`${this.apiUrl}/send-manual`, request);
  }

  /**
   * POST /api/reminders/generate-draft — Cuma mikir AI, ga ngirim email
   */
  generateDraftReminder(
    request: ManualReminderRequest,
  ): Observable<ApiResponse<AiReminderResponse>> {
    return this.http.post<ApiResponse<AiReminderResponse>>(
      `${this.apiUrl}/generate-draft`,
      request,
    );
  }

  /**
   * GET /api/reminders/settings — Get all reminder settings
   */
  getSettings(): Observable<ApiResponse<ReminderSettingResponse[]>> {
    return this.http.get<ApiResponse<ReminderSettingResponse[]>>(`${this.apiUrl}/settings`);
  }

  /**
   * PUT /api/reminders/settings — Update reminder settings
   */
  updateSettings(
    requests: UpdateReminderSettingRequest[],
  ): Observable<ApiResponse<ReminderSettingResponse[]>> {
    return this.http.put<ApiResponse<ReminderSettingResponse[]>>(
      `${this.apiUrl}/settings`,
      requests,
    );
  }

  /**
   * GET /api/reminders/history — Get reminder history (SENT)
   */
  getReminderHistory(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<AiReminderResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<AiReminderResponse>>>(`${this.apiUrl}/history`, {
      params,
    });
  }

  /**
   * POST /api/reminders/test — Test reminder system (Admin only)
   */
  testReminderSystem(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/test`, {});
  }
}
