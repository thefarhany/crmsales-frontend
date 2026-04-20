import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  Building2Icon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  BriefcaseIcon,
  FileTextIcon,
  CalendarIcon,
  HashIcon,
  Loader2Icon,
  CircleAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientResponse } from '../../../core/models/entity/client.model';
import { Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './client-detail.html',
})
export class ClientDetailComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly Building2Icon = Building2Icon;
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly MapPinIcon = MapPinIcon;
  readonly GlobeIcon = GlobeIcon;
  readonly BriefcaseIcon = BriefcaseIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly HashIcon = HashIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CircleAlertIcon = CircleAlertIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;

  clientId!: number;
  client: ClientResponse | null = null;
  isLoading = true;
  showDeleteModal = false;
  isDeleting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  canModify = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.canModify = role === Role.ADMIN || role === Role.MARKETING_TEAM;

    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClient();
  }

  private loadClient(): void {
    this.isLoading = true;
    this.clientService.getClientById(this.clientId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.client = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Failed to load client data', 'error');
        this.isLoading = false;
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

  editClient(): void {
    this.router.navigate(['/clients', this.clientId, 'edit']);
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  deleteClient(): void {
    this.isDeleting = true;
    this.clientService.deleteClient(this.clientId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.showNotification('Client deleted successfully', 'success');
        setTimeout(() => this.router.navigate(['/clients']), 1500);
      },
      error: () => {
        this.isDeleting = false;
        this.showNotification('Failed to delete client', 'error');
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
