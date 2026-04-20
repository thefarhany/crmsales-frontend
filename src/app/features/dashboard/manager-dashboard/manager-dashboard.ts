import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  TrendingUpIcon,
} from 'lucide-angular';
import { DashboardResponse } from '../../../core/models/entity/dashboard.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css',
})
export class ManagerDashboardComponent implements OnInit {
  @Input({ required: true }) data!: DashboardResponse;

  readonly DollarSignIcon = DollarSignIcon;
  readonly ClockIcon = ClockIcon;
  readonly UsersIcon = UsersIcon;
  readonly TrendingUpIcon = TrendingUpIcon;

  stats = {
    teamSales: '',
    salesGrowth: '',
    pendingApproval: 0,
    pendingNote: '',
    teamMembers: 0,
    conversionRate: '',
  };

  performanceData: { month: string; actual: number; target: number }[] = [];

  contractStatusData: { status: string; value: number; color: string }[] = [];

  private statusColors: Record<string, string> = {
    ACTIVE: '#10B981',
    PENDING_APPROVAL: '#F59E0B',
    DRAFT: '#9CA3AF',
    EXPIRED: '#EF4444',
    TERMINATED: '#6B7280',
  };

  private statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    PENDING_APPROVAL: 'Pending',
    DRAFT: 'Draft',
    EXPIRED: 'Expired',
    TERMINATED: 'Terminated',
  };

  ngOnInit(): void {
    const convRate =
      this.data.totalContracts > 0
        ? Math.round((this.data.activeContracts / this.data.totalContracts) * 100)
        : 0;

    this.stats = {
      teamSales: this.formatCurrency(this.data.activeContractValue),
      salesGrowth: `${this.data.activeContracts} active contracts`,
      pendingApproval: this.data.pendingApprovals,
      pendingNote: this.data.pendingApprovals > 0 ? 'Needs review' : 'All clear',
      teamMembers: this.data.teamMemberCount,
      conversionRate: `${convRate}%`,
    };

    const avgValue =
      this.data.monthlyRevenue.length > 0
        ? this.data.monthlyRevenue.reduce((sum, m) => sum + m.value, 0) /
          this.data.monthlyRevenue.length
        : 0;

    this.performanceData = this.data.monthlyRevenue.map((m) => ({
      month: this.formatMonth(m.month),
      actual: m.value,
      target: Math.round(avgValue),
    }));

    this.contractStatusData = this.data.contractStatusDistribution.map((s) => ({
      status: this.statusLabels[s.status] || s.status,
      value: s.count,
      color: this.statusColors[s.status] || '#6B7280',
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

  get maxPerformanceValue(): number {
    const max = Math.max(...this.performanceData.flatMap((d) => [d.actual, d.target]));
    return max > 0 ? max : 1;
  }

  getBarHeight(value: number): number {
    return (value / this.maxPerformanceValue) * 100;
  }

  get totalContracts(): number {
    return this.contractStatusData.reduce((sum, d) => sum + d.value, 0) || 1;
  }

  getDonutSegments(): {
    offset: number;
    length: number;
    gap: number;
    color: string;
  }[] {
    const circumference = 2 * Math.PI * 70;
    let accumulated = 0;
    const total = this.totalContracts;
    return this.contractStatusData.map((d) => {
      const percent = d.value / total;
      const length = percent * circumference;
      const gap = circumference - length;
      const offset = -(accumulated / total) * circumference + circumference * 0.25;
      accumulated += d.value;
      return { offset, length, gap, color: d.color };
    });
  }
}
