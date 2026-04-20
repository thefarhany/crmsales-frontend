import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  CircleAlertIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  FileTextIcon,
  ChevronDownIcon,
  GitPullRequestArrowIcon,
} from 'lucide-angular';
import { ApprovalService } from '../../../core/services/approval.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApprovalResponse } from '../../../core/models/entity/approval.model';
import { ApprovalStatus } from '../../../core/models/enums/enums.model';
import { Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './approval-list.html',
})
export class ApprovalListComponent implements OnInit {
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly EyeIcon = EyeIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly XCircleIcon = XCircleIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly GitPullRequestArrowIcon = GitPullRequestArrowIcon;

  approvals: ApprovalResponse[] = [];
  isLoading = true;
  searchKeyword = '';
  currentUserRole: Role | null = null;

  selectedStatus: ApprovalStatus | '' = '';
  showFilterDropdown = false;
  statusOptions = Object.values(ApprovalStatus);

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showApproveModal = false;
  showRejectModal = false;
  selectedApproval: ApprovalResponse | null = null;
  approveNotes = '';
  rejectReason = '';
  rejectNotes = '';
  isProcessing = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private approvalService: ApprovalService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getCurrentRole() || null;
    this.loadApprovals();
  }

  loadApprovals(): void {
    this.isLoading = true;

    let approverRole: Role | undefined = undefined;

    if (this.currentUserRole === Role.MARKETING_MANAGER) {
      approverRole = Role.MARKETING_MANAGER;
    } else if (this.currentUserRole === Role.BOD) {
      approverRole = Role.BOD;
    }

    this.approvalService
      .getAllApprovals(
        this.selectedStatus || undefined,
        approverRole,
        this.searchKeyword || undefined,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.handleError('Failed to load approvals'),
      });
  }

  private handleResponse(res: any): void {
    if (res.success && res.data) {
      this.approvals = res.data.content;
      this.totalElements = res.data.totalElements;
      this.totalPages = res.data.totalPages;
    }
    this.isLoading = false;
  }

  private handleError(message: string): void {
    this.showNotification(message, 'error');
    this.isLoading = false;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadApprovals();
  }

  toggleFilter(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.showFilterDropdown = false;
    this.loadApprovals();
  }

  clearFilter(): void {
    this.selectedStatus = '';
    this.applyFilter();
  }

  get hasActiveFilter(): boolean {
    return this.selectedStatus !== '';
  }

  openApproveModal(approval: ApprovalResponse): void {
    this.selectedApproval = approval;
    this.approveNotes = '';
    this.showApproveModal = true;
  }

  confirmApprove(): void {
    if (!this.selectedApproval) return;
    this.isProcessing = true;
    this.approvalService
      .approveContract(this.selectedApproval.id, {
        notes: this.approveNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showApproveModal = false;
          this.showNotification('Contract approved successfully!', 'success');
          this.loadApprovals();
        },
        error: (err) => {
          this.isProcessing = false;
          const msg = err?.error?.message || 'Failed to approve contract';
          this.showNotification(msg, 'error');
        },
      });
  }

  openRejectModal(approval: ApprovalResponse): void {
    this.selectedApproval = approval;
    this.rejectReason = '';
    this.rejectNotes = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedApproval || !this.rejectReason.trim()) return;
    this.isProcessing = true;
    this.approvalService
      .rejectContract(this.selectedApproval.id, {
        rejectionReason: this.rejectReason,
        notes: this.rejectNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showRejectModal = false;
          this.showNotification('Contract rejected', 'success');
          this.loadApprovals();
        },
        error: (err) => {
          this.isProcessing = false;
          const msg = err?.error?.message || 'Failed to reject contract';
          this.showNotification(msg, 'error');
        },
      });
  }

  viewWorkflow(contractId: number): void {
    this.router.navigate(['/approvals/contract', contractId]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadApprovals();
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusConfig(status: ApprovalStatus): {
    label: string;
    dotClass: string;
    bgClass: string;
    textClass: string;
  } {
    const configs: Record<string, any> = {
      PENDING: {
        label: 'PENDING',
        dotClass: 'bg-amber-500',
        bgClass: 'bg-amber-50 border-amber-200',
        textClass: 'text-amber-700',
      },
      APPROVED: {
        label: 'APPROVED',
        dotClass: 'bg-emerald-500',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-700',
      },
      REJECTED: {
        label: 'REJECTED',
        dotClass: 'bg-red-500',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700',
      },
    };
    return configs[status] || configs['PENDING'];
  }

  getLevelLabel(level: number): string {
    return level === 1
      ? 'Marketing Manager'
      : level === 2
        ? 'Board of Directors'
        : `Level ${level}`;
  }

  getRoleBadgeClass(role: Role): string {
    const map: Record<string, string> = {
      MARKETING_MANAGER: 'bg-blue-50 text-blue-700 border-blue-200',
      BOD: 'bg-purple-50 text-purple-700 border-purple-200',
      ADMIN: 'bg-gray-50 text-gray-700 border-gray-200',
      MARKETING_TEAM: 'bg-teal-50 text-teal-700 border-teal-200',
      CLIENT: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return map[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  formatRole(role: Role): string {
    const map: Record<string, string> = {
      MARKETING_MANAGER: 'Marketing Manager',
      BOD: 'Board of Directors',
      ADMIN: 'Admin',
      MARKETING_TEAM: 'Marketing Team',
      CLIENT: 'Client',
    };
    return map[role] || role;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
