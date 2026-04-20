import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';

import { ContractService } from '../../core/services/contract.service';
import { ReminderService } from '../../core/services/reminder.service';
import { ContractResponse } from '../../core/models/entity/contract.model';
import { ManualReminderRequest } from '../../core/models/entity/reminder.model';
import { EmailTone, ContractStatus } from '../../core/models/enums/enums.model';

import {
  LucideAngularModule,
  SparklesIcon,
  SendIcon,
  MailIcon,
  Loader2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  PencilIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-email-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, QuillModule],
  templateUrl: './email-generator.html',
})
export class EmailGeneratorComponent implements OnInit {
  readonly SparklesIcon = SparklesIcon;
  readonly SendIcon = SendIcon;
  readonly MailIcon = MailIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly PencilIcon = PencilIcon;

  activeContracts: ContractResponse[] = [];
  selectedContractId: number | null = null;
  selectedTone: EmailTone = EmailTone.PROFESSIONAL;
  tones = Object.values(EmailTone);

  isLoadingContracts = false;
  isGenerating = false;
  isSending = false;

  draftContent: string = '';
  isDraftReady = false;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  };

  constructor(
    private contractService: ContractService,
    private reminderService: ReminderService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadActiveContracts();
  }

  loadActiveContracts(): void {
    this.isLoadingContracts = true;
    this.contractService
      .getAllContracts(ContractStatus.ACTIVE, undefined, undefined, undefined, 0, 100)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.activeContracts = res.data.content;
          }
          this.isLoadingContracts = false;
        },
        error: () => {
          this.isLoadingContracts = false;
          this.showNotification('Failed to load contracts', 'error');
        },
      });
  }

  generateDraft(): void {
    if (!this.selectedContractId) return;

    this.isGenerating = true;
    this.isDraftReady = false;
    this.draftContent = '';

    const request: ManualReminderRequest = {
      contractId: this.selectedContractId,
      tone: this.selectedTone,
    };

    this.reminderService.generateDraftReminder(request).subscribe({
      next: (res) => {
        this.isGenerating = false;
        if (res.success && res.data) {
          this.draftContent = res.data.message;
          this.isDraftReady = true;
          this.showNotification('Draft generated! You can now edit it.', 'success');
        }
      },
      error: (err) => {
        this.isGenerating = false;
        this.showNotification(err.error?.message || 'AI Server Timeout or Error', 'error');
      },
    });
  }

  sendEmail(): void {
    if (!this.selectedContractId || !this.draftContent) return;

    this.isSending = true;

    const request: ManualReminderRequest = {
      contractId: this.selectedContractId,
      tone: this.selectedTone,
      customMessage: this.draftContent,
    };

    this.reminderService.sendManualReminder(request).subscribe({
      next: (res) => {
        this.isSending = false;
        if (res.success) {
          this.isDraftReady = false;
          this.draftContent = '';
          this.showNotification('Email successfully sent to client!', 'success');
        }
      },
      error: (err) => {
        this.isSending = false;
        this.showNotification(err.error?.message || 'Failed to send email', 'error');
      },
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
