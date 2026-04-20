import { ReportFormat, ReportType } from '../enums/enums.model';

export interface DownloadReportRequest {
  reportType: ReportType;
  format: ReportFormat;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface ReportLogResponse {
  id: number;
  reportName: string;
  reportType: ReportType;
  format: ReportFormat;
  dateRangeStart: string;
  dateRangeEnd: string;
  fileSize: number;
  generatedByName: string;
  generatedByRole: string;
  generatedAt: string;
}

export interface ReportSummaryResponse {
  reportsGeneratedThisMonth: number;
  totalActiveContracts: number;
  totalContractValue: number;
}
