import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/enums/enums.model';
import {
  LucideAngularModule,
  LayoutDashboardIcon,
  UsersIcon,
  ContactIcon,
  FileTextIcon,
  BuildingIcon,
  FileCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  BrainIcon,
  MailIcon,
  FileIcon,
  DownloadIcon,
  BellIcon,
  ActivityIcon,
  BarChart3Icon,
  UserIcon,
  LogOutIcon,
  TrendingUp,
  type LucideIconData,
} from 'lucide-angular';

interface MenuItem {
  label: string;
  icon: LucideIconData;
  route: string;
  roles: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly LogOutIcon = LogOutIcon;
  readonly TrendingUp = TrendingUp;

  constructor(public authService: AuthService) {}

  private allMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      route: '/dashboard',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD, Role.CLIENT],
    },
    {
      label: 'User Management',
      icon: UsersIcon,
      route: '/users',
      roles: [Role.ADMIN],
    },
    {
      label: 'Client Management',
      icon: ContactIcon,
      route: '/clients',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD],
    },
    {
      label: 'Contract Management',
      icon: FileTextIcon,
      route: '/contracts',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD],
    },
    {
      label: 'My Company Info',
      icon: BuildingIcon,
      route: '/company-info',
      roles: [Role.CLIENT],
    },
    {
      label: 'My Contracts',
      icon: FileCheckIcon,
      route: '/my-contracts',
      roles: [Role.CLIENT],
    },
    {
      label: 'Approvals',
      icon: CheckCircleIcon,
      route: '/approvals',
      roles: [Role.MARKETING_MANAGER, Role.BOD],
    },
    {
      label: 'My Reminders',
      icon: ClockIcon,
      route: '/reminders',
      roles: [Role.MARKETING_TEAM],
    },
    {
      label: 'Reminder Management',
      icon: ClockIcon,
      route: '/reminders',
      roles: [Role.MARKETING_MANAGER],
    },
    {
      label: 'Reminder Overview',
      icon: ClockIcon,
      route: '/reminders',
      roles: [Role.BOD],
    },
    {
      label: 'AI Reminder System',
      icon: BellIcon,
      route: '/reminders',
      roles: [Role.ADMIN],
    },
    {
      label: 'Email Generator',
      icon: MailIcon,
      route: '/email-generator',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM],
    },
    {
      label: 'Download Contracts',
      icon: DownloadIcon,
      route: '/download-contracts',
      roles: [Role.CLIENT],
    },
    {
      label: 'Reports',
      icon: BarChart3Icon,
      route: '/reports',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD],
    },
    {
      label: 'My Profile',
      icon: UserIcon,
      route: '/my-profile',
      roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD, Role.CLIENT],
    },
  ];

  menuItems = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.allMenuItems.filter((item) => item.roles.includes(currentUser.role));
  });

  currentUser = computed(() => this.authService.currentUser());

  logout(): void {
    this.authService.logout().subscribe();
  }
}
