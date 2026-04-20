import { ClientStatus } from '../enums/enums.model';

export interface ClientResponse {
  id: number;
  clientName: string;
  companyName: string;
  email: string;
  phone: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  country: string;
  picName: string;
  picEmail: string;
  picPhone: string | null;
  picPosition: string | null;
  status: ClientStatus;
  notes: string | null;
  totalContracts: number;
  activeContracts: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  clientName: string;
  companyName: string;
  email: string;
  phone?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  picName: string;
  picEmail: string;
  picPhone?: string;
  picPosition?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  picName?: string;
  picEmail?: string;
  picPhone?: string;
  picPosition?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface ClientImportResult {
  imported: number;
  failed: number;
  errors: string[];
}
