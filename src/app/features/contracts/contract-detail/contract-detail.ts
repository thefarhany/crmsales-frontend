import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  FileTextIcon,
  DollarSignIcon,
  CalendarIcon,
  Loader2Icon,
  CircleAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
  FileDownIcon,
  RefreshCwIcon,
  UploadIcon,
  ClockIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  XOctagonIcon,
} from 'lucide-angular';
import { ContractService } from '../../../core/services/contract.service';
import { ApprovalService } from '../../../core/services/approval.service';
import { AuthService } from '../../../core/services/auth.service';
import { ContractResponse } from '../../../core/models/entity/contract.model';
import { ApprovalFlowResponse, ApprovalStep } from '../../../core/models/entity/approval.model';
import { ContractStatus, ApprovalStatus, Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './contract-detail.html',
})
export class ContractDetailComponent implements OnInit {
  // Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly FileTextIcon = FileTextIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly FileDownIcon = FileDownIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly UploadIcon = UploadIcon;
  readonly ClockIcon = ClockIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly UserCheckIcon = UserCheckIcon;
  readonly XOctagonIcon = XOctagonIcon;

  contractId!: number;
  contract: ContractResponse | null = null;
  isLoading = true;

  // Approval Flow
  approvalFlow: ApprovalFlowResponse | null = null;
  isLoadingApproval = false;

  // Upload File
  isUploading = false;
  uploadFileError = '';

  // Delete
  showDeleteModal = false;
  isDeleting = false;

  // Renew
  isRenewing = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  canModify = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private approvalService: ApprovalService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.canModify = role === Role.ADMIN || role === Role.MARKETING_TEAM;

    this.contractId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadContract();
  }

  private loadContract(): void {
    this.isLoading = true;
    this.contractService.getContractById(this.contractId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contract = res.data;
          // Load approval flow jika bukan DRAFT
          if (this.contract.status !== ContractStatus.DRAFT) {
            this.loadApprovalFlow();
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Failed to load contract data', 'error');
        this.isLoading = false;
      },
    });
  }

  // ==================== APPROVAL FLOW ====================

  private loadApprovalFlow(): void {
    this.isLoadingApproval = true;
    this.approvalService.getApprovalFlow(this.contractId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.approvalFlow = res.data;
        }
        this.isLoadingApproval = false;
      },
      error: () => {
        this.isLoadingApproval = false;
      },
    });
  }

  getStepIcon(step: ApprovalStep): string {
    if (step.status === ApprovalStatus.APPROVED) return 'approved';
    if (step.status === ApprovalStatus.REJECTED) return 'rejected';
    if (step.isCurrentStep) return 'current';
    return 'pending';
  }

  getStepLineClass(step: ApprovalStep): string {
    if (step.status === ApprovalStatus.APPROVED) return 'bg-emerald-500';
    if (step.status === ApprovalStatus.REJECTED) return 'bg-red-500';
    return 'bg-gray-200';
  }

  getStepRoleLabel(step: ApprovalStep): string {
    const labels: Record<string, string> = {
      MARKETING_MANAGER: 'Marketing Manager',
      BOD: 'Board of Directors',
      ADMIN: 'Administrator',
    };
    return labels[step.approverRole] || step.approverRole;
  }

  getStepStatusBadge(step: ApprovalStep): { label: string; bgClass: string; textClass: string } {
    const configs: Record<string, { label: string; bgClass: string; textClass: string }> = {
      APPROVED: {
        label: 'Approved',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-700',
      },
      REJECTED: {
        label: 'Rejected',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700',
      },
      PENDING: {
        label: 'Pending',
        bgClass: 'bg-amber-50 border-amber-200',
        textClass: 'text-amber-700',
      },
    };
    return configs[step.status] || configs['PENDING'];
  }

  // ==================== EXPIRY WARNING ====================

  getExpiryWarning(): {
    show: boolean;
    message: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  } {
    if (!this.contract || !this.contract.isExpiringSoon) {
      return { show: false, message: '', bgClass: '', textClass: '', borderClass: '' };
    }

    const days = this.contract.daysUntilExpiry;

    if (days <= 0) {
      return {
        show: true,
        message: 'This contract has expired!',
        bgClass: 'bg-red-50',
        textClass: 'text-red-800',
        borderClass: 'border-red-200',
      };
    }
    if (days <= 7) {
      return {
        show: true,
        message: `This contract expires in ${days} day${days > 1 ? 's' : ''}! Immediate action required.`,
        bgClass: 'bg-red-50',
        textClass: 'text-red-800',
        borderClass: 'border-red-200',
      };
    }
    if (days <= 30) {
      return {
        show: true,
        message: `This contract expires in ${days} days. Consider renewal soon.`,
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200',
      };
    }
    return {
      show: true,
      message: `This contract expires in ${days} days.`,
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-800',
      borderClass: 'border-blue-200',
    };
  }

  // ==================== FILE UPLOAD ====================

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploadFileError = '';

    if (file.type !== 'application/pdf') {
      this.uploadFileError = 'Only PDF files are allowed';
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadFileError = 'File size must not exceed 10MB';
      input.value = '';
      return;
    }

    this.isUploading = true;
    this.contractService.uploadContractFile(this.contractId, file).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success && res.data) {
          this.contract = res.data;
          this.showNotification('File uploaded successfully!', 'success');
        }
        input.value = '';
      },
      error: (err) => {
        this.isUploading = false;
        const msg = err.error?.message || 'Failed to upload file';
        this.showNotification(msg, 'error');
        input.value = '';
      },
    });
  }

  // ==================== EXISTING METHODS (unchanged) ====================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatEnumLabel(value: string): string {
    return value ? value.replace(/_/g, ' ') : '-';
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusConfig(status: ContractStatus): {
    label: string;
    dotClass: string;
    bgClass: string;
    textClass: string;
  } {
    const configs: Record<
      string,
      { label: string; dotClass: string; bgClass: string; textClass: string }
    > = {
      ACTIVE: {
        label: 'ACTIVE',
        dotClass: 'bg-emerald-500',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-700',
      },
      PENDING_APPROVAL: {
        label: 'PENDING APPROVAL',
        dotClass: 'bg-amber-500',
        bgClass: 'bg-amber-50 border-amber-200',
        textClass: 'text-amber-700',
      },
      EXPIRED: {
        label: 'EXPIRED',
        dotClass: 'bg-red-500',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700',
      },
      DRAFT: {
        label: 'DRAFT',
        dotClass: 'bg-gray-400',
        bgClass: 'bg-gray-50 border-gray-200',
        textClass: 'text-gray-600',
      },
      TERMINATED: {
        label: 'TERMINATED',
        dotClass: 'bg-blue-500',
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-700',
      },
    };
    return configs[status] || configs['DRAFT'];
  }

  getFileName(url: string): string {
    return url.split('/').pop() || 'contract.pdf';
  }

  getFileFullUrl(url: string): string {
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl}${url}`;
  }

  canRenew(): boolean {
    if (!this.contract) return false;
    return this.contract.status === 'ACTIVE' || this.contract.status === 'EXPIRED';
  }

  editContract(): void {
    this.router.navigate(['/contracts', this.contractId, 'edit']);
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  deleteContract(): void {
    this.isDeleting = true;
    this.contractService.deleteContract(this.contractId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.showNotification('Contract deleted successfully', 'success');
        setTimeout(() => this.router.navigate(['/contracts']), 1500);
      },
      error: () => {
        this.isDeleting = false;
        this.showNotification('Failed to delete contract', 'error');
      },
    });
  }

  renewContract(): void {
    this.isRenewing = true;
    this.contractService.renewContract(this.contractId).subscribe({
      next: (res) => {
        this.isRenewing = false;
        if (res.success && res.data) {
          this.showNotification('Contract renewed successfully!', 'success');
          setTimeout(() => this.router.navigate(['/contracts', res.data!.id]), 1500);
        }
      },
      error: (err) => {
        this.isRenewing = false;
        const msg = err.error?.message || 'Failed to renew contract';
        this.showNotification(msg, 'error');
      },
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
