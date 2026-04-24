import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  FileTextIcon,
  DollarSignIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  UploadIcon,
  Trash2Icon,
} from 'lucide-angular';
import { ContractService } from '../../../core/services/contract.service';
import { ClientService } from '../../../core/services/client.service';
import { CreateContractRequest } from '../../../core/models/entity/contract.model';
import { ContractType, RenewalPeriod } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-contract-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './contract-create.html',
})
export class ContractCreateComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly SaveIcon = SaveIcon;
  readonly Loader2Icon = Loader2Icon;
  readonly FileTextIcon = FileTextIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly UploadIcon = UploadIcon;
  readonly Trash2Icon = Trash2Icon;

  contractForm!: FormGroup;
  isSubmitting = false;

  clients: { id: number; companyName: string }[] = [];
  isLoadingClients = false;

  contractTypes = Object.values(ContractType);
  renewalPeriods = Object.values(RenewalPeriod);

  selectedFile: File | null = null;
  fileError: string = '';
  isDragging = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  // For formatted currency display
  displayValue: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private contractService: ContractService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.setupCurrencyFormatting();
  }

  private initForm(): void {
    this.contractForm = this.fb.group({
      contractTitle: ['', [Validators.required, Validators.maxLength(200)]],
      clientId: [null, [Validators.required]],
      contractType: [ContractType.ANNUAL, [Validators.required]],
      description: [''],
      contractValue: [0, [Validators.required, Validators.min(0)]],
      renewalPeriod: [RenewalPeriod.ANNUALLY],
      autoRenewal: [false],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  /**
   * Setup currency formatting for contract value
   */
  private setupCurrencyFormatting(): void {
    const valueControl = this.contractForm.get('contractValue');
    if (valueControl) {
      // Initialize display value
      this.updateDisplayValue(valueControl.value);

      valueControl.valueChanges.subscribe(value => {
        this.updateDisplayValue(value);
      });
    }
  }

  private updateDisplayValue(value: number): void {
    if (value !== null && value !== undefined) {
      this.displayValue = this.formatRupiah(value);
    } else {
      this.displayValue = '';
    }
  }

  /**
   * Format number to Rupiah string (1000000 -> 1,000,000)
   */
  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  /**
   * Parse formatted Rupiah string to number
   */
  parseRupiah(value: string): number {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  /**
   * Handle currency input
   */
  onCurrencyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const numericValue = this.parseRupiah(rawValue);

    // Update form control with numeric value
    this.contractForm.get('contractValue')?.setValue(numericValue, { emitEvent: false });
    this.displayValue = this.formatRupiah(numericValue);
  }

  /**
   * Handle currency focus - show raw value
   */
  onCurrencyFocus(): void {
    this.displayValue = this.contractForm.get('contractValue')?.value?.toString() || '';
  }

  /**
   * Handle currency blur - format value
   */
  onCurrencyBlur(): void {
    const value = this.contractForm.get('contractValue')?.value || 0;
    this.displayValue = this.formatRupiah(value);
  }

  private loadClients(): void {
    this.isLoadingClients = true;
    this.clientService.getAllClientsForDropdown().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.clients = res.data.content.map((c: any) => ({
            id: c.id,
            companyName: c.companyName,
          }));
        }
        this.isLoadingClients = false;
      },
      error: () => {
        this.isLoadingClients = false;
      },
    });
  }

  formatEnumLabel(value: string): string {
    return value.replace(/_/g, ' ');
  }

  formatCurrencyPreview(): string {
    const val = this.contractForm.get('contractValue')?.value || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }

  isInvalid(field: string): boolean {
    const control = this.contractForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(field: string): string {
    const control = this.contractForm.get(field);
    if (control?.errors?.['required']) return `${this.formatFieldName(field)} is required`;
    if (control?.errors?.['maxlength'])
      return `Maximum ${control.errors?.['maxlength'].requiredLength} characters`;
    if (control?.errors?.['min']) return `Value must be 0 or greater`;
    return '';
  }

  private formatFieldName(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }

  // ========== DRAG & DROP HANDLERS ==========

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Only set isDragging to false if leaving the drop zone (not entering a child)
    const target = event.relatedTarget as HTMLElement;
    if (!target?.closest('.drop-zone')) {
      this.isDragging = false;
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.processFile(input.files[0]);
    // Reset input value biar bisa select file yang sama lagi
    input.value = '';
  }

  /**
   * Process file (validate dan set)
   */
  private processFile(file: File): void {
    this.fileError = '';

    if (file.type !== 'application/pdf') {
      this.fileError = 'Only PDF files are allowed';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.fileError = 'File size must not exceed 10MB';
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.contractForm.invalid) {
      Object.keys(this.contractForm.controls).forEach((key) =>
        this.contractForm.get(key)?.markAsTouched(),
      );
      return;
    }

    this.isSubmitting = true;
    const formVal = this.contractForm.value;

    const request: CreateContractRequest = {
      clientId: formVal.clientId,
      contractTitle: formVal.contractTitle,
      contractType: formVal.contractType,
      contractValue: formVal.contractValue,
      startDate: formVal.startDate,
      endDate: formVal.endDate,
      renewalPeriod: formVal.renewalPeriod,
      autoRenewal: formVal.autoRenewal,
      description: formVal.description || undefined,
    };

    this.contractService.createContract(request, this.selectedFile ?? undefined).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.showNotification('Contract created successfully!', 'success');
          setTimeout(() => this.router.navigate(['/contracts']), 1500);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to create contract';
        this.showNotification(msg, 'error');
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
