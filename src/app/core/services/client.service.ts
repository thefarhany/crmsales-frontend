import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import {
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientImportResult,
} from '../models/entity/client.model';
import { ClientStatus } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) {}

  getAllClients(
    status?: ClientStatus,
    keyword?: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<ClientResponse>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (status) params = params.set('status', status);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get<ApiResponse<PageResponse<ClientResponse>>>(this.apiUrl, { params });
  }

  getClientById(id: number): Observable<ApiResponse<ClientResponse>> {
    return this.http.get<ApiResponse<ClientResponse>>(`${this.apiUrl}/${id}`);
  }

  getAllClientsForDropdown(
    page: number = 0,
    size: number = 1000,
  ): Observable<ApiResponse<PageResponse<ClientResponse>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ClientResponse>>>(this.apiUrl, { params });
  }

  createClient(request: CreateClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.post<ApiResponse<ClientResponse>>(this.apiUrl, request);
  }

  updateClient(id: number, request: UpdateClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.put<ApiResponse<ClientResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteClient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  importClients(file: File): Observable<ApiResponse<ClientImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ClientImportResult>>(`${this.apiUrl}/import`, formData);
  }

  exportClients(status?: ClientStatus, keyword?: string): Observable<Blob> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }

  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/import-template`, {
      responseType: 'blob',
    });
  }

  getActiveClients(): Observable<ApiResponse<ClientResponse[]>> {
    return this.http.get<ApiResponse<ClientResponse[]>>(`${this.apiUrl}/active`);
  }

  getClientContracts(
    clientId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<any>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<any>>>(`${this.apiUrl}/${clientId}/contracts`, {
      params,
    });
  }
}
