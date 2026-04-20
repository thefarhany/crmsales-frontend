import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  ArrowLeftIcon,
  EyeIcon,
} from 'lucide-angular';
import { ContractService } from '../../../core/services/contract.service';
import { ContractCalendarResponse } from '../../../core/models/entity/contract.model';
import { ContractStatus } from '../../../core/models/enums/enums.model';

interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  contracts: ContractCalendarResponse[];
}

@Component({
  selector: 'app-contract-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './contract-calendar.html',
})
export class ContractCalendarComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly EyeIcon = EyeIcon;

  currentDate = new Date();
  currentYear = 0;
  currentMonth = 0;
  monthLabel = '';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];

  contracts: ContractCalendarResponse[] = [];
  isLoading = false;

  // Selected day detail
  selectedDay: CalendarDay | null = null;

  constructor(
    private contractService: ContractService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    this.buildCalendar();
    this.loadContracts();
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendar();
    this.loadContracts();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.buildCalendar();
    this.loadContracts();
  }

  goToToday(): void {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.buildCalendar();
    this.loadContracts();
  }

  private buildCalendar(): void {
    this.monthLabel = new Date(this.currentYear, this.currentMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const today = new Date();
    const todayStr = this.formatDate(today);

    this.calendarDays = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
      const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      this.calendarDays.push({
        date: d,
        fullDate: this.formatDateFromParts(prevYear, prevMonth, d),
        isCurrentMonth: false,
        isToday: false,
        contracts: [],
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = this.formatDateFromParts(this.currentYear, this.currentMonth, d);
      this.calendarDays.push({
        date: d,
        fullDate,
        isCurrentMonth: true,
        isToday: fullDate === todayStr,
        contracts: [],
      });
    }

    // Next month fill
    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
      const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
      this.calendarDays.push({
        date: d,
        fullDate: this.formatDateFromParts(nextYear, nextMonth, d),
        isCurrentMonth: false,
        isToday: false,
        contracts: [],
      });
    }
  }

  private loadContracts(): void {
    this.isLoading = true;
    this.selectedDay = null;

    const from = this.formatDateFromParts(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const to = this.formatDateFromParts(this.currentYear, this.currentMonth, lastDay);

    this.contractService.getContractCalendar(from, to).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contracts = res.data;
          this.mapContractsToDays();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private mapContractsToDays(): void {
    // Reset all
    this.calendarDays.forEach((day) => (day.contracts = []));

    for (const contract of this.contracts) {
      const start = new Date(contract.startDate);
      const end = new Date(contract.endDate);

      for (const day of this.calendarDays) {
        const dayDate = new Date(day.fullDate);
        // Show contract on start date and end date within this calendar view
        if (day.fullDate === contract.startDate || day.fullDate === contract.endDate) {
          day.contracts.push(contract);
        }
      }
    }
  }

  selectDay(day: CalendarDay): void {
    if (day.contracts.length > 0) {
      this.selectedDay = this.selectedDay?.fullDate === day.fullDate ? null : day;
    }
  }

  viewContract(id: number): void {
    this.router.navigate(['/contracts', id]);
  }

  getStatusColor(status: ContractStatus | string): string {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-500',
      PENDING_APPROVAL: 'bg-amber-500',
      EXPIRED: 'bg-red-500',
      DRAFT: 'bg-gray-400',
      TERMINATED: 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-400';
  }

  getStatusBgLight(status: ContractStatus | string): string {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      PENDING_APPROVAL: 'bg-amber-50 border-amber-200 text-amber-700',
      EXPIRED: 'bg-red-50 border-red-200 text-red-700',
      DRAFT: 'bg-gray-50 border-gray-200 text-gray-600',
      TERMINATED: 'bg-blue-50 border-blue-200 text-blue-700',
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-600';
  }

  getEventLabel(contract: ContractCalendarResponse, dayFullDate: string): string {
    if (dayFullDate === contract.startDate) return 'Start';
    if (dayFullDate === contract.endDate) return 'End';
    return '';
  }

  formatStatusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatDateFromParts(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}
