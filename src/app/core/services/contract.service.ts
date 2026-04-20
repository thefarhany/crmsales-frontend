import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import {
  ContractResponse,
  CreateContractRequest,
  UpdateContractRequest,
  BulkContractRequest,
  ContractSearchRequest,
  ContractStatsResponse,
  ContractCalendarResponse,
} from '../models/entity/contract.model';
import { ContractStatus, ContractType } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/api/contracts`;

  constructor(private http: HttpClient) {}

  getAllContracts(
    status?: ContractStatus,
    contractType?: ContractType,
    clientId?: number,
    keyword?: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ContractResponse>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) params = params.set('status', status);
    if (contractType) params = params.set('contractType', contractType);
    if (clientId) params = params.set('clientId', clientId.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<ApiResponse<PageResponse<ContractResponse>>>(this.apiUrl, { params });
  }

  getContractById(id: number): Observable<ApiResponse<ContractResponse>> {
    return this.http.get<ApiResponse<ContractResponse>>(`${this.apiUrl}/${id}`);
  }

  createContract(
    request: CreateContractRequest,
    file?: File,
  ): Observable<ApiResponse<ContractResponse>> {
    const formData = new FormData();

    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('data', jsonBlob);

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<ApiResponse<ContractResponse>>(this.apiUrl, formData);
  }

  updateContract(
    id: number,
    request: UpdateContractRequest,
    file?: File,
  ): Observable<ApiResponse<ContractResponse>> {
    const formData = new FormData();

    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('data', jsonBlob);

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<ApiResponse<ContractResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteContract(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  uploadContractFile(id: number, file: File): Observable<ApiResponse<ContractResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ContractResponse>>(
      `${this.apiUrl}/${id}/upload-file`,
      formData,
    );
  }

  renewContract(id: number): Observable<ApiResponse<ContractResponse>> {
    return this.http.post<ApiResponse<ContractResponse>>(`${this.apiUrl}/${id}/renew`, {});
  }

  getExpiringContracts(
    days: number = 60,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ContractResponse>>> {
    const params = new HttpParams()
      .set('days', days.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ContractResponse>>>(`${this.apiUrl}/expiring`, {
      params,
    });
  }

  getContractCalendar(
    from?: string,
    to?: string,
  ): Observable<ApiResponse<ContractCalendarResponse[]>> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ApiResponse<ContractCalendarResponse[]>>(`${this.apiUrl}/calendar`, {
      params,
    });
  }

  getContractStats(): Observable<ApiResponse<ContractStatsResponse>> {
    return this.http.get<ApiResponse<ContractStatsResponse>>(`${this.apiUrl}/stats`);
  }

  bulkUpdate(request: BulkContractRequest): Observable<ApiResponse<ContractResponse[]>> {
    return this.http.put<ApiResponse<ContractResponse[]>>(`${this.apiUrl}/bulk-update`, request);
  }

  bulkDelete(request: BulkContractRequest): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/bulk-delete`, {
      body: request,
    });
  }

  advancedSearch(
    request: ContractSearchRequest,
  ): Observable<ApiResponse<PageResponse<ContractResponse>>> {
    return this.http.post<ApiResponse<PageResponse<ContractResponse>>>(
      `${this.apiUrl}/search`,
      request,
    );
  }

  exportContracts(
    status?: ContractStatus,
    contractType?: ContractType,
    keyword?: string,
  ): Observable<Blob> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (contractType) params = params.set('contractType', contractType);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
    }) as Observable<Blob>;
  }

  getContractHistory(id: number): Observable<ApiResponse<ContractResponse>> {
    return this.http.get<ApiResponse<ContractResponse>>(`${this.apiUrl}/${id}/history`);
  }
}
