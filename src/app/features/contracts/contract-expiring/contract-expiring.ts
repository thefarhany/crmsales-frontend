import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  AlertTriangleIcon,
  Loader2Icon,
  EyeIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-angular';
import { ContractService } from '../../../core/services/contract.service';
import { ContractResponse } from '../../../core/models/entity/contract.model';
import { ContractStatus, Role } from '../../../core/models/enums/enums.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-contract-expiring',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './contract-expiring.html',
})
export class ContractExpiringComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly EyeIcon = EyeIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ClockIcon = ClockIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;

  // Tab
  tabs = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '60 Days', value: 60 },
  ];
  selectedDays = 30;

  // Data
  contracts: ContractResponse[] = [];
  isLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Renew
  renewingContractId: number | null = null;
  showRenewModal = false;
  contractToRenew: ContractResponse | null = null;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  canModify = false;

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.canModify = role === Role.ADMIN || role === Role.MARKETING_TEAM;
    this.loadContracts();
  }

  selectTab(days: number): void {
    this.selectedDays = days;
    this.currentPage = 0;
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;
    this.contractService
      .getExpiringContracts(this.selectedDays, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.contracts = res.data.content;
            this.totalElements = res.data.totalElements;
            this.totalPages = res.data.totalPages;
          }
          this.isLoading = false;
        },
        error: () => {
          this.showNotification('Failed to load expiring contracts', 'error');
          this.isLoading = false;
        },
      });
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadContracts();
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

  // Urgency
  getUrgencyConfig(daysUntilExpiry: number): {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  } {
    if (daysUntilExpiry <= 0) {
      return {
        label: 'Expired',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200',
        dotClass: 'bg-red-500',
      };
    }
    if (daysUntilExpiry <= 7) {
      return {
        label: 'Critical',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200',
        dotClass: 'bg-red-500',
      };
    }
    if (daysUntilExpiry <= 30) {
      return {
        label: 'Warning',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
        dotClass: 'bg-amber-500',
      };
    }
    return {
      label: 'Upcoming',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      dotClass: 'bg-blue-500',
    };
  }

  getRowHighlight(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 0) return 'bg-red-50/40';
    if (daysUntilExpiry <= 7) return 'bg-red-50/30';
    if (daysUntilExpiry <= 30) return 'bg-amber-50/30';
    return '';
  }

  // Status
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Actions
  viewContract(id: number): void {
    this.router.navigate(['/contracts', id]);
  }

  canRenewContract(contract: ContractResponse): boolean {
    return (
      this.canModify &&
      (contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.EXPIRED)
    );
  }

  confirmRenew(contract: ContractResponse): void {
    this.contractToRenew = contract;
    this.showRenewModal = true;
  }

  cancelRenew(): void {
    this.showRenewModal = false;
    this.contractToRenew = null;
  }

  renewContract(): void {
    if (!this.contractToRenew) return;
    const id = this.contractToRenew.id;
    this.renewingContractId = id;
    this.showRenewModal = false;

    this.contractService.renewContract(id).subscribe({
      next: (res) => {
        this.renewingContractId = null;
        if (res.success && res.data) {
          this.showNotification(`Contract renewed! New: ${res.data.contractNumber}`, 'success');
          this.loadContracts();
        }
      },
      error: (err) => {
        this.renewingContractId = null;
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
