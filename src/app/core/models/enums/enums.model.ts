export enum Role {
  ADMIN = 'ADMIN',
  MARKETING_MANAGER = 'MARKETING_MANAGER',
  MARKETING_TEAM = 'MARKETING_TEAM',
  BOD = 'BOD',
  CLIENT = 'CLIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  ANNUAL = 'ANNUAL',
  MONTHLY = 'MONTHLY',
  PROJECT_BASED = 'PROJECT_BASED',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum RenewalPeriod {
  ANNUALLY = 'ANNUALLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReportType {
  CONTRACT = 'CONTRACT',
  CLIENT = 'CLIENT',
  APPROVAL = 'APPROVAL',
  REVENUE = 'REVENUE',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

export enum ReminderType {
  DAY_60 = 'DAY_60',
  DAY_30 = 'DAY_30',
  DAY_7 = 'DAY_7',
  DAY_1 = 'DAY_1',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum EmailTone {
  PROFESSIONAL = 'PROFESSIONAL',
  CASUAL = 'CASUAL',
  URGENT = 'URGENT',
  PERSUASIVE = 'PERSUASIVE',
}
