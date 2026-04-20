import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  FileTextIcon,
  ClipboardListIcon,
  DollarSignIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from 'lucide-angular';
import { DashboardResponse } from '../../../core/models/entity/dashboard.model';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './team-dashboard.html',
  styleUrl: './team-dashboard.css',
})
export class TeamDashboardComponent implements OnInit {
  @Input({ required: true }) data!: DashboardResponse;

  readonly FileTextIcon = FileTextIcon;
  readonly ClipboardListIcon = ClipboardListIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly ClockIcon = ClockIcon;
  readonly PlusIcon = PlusIcon;
  readonly UsersIcon = UsersIcon;

  stats = {
    myContracts: 0,
    pendingDrafts: 0,
    thisMonthSales: '',
    salesTarget: '',
    reminders: 0,
    reminderNote: '',
  };

  salesData: { month: string; value: number }[] = [];

  quickActions = [
    {
      title: 'Create New Contract',
      description: 'Start a blank draft',
      route: '/contracts/create',
      iconRef: 'fileText' as const,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Add New Client',
      description: 'Register prospect',
      route: '/clients/create',
      iconRef: 'users' as const,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  ngOnInit(): void {
    this.stats = {
      myContracts: this.data.myContracts,
      pendingDrafts: this.data.myDraftContracts,
      thisMonthSales: this.formatCurrency(this.data.myMonthSales),
      salesTarget: `${this.data.myContracts} contracts`,
      reminders: this.data.expiringSoon7Days,
      reminderNote: this.data.expiringSoon7Days > 0 ? 'Expiring this week' : 'No urgent items',
    };

    this.salesData = this.data.monthlyRevenue.map((m) => ({
      month: this.formatMonth(m.month),
      value: m.value,
    }));
  }

  private formatMonth(monthStr: string): string {
    const parts = monthStr.split('-');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[parseInt(parts[1], 10) - 1] || monthStr;
  }

  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(1)}K`;
    }
    return `Rp ${value}`;
  }

  get maxSalesValue(): number {
    const max = Math.max(...this.salesData.map((d) => d.value));
    return max > 0 ? max : 1;
  }

  getBarHeight(value: number): number {
    return (value / this.maxSalesValue) * 100;
  }
}
