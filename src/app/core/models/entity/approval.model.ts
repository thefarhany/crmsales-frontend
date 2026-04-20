import { Role } from '../enums/enums.model';
import { ApprovalStatus } from '../enums/enums.model';

export interface ApprovalResponse {
  id: number;
  approvalLevel: number;
  approverRole: Role;
  status: ApprovalStatus;
  rejectionReason: string | null;
  notes: string | null;
  requestedAt: string;
  respondedAt: string | null;
  createdAt: string;
  actionable: boolean;
  contract: ApprovalContractInfo;
  requestedBy: ApprovalUserInfo;
  approver: ApprovalUserInfo | null;
}

export interface ApprovalContractInfo {
  id: number;
  contractNumber: string;
  contractTitle: string;
  companyName: string;
  clientName: string;
}

export interface ApprovalUserInfo {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface ApprovalFlowResponse {
  contractId: number;
  contractNumber: string;
  contractTitle: string;
  currentStatus: string;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  approvalId: number;
  level: number;
  approverRole: Role;
  approverName: string | null;
  status: ApprovalStatus;
  notes: string | null;
  rejectionReason: string | null;
  requestedAt: string;
  respondedAt: string | null;
  isCurrentStep: boolean;
}

export interface ApprovalActionRequest {
  notes?: string;
  rejectionReason?: string;
}
