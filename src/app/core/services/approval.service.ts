import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import {
  ApprovalResponse,
  ApprovalFlowResponse,
  ApprovalActionRequest,
} from '../models/entity/approval.model';
import { ApprovalStatus } from '../models/enums/enums.model';
import { Role } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private apiUrl = `${environment.apiUrl}/api/approvals`;
  private contractApiUrl = `${environment.apiUrl}/api/contracts`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/approvals — Get all approvals dengan filter
   */
  getAllApprovals(
    status?: ApprovalStatus,
    approverRole?: Role,
    keyword?: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ApprovalResponse>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (status) params = params.set('status', status);
    if (approverRole) params = params.set('approverRole', approverRole);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get<ApiResponse<PageResponse<ApprovalResponse>>>(this.apiUrl, { params });
  }

  /**
   * GET /api/approvals/{id} — Get approval by ID
   */
  getApprovalById(id: number): Observable<ApiResponse<ApprovalResponse>> {
    return this.http.get<ApiResponse<ApprovalResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * PUT /api/approvals/{id}/approve — Approve contract
   */
  approveContract(
    id: number,
    request?: ApprovalActionRequest,
  ): Observable<ApiResponse<ApprovalResponse>> {
    return this.http.put<ApiResponse<ApprovalResponse>>(
      `${this.apiUrl}/${id}/approve`,
      request || {},
    );
  }

  /**
   * PUT /api/approvals/{id}/reject — Reject contract
   */
  rejectContract(
    id: number,
    request: ApprovalActionRequest,
  ): Observable<ApiResponse<ApprovalResponse>> {
    return this.http.put<ApiResponse<ApprovalResponse>>(`${this.apiUrl}/${id}/reject`, request);
  }

  /**
   * GET /api/approvals/pending — Get pending approvals
   */
  getPendingApprovals(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ApprovalResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<ApprovalResponse>>>(`${this.apiUrl}/pending`, {
      params,
    });
  }

  /**
   * GET /api/approvals/history — Get approval history
   */
  getApprovalHistory(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ApprovalResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<ApprovalResponse>>>(`${this.apiUrl}/history`, {
      params,
    });
  }

  /**
   * GET /api/approvals/my-approvals — Get my approvals
   */
  getMyApprovals(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ApprovalResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<ApprovalResponse>>>(
      `${this.apiUrl}/my-approvals`,
      { params },
    );
  }

  /**
   * POST /api/contracts/{id}/request-approval — Request approval
   */
  requestApproval(contractId: number): Observable<ApiResponse<ApprovalFlowResponse>> {
    return this.http.post<ApiResponse<ApprovalFlowResponse>>(
      `${this.contractApiUrl}/${contractId}/request-approval`,
      {},
    );
  }

  /**
   * GET /api/contracts/{id}/approval-flow — Get approval flow
   */
  getApprovalFlow(contractId: number): Observable<ApiResponse<ApprovalFlowResponse>> {
    return this.http.get<ApiResponse<ApprovalFlowResponse>>(
      `${this.contractApiUrl}/${contractId}/approval-flow`,
    );
  }
}
