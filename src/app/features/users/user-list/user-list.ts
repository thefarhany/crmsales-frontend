import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  AlertTriangleIcon,
  LoaderCircleIcon,
} from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse } from '../../../core/models/entity/user.model';
import { Role, UserStatus } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent implements OnInit {
  // Lucide Icons
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly PlusIcon = PlusIcon;
  readonly EyeIcon = EyeIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly UsersIcon = UsersIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly XIcon = XIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;
  readonly LoaderCircleIcon = LoaderCircleIcon;

  users = signal<UserResponse[]>([]);
  isLoading = signal(false);

  // Filters
  searchKeyword = '';
  selectedRole: Role | '' = '';
  selectedStatus: UserStatus | '' = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Delete Modal
  showDeleteModal = signal(false);
  userToDelete = signal<UserResponse | null>(null);
  isDeleting = signal(false);

  // Filter dropdown
  showFilterDropdown = signal(false);

  roles = Object.values(Role);
  statuses = Object.values(UserStatus);

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService
      .getAllUsers(
        this.selectedRole || undefined,
        this.selectedStatus || undefined,
        this.searchKeyword || undefined,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.users.set(response.data.content);
            this.totalElements = response.data.totalElements;
            this.totalPages = response.data.totalPages;
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load users');
          this.isLoading.set(false);
        },
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadUsers();
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown.set(!this.showFilterDropdown());
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
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

  viewUser(id: number): void {
    this.router.navigate(['/users', id]);
  }

  editUser(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  confirmDelete(user: UserResponse): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  deleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.userService.deactivateUser(user.id).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'User deactivated successfully');
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
        this.isDeleting.set(false);
        this.loadUsers();
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to deactivate user');
        this.isDeleting.set(false);
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-blue-100 text-blue-700 border border-blue-200',
      MARKETING_MANAGER: 'bg-purple-100 text-purple-700 border border-purple-200',
      MARKETING_TEAM: 'bg-green-100 text-green-700 border border-green-200',
      BOD: 'bg-amber-100 text-amber-700 border border-amber-200',
      CLIENT: 'bg-gray-100 text-gray-700 border border-gray-200',
    };
    return classes[role] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ');
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
