import { ContractStatus, ContractType, RenewalPeriod } from '../enums/enums.model';

export interface ClientInfo {
  id: number;
  clientName: string;
  companyName: string;
  email: string;
  picName: string;
  picEmail: string;
}

export interface CreatorInfo {
  id: number;
  fullName: string;
  email: string;
}

export interface ContractResponse {
  id: number;
  contractNumber: string;
  contractTitle: string;
  contractType: ContractType;
  contractValue: number;
  startDate: string;
  endDate: string;
  renewalPeriod: RenewalPeriod;
  autoRenewal: boolean;
  status: ContractStatus;
  contractFileUrl: string | null;
  description: string | null;
  client: ClientInfo;
  createdBy: CreatorInfo;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  clientId: number;
  contractTitle: string;
  contractType: ContractType;
  contractValue: number;
  startDate: string;
  endDate: string;
  renewalPeriod?: RenewalPeriod;
  autoRenewal?: boolean;
  description?: string;
}

export interface UpdateContractRequest {
  clientId?: number;
  contractTitle?: string;
  contractType?: ContractType;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  renewalPeriod?: RenewalPeriod;
  autoRenewal?: boolean;
  status?: ContractStatus;
  description?: string;
}

export interface BulkContractRequest {
  contractIds: number[];
  status?: ContractStatus;
}

export interface ContractSearchRequest {
  keyword?: string;
  clientId?: number;
  status?: ContractStatus;
  contractType?: ContractType;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minValue?: number;
  maxValue?: number;
  page: number;
  size: number;
}

export interface ContractStatsResponse {
  totalContracts: number;
  activeContracts: number;
  draftContracts: number;
  expiredContracts: number;
  pendingApprovalContracts: number;
  terminatedContracts: number;
  expiringSoon60Days: number;
  expiringSoon30Days: number;
  expiringSoon7Days: number;
  totalContractValue: number;
  activeContractValue: number;
}

export interface ContractCalendarResponse {
  id: number;
  contractNumber: string;
  contractTitle: string;
  clientName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  daysUntilExpiry: number;
}
