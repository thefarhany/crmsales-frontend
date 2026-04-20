import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ClockIcon,
  SendIcon,
  CalendarIcon,
  Loader2Icon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  MailIcon,
  EyeIcon,
  SettingsIcon,
} from 'lucide-angular';
import { ReminderService } from '../../core/services/reminder.service';
import { AiReminderResponse, ReminderSettingResponse } from '../../core/models/entity/reminder.model';
import { ReminderStatus, Role } from '../../core/models/enums/enums.model';
import { AuthService } from '../../core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reminders.html',
})
export class RemindersComponent implements OnInit {
  // Icons
  readonly ClockIcon = ClockIcon;
  readonly SendIcon = SendIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly XCircleIcon = XCircleIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly FilterIcon = FilterIcon;
  readonly MailIcon = MailIcon;
  readonly EyeIcon = EyeIcon;
  readonly SettingsIcon = SettingsIcon;

  isManagerAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === Role.ADMIN || role === Role.MARKETING_MANAGER;
  });

  // Settings
  settings: ReminderSettingResponse[] = [];
  reminderDays: { day: number; label: string; enabled: boolean }[] = [
    { day: 60, label: '60 Days Before', enabled: false },
    { day: 30, label: '30 Days Before', enabled: false },
    { day: 7, label: '7 Days Before', enabled: false },
    { day: 1, label: '1 Day Before', enabled: false },
  ];
  isSettingsLoading = false;
  settingSaving = false;

  // Pending summary
  pendingCount = 0;
  isPendingLoading = false;

  // Reminder history table
  reminders: AiReminderResponse[] = [];
  isRemindersLoading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filter
  statusFilter: string = 'ALL';
  statusOptions = ['ALL', 'PENDING', 'SENT', 'FAILED'];

  // Send reminder loading state (per row)
  sendingReminderId: number | null = null;

  constructor(
    private reminderService: ReminderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadPendingCount();
    this.loadReminders();
  }

  // ==================== SETTINGS ====================

  loadSettings(): void {
    this.isSettingsLoading = true;
    this.reminderService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settings = res.data;
          this.parseReminderDays();
        }
        this.isSettingsLoading = false;
      },
      error: () => {
        this.isSettingsLoading = false;
      },
    });
  }

  private parseReminderDays(): void {
    const daysSetting = this.settings.find((s) => s.settingKey === 'REMINDER_DAYS');
    if (daysSetting) {
      const activeDays = daysSetting.settingValue.split(',').map((d) => parseInt(d.trim(), 10));

      this.reminderDays = this.reminderDays.map((rd) => ({
        ...rd,
        enabled: activeDays.includes(rd.day),
      }));
    }
  }

  toggleDay(day: { day: number; label: string; enabled: boolean }): void {
    day.enabled = !day.enabled;
    this.saveReminderDays(day);
  }

  private saveReminderDays(day: { day: number; label: string; enabled: boolean }): void {
    this.settingSaving = true;
    const activeDays = this.reminderDays
      .filter((rd) => rd.enabled)
      .map((rd) => rd.day)
      .sort((a, b) => b - a)
      .join(',');

    this.reminderService
      .updateSettings([{ settingKey: 'REMINDER_DAYS', settingValue: activeDays || '0' }])
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.settings = res.data;
          }
          this.settingSaving = false;
        },
        error: () => {
          // Rollback toggle
          day.enabled = !day.enabled;
          this.settingSaving = false;
        },
      });
  }

  // ==================== PENDING COUNT ====================

  loadPendingCount(): void {
    this.isPendingLoading = true;
    this.reminderService.getPendingReminders().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pendingCount = res.data.length;
        }
        this.isPendingLoading = false;
      },
      error: () => {
        this.isPendingLoading = false;
      },
    });
  }

  viewSchedule(): void {
    this.router.navigate(['/contracts/calendar']);
  }

  // ==================== REMINDER TABLE ====================

  loadReminders(): void {
    this.isRemindersLoading = true;

    if (this.statusFilter === 'ALL') {
      this.reminderService.getAllReminders(this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleRemindersResponse(res),
        error: () => {
          this.isRemindersLoading = false;
        },
      });
    } else if (this.statusFilter === 'SENT') {
      this.reminderService.getReminderHistory(this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleRemindersResponse(res),
        error: () => {
          this.isRemindersLoading = false;
        },
      });
    } else if (this.statusFilter === 'PENDING') {
      this.reminderService.getPendingReminders().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.reminders = res.data;
            this.totalElements = res.data.length;
            this.totalPages = 1;
          }
          this.isRemindersLoading = false;
        },
        error: () => {
          this.isRemindersLoading = false;
        },
      });
    } else {
      // FAILED — use getAllReminders and filter client-side
      this.reminderService.getAllReminders(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.reminders = res.data.content.filter((r) => r.status === ReminderStatus.FAILED);
            this.totalElements = this.reminders.length;
            this.totalPages = 1;
          }
          this.isRemindersLoading = false;
        },
        error: () => {
          this.isRemindersLoading = false;
        },
      });
    }
  }

  private handleRemindersResponse(res: any): void {
    if (res.success && res.data) {
      this.reminders = res.data.content;
      this.totalElements = res.data.totalElements;
      this.totalPages = res.data.totalPages;
    }
    this.isRemindersLoading = false;
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadReminders();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadReminders();
    }
  }

  // ==================== SEND REMINDER ====================

  sendReminder(reminder: AiReminderResponse): void {
    this.sendingReminderId = reminder.id;
    this.reminderService.sendManualReminder({ contractId: reminder.contractId }).subscribe({
      next: () => {
        this.sendingReminderId = null;
        this.loadReminders();
        this.loadPendingCount();
      },
      error: () => {
        this.sendingReminderId = null;
      },
    });
  }

  // ==================== HELPERS ====================

  getStatusBadgeClass(status: ReminderStatus | string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-blue-100 text-blue-700',
      SENT: 'bg-emerald-100 text-emerald-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getToggleClass(enabled: boolean): string {
    return enabled ? 'bg-emerald-500' : 'bg-gray-300';
  }

  getToggleKnobClass(enabled: boolean): string {
    return enabled ? 'translate-x-5' : 'translate-x-0';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
