import { ReminderType, ReminderStatus, EmailTone } from '../enums/enums.model';

export interface AiReminderResponse {
  id: number;
  contractId: number;
  contractNumber: string;
  clientName: string;
  contractEndDate: string;
  reminderType: ReminderType;
  reminderTypeDescription: string;
  daysBeforeExpiry: number;
  recipientEmail: string;
  recipientUserId: number | null;
  recipientUserName: string | null;
  subject: string;
  message: string;
  status: ReminderStatus;
  statusDescription: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface ReminderSettingResponse {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string;
  updatedByName: string | null;
  updatedAt: string | null;
}

export interface ManualReminderRequest {
  contractId: number;
  customSubject?: string;
  customMessage?: string;
  recipientEmail?: string;
  tone?: EmailTone;
}

export interface UpdateReminderSettingRequest {
  settingKey: string;
  settingValue: string;
}
