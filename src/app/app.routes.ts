import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Role } from './core/models/enums/enums.model';

export const routes: Routes = [
  {
    path: 'login',
    title: 'CRM | Login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    title: 'CRM | Forgot Password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    title: 'CRM | Reset Password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },

  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'CRM | Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        children: [
          {
            path: '',
            title: 'CRM | User Management',
            loadComponent: () =>
              import('./features/users/user-list/user-list').then((m) => m.UserListComponent),
          },
          {
            path: 'create',
            title: 'CRM | Create User',
            loadComponent: () =>
              import('./features/users/user-create/user-create').then((m) => m.UserCreateComponent),
          },
          {
            path: ':id',
            title: 'CRM | User Detail',
            loadComponent: () =>
              import('./features/users/user-detail/user-detail').then((m) => m.UserDetailComponent),
          },
          {
            path: ':id/edit',
            title: 'CRM | Edit User',
            loadComponent: () =>
              import('./features/users/user-edit/user-edit').then((m) => m.UserEditComponent),
          },
        ],
      },
      {
        path: 'clients',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD] },
        children: [
          {
            path: '',
            title: 'CRM | Clients',
            loadComponent: () =>
              import('./features/clients/client-list/client-list').then(
                (m) => m.ClientListComponent,
              ),
          },
          {
            path: 'create',
            title: 'CRM | Create Client',
            loadComponent: () =>
              import('./features/clients/client-create/client-create').then(
                (m) => m.ClientCreateComponent,
              ),
          },
          {
            path: ':id/edit',
            title: 'CRM | Edit Client',
            loadComponent: () =>
              import('./features/clients/client-edit/client-edit').then(
                (m) => m.ClientEditComponent,
              ),
          },
          {
            path: ':id',
            title: 'CRM | Client Detail',
            loadComponent: () =>
              import('./features/clients/client-detail/client-detail').then(
                (m) => m.ClientDetailComponent,
              ),
          },
        ],
      },

      {
        path: 'contracts',
        children: [
          {
            path: '',
            title: 'CRM | Contracts',
            loadComponent: () =>
              import('./features/contracts/contract-list/contract-list').then(
                (m) => m.ContractListComponent,
              ),
          },
          {
            path: 'create',
            title: 'CRM | Create Contract',
            loadComponent: () =>
              import('./features/contracts/contract-create/contract-create').then(
                (m) => m.ContractCreateComponent,
              ),
          },
          {
            path: 'calendar',
            title: 'CRM | Contract Calendar',
            loadComponent: () =>
              import('./features/contracts/contract-calendar/contract-calendar').then(
                (m) => m.ContractCalendarComponent,
              ),
          },
          {
            path: 'expiring',
            title: 'CRM | Expiring Contracts',
            loadComponent: () =>
              import('./features/contracts/contract-expiring/contract-expiring').then(
                (m) => m.ContractExpiringComponent,
              ),
          },
          {
            path: ':id/edit',
            title: 'CRM | Edit Contract',
            loadComponent: () =>
              import('./features/contracts/contract-edit/contract-edit').then(
                (m) => m.ContractEditComponent,
              ),
          },
          {
            path: ':id',
            title: 'CRM | Contract Detail',
            loadComponent: () =>
              import('./features/contracts/contract-detail/contract-detail').then(
                (m) => m.ContractDetailComponent,
              ),
          },
        ],
      },

      {
        path: 'approvals',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD] },
        children: [
          {
            path: '',
            title: 'CRM | Approvals',
            loadComponent: () =>
              import('./features/approvals/approval-list/approval-list').then(
                (m) => m.ApprovalListComponent,
              ),
          },
          {
            path: 'contract/:contractId',
            title: 'CRM | Approval Workflow',
            loadComponent: () =>
              import('./features/approvals/approval-workflow/approval-workflow').then(
                (m) => m.ApprovalWorkflowComponent,
              ),
          },
        ],
      },
      {
        path: 'email-generator',
        title: 'CRM | AI Email Generator',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM] },
        loadComponent: () =>
          import('./features/email-generator/email-generator').then(
            (m) => m.EmailGeneratorComponent,
          ),
      },
      {
        path: 'reminders',
        title: 'CRM | AI Reminders',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD] },
        loadComponent: () =>
          import('./features/reminders/reminders').then((m) => m.RemindersComponent),
      },
      {
        path: 'my-profile',
        title: 'CRM | My Profile',
        loadComponent: () =>
          import('./features/my-profile/my-profile').then((m) => m.MyProfileComponent),
      },
      {
        path: 'reports',
        title: 'CRM | Reports',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MARKETING_MANAGER, Role.MARKETING_TEAM, Role.BOD] },
        loadComponent: () =>
          import('./features/reports/reports').then((m) => m.ReportListComponent),
      },
    ],
  },

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
