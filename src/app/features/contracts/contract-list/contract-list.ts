import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  Loader2Icon,
  CircleAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
  XIcon,
  CalendarIcon,
  LockIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RefreshCwIcon,
  BarChart3Icon,
  ClockIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  DollarSignIcon,
} from 'lucide-angular';
import { ContractService } from '../../../core/services/contract.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ContractResponse,
  ContractStatsResponse,
} from '../../../core/models/entity/contract.model';
import { ContractStatus, ContractType, Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './contract-list.html',
})
export class ContractListComponent implements OnInit {
  // Existing Icons
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly DownloadIcon = DownloadIcon;
  readonly PlusIcon = PlusIcon;
  readonly EyeIcon = EyeIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly XIcon = XIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly LockIcon = LockIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly ChevronUpIcon = ChevronUpIcon;

  // New Icons
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly BarChart3Icon = BarChart3Icon;
  readonly ClockIcon = ClockIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly DollarSignIcon = DollarSignIcon;

  contracts: ContractResponse[] = [];
  isLoading = true;
  searchKeyword = '';
  selectedStatus: ContractStatus | '' = '';
  selectedType: ContractType | '' = '';
  showFilterDropdown = false;
  statusOptions = Object.values(ContractStatus);
  typeOptions = Object.values(ContractType);

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showDeleteModal = false;
  contractToDelete: ContractResponse | null = null;
  isDeleting = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  showAdvancedSearch = false;
  isAdvancedMode = false;

  clients: { id: number; companyName: string }[] = [];
  isLoadingClients = false;

  advClientId: number | null = null;
  advStartDateFrom = '';
  advStartDateTo = '';
  advEndDateFrom = '';
  advEndDateTo = '';
  advMinValue: number | null = null;
  advMaxValue: number | null = null;

  canModify = false;

  // NEW: Stats
  stats: ContractStatsResponse | null = null;
  isLoadingStats = false;

  // NEW: Renew
  renewingContractId: number | null = null;

  // NEW: Renew confirm modal
  showRenewModal = false;
  contractToRenew: ContractResponse | null = null;

  constructor(
    private contractService: ContractService,
    private clientService: ClientService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.canModify = role === Role.ADMIN || role === Role.MARKETING_TEAM;

    this.loadStats();
    this.loadContracts();
  }

  // ==================== STATS ====================

  loadStats(): void {
    this.isLoadingStats = true;
    this.contractService.getContractStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
        }
        this.isLoadingStats = false;
      },
      error: () => {
        this.isLoadingStats = false;
      },
    });
  }

  formatStatValue(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ==================== RENEW ====================

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
          this.showNotification(
            `Contract renewed! New contract: ${res.data.contractNumber}`,
            'success',
          );
          this.loadStats();
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

  // ==================== EXISTING METHODS (unchanged) ====================

  loadContracts(): void {
    this.isLoading = true;
    if (this.isAdvancedMode) {
      this.loadAdvancedSearch();
      return;
    }
    this.contractService
      .getAllContracts(
        this.selectedStatus || undefined,
        this.selectedType || undefined,
        undefined,
        this.searchKeyword || undefined,
        this.currentPage,
        this.pageSize,
      )
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
          this.showNotification('Failed to load contracts', 'error');
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadContracts();
  }

  toggleFilter(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.showFilterDropdown = false;
    this.isAdvancedMode = false;
    this.loadContracts();
  }

  clearFilter(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilter();
  }

  get hasActiveFilter(): boolean {
    return this.selectedStatus !== '' || this.selectedType !== '';
  }

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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatContractType(type: ContractType): string {
    const map: Record<ContractType, string> = {
      ANNUAL: 'ANNUAL',
      MONTHLY: 'MONTHLY',
      PROJECT_BASED: 'PROJECT BASED',
      SUBSCRIPTION: 'SUBSCRIPTION',
    };
    return map[type] || type;
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

  getTypeBadgeClass(type: ContractType): string {
    const map: Record<ContractType, string> = {
      ANNUAL: 'bg-blue-50 text-blue-700 border-blue-200',
      MONTHLY: 'bg-purple-50 text-purple-700 border-purple-200',
      PROJECT_BASED: 'bg-orange-50 text-orange-700 border-orange-200',
      SUBSCRIPTION: 'bg-teal-50 text-teal-700 border-teal-200',
    };
    return map[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  viewContract(id: number): void {
    this.router.navigate(['/contracts', id]);
  }

  editContract(id: number): void {
    this.router.navigate(['/contracts', id, 'edit']);
  }

  confirmDelete(contract: ContractResponse): void {
    this.contractToDelete = contract;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.contractToDelete = null;
  }

  deleteContract(): void {
    if (!this.contractToDelete) return;
    this.isDeleting = true;
    this.contractService.deleteContract(this.contractToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.showNotification('Contract deleted successfully', 'success');
        this.loadStats();
        this.loadContracts();
      },
      error: () => {
        this.isDeleting = false;
        this.showNotification('Failed to delete contract', 'error');
      },
    });
  }

  exportContracts(): void {
    this.contractService
      .exportContracts(
        this.selectedStatus || undefined,
        this.selectedType || undefined,
        this.searchKeyword || undefined,
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contracts_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.showNotification('Failed to export contracts', 'error');
        },
      });
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (this.showAdvancedSearch && this.clients.length === 0) {
      this.loadClientsForDropdown();
    }
  }

  private loadClientsForDropdown(): void {
    this.isLoadingClients = true;
    this.clientService.getAllClientsForDropdown().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.clients = res.data.content.map((c: any) => ({
            id: c.id,
            companyName: c.companyName,
          }));
        }
        this.isLoadingClients = false;
      },
      error: () => {
        this.isLoadingClients = false;
      },
    });
  }

  applyAdvancedSearch(): void {
    this.currentPage = 0;
    this.isAdvancedMode = true;
    this.loadContracts();
  }

  private loadAdvancedSearch(): void {
    const request: any = {
      page: this.currentPage,
      size: this.pageSize,
    };
    if (this.searchKeyword) request.keyword = this.searchKeyword;
    if (this.selectedStatus) request.status = this.selectedStatus;
    if (this.selectedType) request.contractType = this.selectedType;
    if (this.advClientId) request.clientId = this.advClientId;
    if (this.advStartDateFrom) request.startDateFrom = this.advStartDateFrom;
    if (this.advStartDateTo) request.startDateTo = this.advStartDateTo;
    if (this.advEndDateFrom) request.endDateFrom = this.advEndDateFrom;
    if (this.advEndDateTo) request.endDateTo = this.advEndDateTo;
    if (this.advMinValue !== null) request.minValue = this.advMinValue;
    if (this.advMaxValue !== null) request.maxValue = this.advMaxValue;

    this.contractService.advancedSearch(request).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contracts = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Failed to search contracts', 'error');
        this.isLoading = false;
      },
    });
  }

  clearAdvancedSearch(): void {
    this.advClientId = null;
    this.advStartDateFrom = '';
    this.advStartDateTo = '';
    this.advEndDateFrom = '';
    this.advEndDateTo = '';
    this.advMinValue = null;
    this.advMaxValue = null;
    this.selectedStatus = '';
    this.selectedType = '';
    this.searchKeyword = '';
    this.isAdvancedMode = false;
    this.currentPage = 0;
    this.loadContracts();
  }

  get hasAdvancedFilter(): boolean {
    return (
      this.advClientId !== null ||
      this.advStartDateFrom !== '' ||
      this.advStartDateTo !== '' ||
      this.advEndDateFrom !== '' ||
      this.advEndDateTo !== '' ||
      this.advMinValue !== null ||
      this.advMaxValue !== null
    );
  }

  get advancedFilterCount(): number {
    let count = 0;
    if (this.selectedStatus) count++;
    if (this.selectedType) count++;
    if (this.advClientId) count++;
    if (this.advStartDateFrom || this.advStartDateTo) count++;
    if (this.advEndDateFrom || this.advEndDateTo) count++;
    if (this.advMinValue !== null || this.advMaxValue !== null) count++;
    return count;
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
