import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FileTextIcon,
  BarChart3Icon,
  ClockIcon,
  FilterIcon,
  CalendarIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-angular';
import { ReportService } from '../../core/services/report.service';
import {
  ReportLogResponse,
  ReportSummaryResponse,
  DownloadReportRequest,
} from '../../core/models/entity/report.model';
import { ReportType, ReportFormat } from '../../core/models/enums/enums.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reports.html',
})
export class ReportListComponent implements OnInit {
  readonly FileTextIcon = FileTextIcon;
  readonly BarChart3Icon = BarChart3Icon;
  readonly ClockIcon = ClockIcon;
  readonly FilterIcon = FilterIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly DownloadIcon = DownloadIcon;
  readonly FileSpreadsheetIcon = FileSpreadsheetIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  readonly ReportType = ReportType;
  readonly ReportFormat = ReportFormat;

  readonly Math = Math;

  summary: ReportSummaryResponse | null = null;

  recentReports: ReportLogResponse[] = [];
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  selectedReportType: ReportType = ReportType.CONTRACT;
  selectedFormat: ReportFormat = ReportFormat.PDF;
  dateRangeStart = '';
  dateRangeEnd = '';

  isLoadingSummary = false;
  isLoadingReports = false;
  isGenerating = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  reportTypeOptions = [
    { value: ReportType.CONTRACT, label: 'Contract Summary' },
    { value: ReportType.CLIENT, label: 'Client Report' },
    { value: ReportType.APPROVAL, label: 'Approval Report' },
    { value: ReportType.REVENUE, label: 'Revenue Report' },
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadRecentReports();
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.reportService.getSummary().subscribe({
      next: (res) => {
        this.summary = res.data!;
        this.isLoadingSummary = false;
      },
      error: () => {
        this.showNotification('Failed to load summary', 'error');
        this.isLoadingSummary = false;
      },
    });
  }

  loadRecentReports(): void {
    this.isLoadingReports = true;
    this.reportService.getRecentReports(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        const page = res.data!;
        this.recentReports = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.isLoadingReports = false;
      },
      error: () => {
        this.showNotification('Failed to load recent reports', 'error');
        this.isLoadingReports = false;
      },
    });
  }

  generateReport(): void {
    this.isGenerating = true;

    const request: DownloadReportRequest = {
      reportType: this.selectedReportType,
      format: this.selectedFormat,
    };

    if (this.dateRangeStart) request.dateRangeStart = this.dateRangeStart;
    if (this.dateRangeEnd) request.dateRangeEnd = this.dateRangeEnd;

    this.reportService.downloadReport(request).subscribe({
      next: (response) => {
        const blob = response.body!;
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName =
          contentDisposition?.split('filename=')[1]?.replace(/"/g, '') ||
          `report.${this.selectedFormat === ReportFormat.PDF ? 'pdf' : 'xlsx'}`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Report downloaded successfully', 'success');
        this.isGenerating = false;

        // Refresh data
        this.loadSummary();
        this.loadRecentReports();
      },
      error: () => {
        this.showNotification('Failed to generate report', 'error');
        this.isGenerating = false;
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadRecentReports();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return (
      date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  getReportTypeLabel(type: ReportType): string {
    return this.reportTypeOptions.find((o) => o.value === type)?.label || type;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
