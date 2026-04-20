import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import {
  DownloadReportRequest,
  ReportLogResponse,
  ReportSummaryResponse,
} from '../models/entity/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl = `${environment.apiUrl}/api/reports`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResponse<ReportSummaryResponse>> {
    return this.http.get<ApiResponse<ReportSummaryResponse>>(`${this.baseUrl}/summary`);
  }

  getRecentReports(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ReportLogResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ReportLogResponse>>>(`${this.baseUrl}/recent`, {
      params,
    });
  }

  downloadReport(request: DownloadReportRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/download`, request, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
