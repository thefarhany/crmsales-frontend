import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  FileTextIcon,
  ClockIcon,
  DollarSignIcon,
  ExternalLinkIcon,
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})
export class ClientDashboardComponent {
  // Lucide Icons
  readonly FileTextIcon = FileTextIcon;
  readonly ClockIcon = ClockIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly ExternalLinkIcon = ExternalLinkIcon;

  constructor(private authService: AuthService) {}

  get userName(): string {
    return this.authService.currentUser()?.fullName || 'Client';
  }

  stats = {
    activeContracts: 3,
    nextRenewal: '12 Oct',
    nextRenewalDays: 'In 7 days',
    totalValue: 'Rp 450M',
  };

  // Welcome banner
  welcomeMessage = {
    contracts: 3,
    pendingRenewal: 1,
  };

  // Active Services table
  activeServices = [
    {
      name: 'Enterprise License Agreement',
      status: 'Active',
      endDate: '01 Jan 2024',
    },
    {
      name: 'Cloud Support Premium',
      status: 'Active',
      endDate: '15 Feb 2024',
    },
  ];

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Expired: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }
}
