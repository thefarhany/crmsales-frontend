import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  UsersIcon,
  ActivityIcon,
  ShieldIcon,
  FileTextIcon,
} from 'lucide-angular';
import { DashboardResponse } from '../../../core/models/entity/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  @Input({ required: true }) data!: DashboardResponse;

  readonly UsersIcon = UsersIcon;
  readonly ActivityIcon = ActivityIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly FileTextIcon = FileTextIcon;

  stats = {
    totalUsers: 0,
    userGrowth: '',
    pendingApprovals: 0,
    pendingNote: '',
    totalClients: 0,
    activeClients: 0,
    activeContracts: 0,
    totalContracts: 0,
  };

  systemActivityData: { month: string; value: number }[] = [];
  userRolesData: { role: string; value: number; color: string }[] = [];

  private roleColors: Record<string, string> = {
    ADMIN: '#F59E0B',
    MARKETING_MANAGER: '#8B5CF6',
    MARKETING_TEAM: '#EF4444',
    BOD: '#6B7280',
    CLIENT: '#10B981',
  };

  private roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    MARKETING_MANAGER: 'Marketing Manager',
    MARKETING_TEAM: 'Marketing Team',
    BOD: 'BOD',
    CLIENT: 'Client',
  };

  ngOnInit(): void {
    this.stats = {
      totalUsers: this.data.totalUsers,
      userGrowth: `${this.data.activeUsers} active`,
      pendingApprovals: this.data.pendingApprovals,
      pendingNote: this.data.pendingApprovals > 0 ? 'Needs review' : 'All clear',
      totalClients: this.data.totalClients,
      activeClients: this.data.activeClients,
      activeContracts: this.data.activeContracts,
      totalContracts: this.data.totalContracts,
    };

    this.systemActivityData = this.data.monthlyRevenue.map((m) => ({
      month: this.formatMonth(m.month),
      value: m.count > 0 ? m.count : 0,
    }));

    this.userRolesData = this.data.userRolesDistribution.map((r) => ({
      role: this.roleLabels[r.role] || r.role,
      value: r.count,
      color: this.roleColors[r.role] || '#6B7280',
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

  private readonly chartWidth = 500;
  private readonly chartHeight = 200;
  private readonly chartPadding = 20;

  get maxActivityValue(): number {
    const max = Math.max(...this.systemActivityData.map((d) => d.value));
    return max > 0 ? max : 1;
  }

  get linePath(): string {
    if (this.systemActivityData.length === 0) return '';
    const points = this.getChartPoints();
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }

  get areaPath(): string {
    if (this.systemActivityData.length === 0) return '';
    const points = this.getChartPoints();
    const bottom = this.chartHeight - this.chartPadding;
    return (
      `M${points[0].x},${bottom} ` +
      points.map((p) => `L${p.x},${p.y}`).join(' ') +
      ` L${points[points.length - 1].x},${bottom} Z`
    );
  }

  private getChartPoints(): { x: number; y: number }[] {
    const usableWidth = this.chartWidth - this.chartPadding * 2;
    const usableHeight = this.chartHeight - this.chartPadding * 2;
    const len = this.systemActivityData.length;
    return this.systemActivityData.map((d, i) => ({
      x: this.chartPadding + (len > 1 ? (i / (len - 1)) * usableWidth : usableWidth / 2),
      y: this.chartPadding + (1 - d.value / this.maxActivityValue) * usableHeight,
    }));
  }

  get yAxisLabels(): number[] {
    const max = this.maxActivityValue;
    return [max, max * 0.75, max * 0.5, max * 0.25, 0].map((v) => Math.round(v));
  }

  getYPosition(value: number): number {
    const usableHeight = this.chartHeight - this.chartPadding * 2;
    return this.chartPadding + (1 - value / this.maxActivityValue) * usableHeight;
  }

  get totalUsers(): number {
    return this.userRolesData.reduce((sum, d) => sum + d.value, 0) || 1;
  }

  getDonutSegments(): { offset: number; length: number; gap: number; color: string }[] {
    const circumference = 2 * Math.PI * 70;
    let accumulated = 0;
    const total = this.totalUsers;
    return this.userRolesData.map((d) => {
      const percent = d.value / total;
      const length = percent * circumference;
      const gap = circumference - length;
      const offset = -(accumulated / total) * circumference + circumference * 0.25;
      accumulated += d.value;
      return { offset, length, gap, color: d.color };
    });
  }
}
