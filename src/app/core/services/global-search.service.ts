import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface GlobalSearchResponse {
  id: string;
  title: string;
  subtitle: string;
  type: 'CONTRACT' | 'CLIENT';
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private readonly API_URL = `${environment.apiUrl}/api/search`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<ApiResponse<GlobalSearchResponse[]>> {
    return this.http.get<ApiResponse<GlobalSearchResponse[]>>(`${this.API_URL}?query=${query}`, {
      withCredentials: true
    });
  }
}
