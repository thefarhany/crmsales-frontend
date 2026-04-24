import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  SaveIcon,
  XIcon,
  Building2Icon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  BriefcaseIcon,
  FileTextIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { ClientStatus } from '../../../core/models/enums/enums.model';

// Validation constants
const VALIDATION = {
  COMPANY_NAME: { min: 2, max: 60 },
  CLIENT_NAME: { min: 2, max: 60 },
  EMAIL: { min: 5, max: 30 },
  PHONE: { min: 10, max: 20 },
  INDUSTRY: { min: 2, max: 60 },
  CITY: { min: 2, max: 60 },
  COUNTRY: { min: 2, max: 60 },
  PIC_NAME: { min: 2, max: 60 },
  PIC_EMAIL: { min: 5, max: 60 },
  PIC_PHONE: { min: 10, max: 20 },
  PIC_POSITION: { min: 2, max: 60 },
  ADDRESS: { min: 10, max: 500 },
  NOTES: { min: 0, max: 1000 },
};

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './client-create.html',
})
export class ClientCreateComponent {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly SaveIcon = SaveIcon;
  readonly XIcon = XIcon;
  readonly Building2Icon = Building2Icon;
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly MapPinIcon = MapPinIcon;
  readonly GlobeIcon = GlobeIcon;
  readonly BriefcaseIcon = BriefcaseIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;
  readonly Loader2Icon = Loader2Icon;

  clientForm: FormGroup;
  isSubmitting = false;
  statusOptions = Object.values(ClientStatus);

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
  ) {
    this.clientForm = this.fb.group({
      companyName: [
        '',
        [
          Validators.required,
          Validators.minLength(VALIDATION.COMPANY_NAME.min),
          Validators.maxLength(VALIDATION.COMPANY_NAME.max),
        ],
      ],
      clientName: [
        '',
        [
          Validators.required,
          Validators.minLength(VALIDATION.CLIENT_NAME.min),
          Validators.maxLength(VALIDATION.CLIENT_NAME.max),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.minLength(VALIDATION.EMAIL.min),
          Validators.maxLength(VALIDATION.EMAIL.max),
        ],
      ],
      phone: [
        '',
        [Validators.minLength(VALIDATION.PHONE.min), Validators.maxLength(VALIDATION.PHONE.max)],
      ],
      industry: [
        '',
        [
          Validators.minLength(VALIDATION.INDUSTRY.min),
          Validators.maxLength(VALIDATION.INDUSTRY.max),
        ],
      ],
      address: [
        '',
        [
          Validators.minLength(VALIDATION.ADDRESS.min),
          Validators.maxLength(VALIDATION.ADDRESS.max),
        ],
      ],
      city: [
        '',
        [Validators.minLength(VALIDATION.CITY.min), Validators.maxLength(VALIDATION.CITY.max)],
      ],
      country: [
        'Indonesia',
        [
          Validators.required,
          Validators.minLength(VALIDATION.COUNTRY.min),
          Validators.maxLength(VALIDATION.COUNTRY.max),
        ],
      ],
      status: [ClientStatus.ACTIVE],

      picName: [
        '',
        [
          Validators.required,
          Validators.minLength(VALIDATION.PIC_NAME.min),
          Validators.maxLength(VALIDATION.PIC_NAME.max),
        ],
      ],
      picEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.minLength(VALIDATION.PIC_EMAIL.min),
          Validators.maxLength(VALIDATION.PIC_EMAIL.max),
        ],
      ],
      picPhone: [
        '',
        [
          Validators.minLength(VALIDATION.PIC_PHONE.min),
          Validators.maxLength(VALIDATION.PIC_PHONE.max),
        ],
      ],
      picPosition: [
        '',
        [
          Validators.minLength(VALIDATION.PIC_POSITION.min),
          Validators.maxLength(VALIDATION.PIC_POSITION.max),
        ],
      ],

      notes: ['', [Validators.maxLength(VALIDATION.NOTES.max)]],
    });

    // Auto-format phone numbers
    this.setupPhoneFormatting();
  }

  /**
   * Setup phone number auto-formatting (08... -> +62...)
   */
  private setupPhoneFormatting(): void {
    const phoneFields = ['phone', 'picPhone'];
    phoneFields.forEach((field) => {
      const control = this.clientForm.get(field);
      if (control) {
        control.valueChanges.subscribe((value) => {
          if (value && value.startsWith('0') && !value.startsWith('00')) {
            const formatted = '+62' + value.substring(1);
            control.setValue(formatted, { emitEvent: false });
          }
        });
      }
    });
  }

  get previewCompany(): string {
    return this.clientForm.get('companyName')?.value || 'Company Name';
  }

  get previewIndustry(): string {
    return this.clientForm.get('industry')?.value || 'Industry';
  }

  get previewInitial(): string {
    const name = this.clientForm.get('companyName')?.value;
    return name ? name.charAt(0).toUpperCase() : 'C';
  }

  get previewAvatarColor(): string {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#F97316',
      '#6366F1',
      '#14B8A6',
    ];
    const name = this.clientForm.get('companyName')?.value || '';
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  get previewStatus(): string {
    return this.clientForm.get('status')?.value || ClientStatus.ACTIVE;
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.clientForm.value;

    const payload = Object.fromEntries(
      Object.entries(formValue).map(([key, value]) => [key, value === '' ? undefined : value]),
    );

    this.clientService.createClient(payload as any).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.showNotification('Client created successfully!', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to create client';
        this.showNotification(msg, 'error');
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.clientForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getError(field: string): string {
    const control = this.clientForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('email')) return 'Invalid email address';
    if (control?.hasError('minlength')) {
      const min = control.getError('minlength').requiredLength;
      return `Minimum ${min} characters required`;
    }
    if (control?.hasError('maxlength')) {
      const max = control.getError('maxlength').requiredLength;
      return `Maximum ${max} characters allowed`;
    }
    return '';
  }

  /**
   * Get character count for a field
   */
  getCharCount(field: string): number {
    const value = this.clientForm.get(field)?.value;
    return value ? value.length : 0;
  }

  /**
   * Get validation limits for a field
   */
  getValidationLimits(field: string): { min: number; max: number } | null {
    const limits: Record<string, { min: number; max: number }> = {
      companyName: VALIDATION.COMPANY_NAME,
      clientName: VALIDATION.CLIENT_NAME,
      email: VALIDATION.EMAIL,
      phone: VALIDATION.PHONE,
      industry: VALIDATION.INDUSTRY,
      city: VALIDATION.CITY,
      country: VALIDATION.COUNTRY,
      address: VALIDATION.ADDRESS,
      picName: VALIDATION.PIC_NAME,
      picEmail: VALIDATION.PIC_EMAIL,
      picPhone: VALIDATION.PIC_PHONE,
      picPosition: VALIDATION.PIC_POSITION,
      notes: VALIDATION.NOTES,
    };
    return limits[field] || null;
  }

  /**
   * Format phone number (08... -> +62...)
   */
  formatPhoneNumber(value: string): string {
    if (!value) return value;
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    // Convert leading 0 to +62
    if (cleaned.startsWith('0') && !cleaned.startsWith('00')) {
      cleaned = '+62' + cleaned.substring(1);
    }
    return cleaned;
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
