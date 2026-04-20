import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  Loader2Icon,
  CircleAlertIcon,
  ShieldCheckIcon,
  FileTextIcon,
  UserIcon,
  CalendarIcon,
  BuildingIcon,
  LockIcon,
  CheckIcon,
  XIcon,
} from 'lucide-angular';
import { ApprovalService } from '../../../core/services/approval.service';
import { ApprovalFlowResponse, ApprovalStep } from '../../../core/models/entity/approval.model';
import { ApprovalStatus } from '../../../core/models/enums/enums.model';
import { Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-approval-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './approval-workflow.html',
})
export class ApprovalWorkflowComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly ClockIcon = ClockIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly UserIcon = UserIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly BuildingIcon = BuildingIcon;
  readonly LockIcon = LockIcon;
  readonly CheckIcon = CheckIcon;
  readonly XIcon = XIcon;

  contractId!: number;
  flow: ApprovalFlowResponse | null = null;
  isLoading = true;

  showApproveModal = false;
  showRejectModal = false;
  selectedStep: ApprovalStep | null = null;
  selectedApprovalId: number | null = null;
  approveNotes = '';
  rejectReason = '';
  rejectNotes = '';
  isProcessing = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private approvalService: ApprovalService,
  ) {}

  ngOnInit(): void {
    this.contractId = +this.route.snapshot.paramMap.get('contractId')!;
    this.loadWorkflow();
  }

  loadWorkflow(): void {
    this.isLoading = true;
    this.approvalService.getApprovalFlow(this.contractId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.flow = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Failed to load approval workflow', 'error');
        this.isLoading = false;
      },
    });
  }

  openApproveModal(step: ApprovalStep, approvalId: number): void {
    this.selectedStep = step;
    this.selectedApprovalId = approvalId;
    this.approveNotes = '';
    this.showApproveModal = true;
  }

  confirmApprove(): void {
    if (!this.selectedApprovalId) return;
    this.isProcessing = true;
    this.approvalService
      .approveContract(this.selectedApprovalId, {
        notes: this.approveNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showApproveModal = false;
          this.showNotification('Contract approved successfully!', 'success');
          this.loadWorkflow();
        },
        error: (err) => {
          this.isProcessing = false;
          const msg = err?.error?.message || 'Failed to approve';
          this.showNotification(msg, 'error');
        },
      });
  }

  openRejectModal(step: ApprovalStep, approvalId: number): void {
    this.selectedStep = step;
    this.selectedApprovalId = approvalId;
    this.rejectReason = '';
    this.rejectNotes = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedApprovalId || !this.rejectReason.trim()) return;
    this.isProcessing = true;
    this.approvalService
      .rejectContract(this.selectedApprovalId, {
        rejectionReason: this.rejectReason,
        notes: this.rejectNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showRejectModal = false;
          this.showNotification('Contract rejected', 'success');
          this.loadWorkflow();
        },
        error: (err) => {
          this.isProcessing = false;
          const msg = err?.error?.message || 'Failed to reject';
          this.showNotification(msg, 'error');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/approvals']);
  }

  viewContract(): void {
    this.router.navigate(['/contracts', this.contractId]);
  }

  getStepIcon(step: ApprovalStep): any {
    if (step.status === 'APPROVED') return this.CheckCircle2Icon;
    if (step.status === 'REJECTED') return this.XCircleIcon;
    if (step.isCurrentStep) return this.ClockIcon;
    return this.LockIcon;
  }

  getStepIconClass(step: ApprovalStep): string {
    if (step.status === 'APPROVED') return 'text-emerald-600';
    if (step.status === 'REJECTED') return 'text-red-600';
    if (step.isCurrentStep) return 'text-amber-500';
    return 'text-gray-300';
  }

  getStepBorderClass(step: ApprovalStep): string {
    if (step.status === 'APPROVED') return 'border-emerald-200 bg-emerald-50/50';
    if (step.status === 'REJECTED') return 'border-red-200 bg-red-50/50';
    if (step.isCurrentStep) return 'border-amber-200 bg-amber-50/50';
    return 'border-gray-200 bg-gray-50/30';
  }

  getLineClass(step: ApprovalStep): string {
    if (step.status === 'APPROVED') return 'bg-emerald-300';
    if (step.status === 'REJECTED') return 'bg-red-300';
    return 'bg-gray-200';
  }

  getContractStatusConfig(): { label: string; bgClass: string; textClass: string } {
    const status = this.flow?.currentStatus || '';
    const configs: Record<string, any> = {
      DRAFT: { label: 'DRAFT', bgClass: 'bg-gray-100 border-gray-300', textClass: 'text-gray-700' },
      PENDING_APPROVAL: {
        label: 'PENDING APPROVAL',
        bgClass: 'bg-amber-50 border-amber-300',
        textClass: 'text-amber-700',
      },
      ACTIVE: {
        label: 'ACTIVE',
        bgClass: 'bg-emerald-50 border-emerald-300',
        textClass: 'text-emerald-700',
      },
      EXPIRED: { label: 'EXPIRED', bgClass: 'bg-red-50 border-red-300', textClass: 'text-red-700' },
      TERMINATED: {
        label: 'TERMINATED',
        bgClass: 'bg-gray-100 border-gray-400',
        textClass: 'text-gray-600',
      },
    };
    return configs[status] || configs['DRAFT'];
  }

  formatRole(role: Role | string): string {
    const map: Record<string, string> = {
      MARKETING_MANAGER: 'Marketing Manager',
      BOD: 'Board of Directors',
      ADMIN: 'Admin',
      MARKETING_TEAM: 'Marketing Team',
    };
    return map[role] || role;
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
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
