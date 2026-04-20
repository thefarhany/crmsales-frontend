import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  DollarSignIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-angular';
import { DashboardResponse } from '../../../core/models/entity/dashboard.model';

@Component({
  selector: 'app-bod-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bod-dashboard.html',
  styleUrl: './bod-dashboard.css',
})
export class BodDashboardComponent implements OnInit {
  @Input({ required: true }) data!: DashboardResponse;

  readonly DollarSignIcon = DollarSignIcon;
  readonly ShieldAlertIcon = ShieldAlertIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly UsersIcon = UsersIcon;

  stats = {
    totalContractValue: '',
    yoyGrowth: '',
    riskExposure: '',
    riskCompliance: '',
    riskColor: '',
    clientGrowth: '',
    newClients: '',
    activeClients: 0,
  };

  revenueData: { month: string; value: number }[] = [];

  pipelineData: { month: string; value: number }[] = [];

  ngOnInit(): void {
    const expiring = this.data.expiringSoon30Days;
    let riskLevel = 'Low';
    let riskColor = 'text-emerald-400';
    let compliance = '98%';
    if (expiring > 10) {
      riskLevel = 'High';
      riskColor = 'text-red-400';
      compliance = `${Math.max(70, 100 - expiring)}%`;
    } else if (expiring > 5) {
      riskLevel = 'Medium';
      riskColor = 'text-yellow-400';
      compliance = `${Math.max(85, 100 - expiring)}%`;
    }

    const growthPct = this.data.clientGrowthPercentage;
    const growthSign = growthPct >= 0 ? '+' : '';

    this.stats = {
      totalContractValue: this.formatCurrency(this.data.totalContractValue),
      yoyGrowth: `${this.data.activeContracts} active contracts`,
      riskExposure: riskLevel,
      riskCompliance: `${compliance} Compliance Rate`,
      riskColor: riskColor,
      clientGrowth: `${growthSign}${growthPct}%`,
      newClients: `${this.data.newClientsThisMonth} New Clients This Month`,
      activeClients: this.data.activeClients,
    };

    this.revenueData = this.data.monthlyRevenue.map((m) => ({
      month: this.formatMonth(m.month),
      value: m.value,
    }));

    this.pipelineData = this.data.monthlyRevenue.map((m) => ({
      month: this.formatMonth(m.month),
      value: m.count,
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
      return `Rp ${(value / 1_000_000_000).toFixed(1)} Billion`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(1)}K`;
    }
    return `Rp ${value}`;
  }

  private readonly chartWidth = 500;
  private readonly chartHeight = 200;
  private readonly chartPadding = 20;

  get maxRevenueValue(): number {
    const max = Math.max(...this.revenueData.map((d) => d.value));
    return max > 0 ? max : 1;
  }

  get revenueLinePath(): string {
    if (this.revenueData.length === 0) return '';
    const points = this.getRevenuePoints();
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }

  get revenueAreaPath(): string {
    if (this.revenueData.length === 0) return '';
    const points = this.getRevenuePoints();
    const bottom = this.chartHeight - this.chartPadding;
    return (
      `M${points[0].x},${bottom} ` +
      points.map((p) => `L${p.x},${p.y}`).join(' ') +
      ` L${points[points.length - 1].x},${bottom} Z`
    );
  }

  private getRevenuePoints(): { x: number; y: number }[] {
    const usableWidth = this.chartWidth - this.chartPadding * 2;
    const usableHeight = this.chartHeight - this.chartPadding * 2;
    const len = this.revenueData.length;
    return this.revenueData.map((d, i) => ({
      x: this.chartPadding + (len > 1 ? (i / (len - 1)) * usableWidth : usableWidth / 2),
      y: this.chartPadding + (1 - d.value / this.maxRevenueValue) * usableHeight,
    }));
  }

  get revenueYLabels(): number[] {
    const max = this.maxRevenueValue;
    return [max, max * 0.75, max * 0.5, max * 0.25, 0].map((v) => Math.round(v));
  }

  getRevenueYPosition(value: number): number {
    const usableHeight = this.chartHeight - this.chartPadding * 2;
    return this.chartPadding + (1 - value / this.maxRevenueValue) * usableHeight;
  }

  formatYLabel(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return `${value}`;
  }

  get maxPipelineValue(): number {
    const max = Math.max(...this.pipelineData.map((d) => d.value));
    return max > 0 ? max : 1;
  }

  getPipelineBarHeight(value: number): number {
    return (value / this.maxPipelineValue) * 100;
  }
}
