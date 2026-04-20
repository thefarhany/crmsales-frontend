import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  LoaderCircleIcon,
  UserIcon,
} from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse } from '../../../core/models/entity/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetailComponent implements OnInit {
  // Lucide Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly MailIcon = MailIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly ClockIcon = ClockIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;
  readonly LoaderCircleIcon = LoaderCircleIcon;
  readonly UserIcon = UserIcon;

  user = signal<UserResponse | null>(null);
  isLoading = signal(false);
  userId!: number;

  // Delete Modal
  showDeleteModal = signal(false);
  isDeleting = signal(false);

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  private loadUser(): void {
    this.isLoading.set(true);
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load user');
        this.isLoading.set(false);
        this.router.navigate(['/users']);
      },
    });
  }

  confirmDelete(): void {
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  deleteUser(): void {
    this.isDeleting.set(true);
    this.userService.deactivateUser(this.userId).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'User deactivated successfully');
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to deactivate user');
        this.isDeleting.set(false);
      },
    });
  }

  getRoleBadgeClass(role: string | undefined): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-blue-100 text-blue-700 border border-blue-200',
      MARKETING_MANAGER: 'bg-purple-100 text-purple-700 border border-purple-200',
      MARKETING_TEAM: 'bg-green-100 text-green-700 border border-green-200',
      BOD: 'bg-amber-100 text-amber-700 border border-amber-200',
      CLIENT: 'bg-gray-100 text-gray-700 border border-gray-200',
    };
    return classes[role ?? ''] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadgeClass(status: string | undefined): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      INACTIVE: 'bg-red-100 text-red-700',
      LOCKED: 'bg-orange-100 text-orange-700',
    };
    return map[status ?? ''] || 'bg-gray-100 text-gray-700';
  }

  formatRole(role: string | undefined): string {
    return role?.replace(/_/g, ' ') || '-';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
