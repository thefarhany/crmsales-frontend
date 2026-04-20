import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardResponse } from '../../../core/models/entity/dashboard.model';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard';
import { ManagerDashboardComponent } from '../manager-dashboard/manager-dashboard';
import { TeamDashboardComponent } from '../team-dashboard/team-dashboard';
import { BodDashboardComponent } from '../bod-dashboard/bod-dashboard';
import { ClientDashboardComponent } from '../client-dashboard/client-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    ManagerDashboardComponent,
    TeamDashboardComponent,
    BodDashboardComponent,
    ClientDashboardComponent,
  ],
  template: `
    @if (currentUser(); as user) {
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-slate-400 text-sm">Loading dashboard...</span>
          </div>
        </div>
      } @else if (dashboardData()) {
        @switch (user.role) {
          @case ('ADMIN') {
            <app-admin-dashboard [data]="dashboardData()!" />
          }
          @case ('BOD') {
            <app-bod-dashboard [data]="dashboardData()!" />
          }
          @case ('MARKETING_MANAGER') {
            <app-manager-dashboard [data]="dashboardData()!" />
          }
          @case ('MARKETING_TEAM') {
            <app-team-dashboard [data]="dashboardData()!" />
          }
          @case ('CLIENT') {
            <app-client-dashboard />
          }
          @default {
            <p class="text-red-400">Your role is not recognized.</p>
          }
        }
      } @else {
        <div class="flex items-center justify-center h-64">
          <p class="text-red-400">Failed to load dashboard data.</p>
        </div>
      }
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-slate-400 text-sm">Loading...</span>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  currentUser = computed(() => this.authService.currentUser());
  dashboardData = signal<DashboardResponse | null>(null);
  loading = signal(true);

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
