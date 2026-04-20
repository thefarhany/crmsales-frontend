import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  UsersIcon,
  Loader2Icon,
  CircleAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MailIcon,
  UploadIcon,
  FileSpreadsheetIcon,
  XIcon,
  AlertCircleIcon,
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientResponse, ClientImportResult } from '../../../core/models/entity/client.model';
import { ClientStatus, Role } from '../../../core/models/enums/enums.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './client-list.html',
})
export class ClientListComponent implements OnInit {
  readonly SearchIcon = SearchIcon;
  readonly PlusIcon = PlusIcon;
  readonly EyeIcon = EyeIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly DownloadIcon = DownloadIcon;
  readonly UsersIcon = UsersIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly MailIcon = MailIcon;
  readonly UploadIcon = UploadIcon;
  readonly FileSpreadsheetIcon = FileSpreadsheetIcon;
  readonly XIcon = XIcon;
  readonly AlertCircleIcon = AlertCircleIcon;

  clients: ClientResponse[] = [];
  isLoading = true;
  errorMessage = '';
  searchKeyword = '';
  selectedStatus: ClientStatus | null = null;
  statusOptions = Object.values(ClientStatus);

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  private searchSubject = new Subject<string>();

  showDeleteModal = false;
  clientToDelete: ClientResponse | null = null;
  isDeleting = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  showImportModal = false;
  importFile: File | null = null;
  isImporting = false;
  importResult: ClientImportResult | null = null;
  isDragOver = false;

  canModify = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.canModify = role === Role.ADMIN || role === Role.MARKETING_TEAM;

    this.loadClients();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((keyword) => {
      this.searchKeyword = keyword;
      this.currentPage = 0;
      this.loadClients();
    });
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService
      .getAllClients(
        this.selectedStatus ?? undefined,
        this.searchKeyword || undefined,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.clients = res.data.content;
            this.totalElements = res.data.totalElements;
            this.totalPages = res.data.totalPages;
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load clients';
          this.isLoading = false;
        },
      });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilter(status: ClientStatus | null): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadClients();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewClient(id: number): void {
    this.router.navigate(['/clients', id]);
  }

  editClient(id: number): void {
    this.router.navigate(['/clients', id, 'edit']);
  }

  confirmDelete(client: ClientResponse): void {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  deleteClient(): void {
    if (!this.clientToDelete) return;
    this.isDeleting = true;
    this.clientService.deleteClient(this.clientToDelete.id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.clientToDelete = null;
        this.isDeleting = false;
        this.showNotification('Client deleted successfully', 'success');
        this.loadClients();
      },
      error: () => {
        this.isDeleting = false;
        this.showNotification('Failed to delete client', 'error');
      },
    });
  }

  exportClients(): void {
    this.clientService
      .exportClients(this.selectedStatus ?? undefined, this.searchKeyword || undefined)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'clients_export.csv';
          a.click();
          window.URL.revokeObjectURL(url);
          this.showNotification('Clients exported successfully', 'success');
        },
        error: () => {
          this.showNotification('Failed to export clients', 'error');
        },
      });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#F97316',
      '#6366F1',
      '#14B8A6',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  openImportModal(): void {
    this.showImportModal = true;
    this.importFile = null;
    this.importResult = null;
    this.isDragOver = false;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importFile = null;
    this.importResult = null;
    this.isDragOver = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.showNotification('Only CSV files are allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('File size must be less than 5MB', 'error');
      return;
    }
    this.importFile = file;
    this.importResult = null;
  }

  removeFile(): void {
    this.importFile = null;
    this.importResult = null;
  }

  downloadTemplate(): void {
    this.clientService.downloadImportTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'client_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showNotification('Failed to download template', 'error');
      },
    });
  }

  importClients(): void {
    if (!this.importFile) return;
    this.isImporting = true;
    this.importResult = null;
    this.clientService.importClients(this.importFile).subscribe({
      next: (res) => {
        this.isImporting = false;
        if (res.success && res.data) {
          this.importResult = res.data;
          if (res.data.imported > 0) {
            this.loadClients();
          }
        }
      },
      error: () => {
        this.isImporting = false;
        this.showNotification('Failed to import clients', 'error');
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
