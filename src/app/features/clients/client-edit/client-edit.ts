import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  SaveIcon,
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
  CalendarIcon,
  HashIcon,
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { ClientResponse } from '../../../core/models/entity/client.model';
import { ClientStatus } from '../../../core/models/enums/enums.model';

// Validation constants
const VALIDATION = {
  COMPANY_NAME: { min: 2, max: 200 },
  CLIENT_NAME: { min: 2, max: 100 },
  EMAIL: { min: 5, max: 100 },
  PHONE: { min: 10, max: 20 },
  INDUSTRY: { min: 2, max: 100 },
  CITY: { min: 2, max: 100 },
  COUNTRY: { min: 2, max: 100 },
  PIC_NAME: { min: 2, max: 100 },
  PIC_EMAIL: { min: 5, max: 100 },
  PIC_PHONE: { min: 10, max: 20 },
  PIC_POSITION: { min: 2, max: 100 },
  ADDRESS: { min: 10, max: 500 },
  NOTES: { min: 0, max: 1000 },
};

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './client-edit.html',
})
export class ClientEditComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly SaveIcon = SaveIcon;
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
  readonly CalendarIcon = CalendarIcon;
  readonly HashIcon = HashIcon;

  clientId!: number;
  clientForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  statusOptions = Object.values(ClientStatus);
  originalClient: ClientResponse | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClient();
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(VALIDATION.COMPANY_NAME.min), Validators.maxLength(VALIDATION.COMPANY_NAME.max)]],
      clientName: ['', [Validators.required, Validators.minLength(VALIDATION.CLIENT_NAME.min), Validators.maxLength(VALIDATION.CLIENT_NAME.max)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(VALIDATION.EMAIL.min), Validators.maxLength(VALIDATION.EMAIL.max)]],
      phone: ['', [Validators.minLength(VALIDATION.PHONE.min), Validators.maxLength(VALIDATION.PHONE.max)]],
      industry: ['', [Validators.minLength(VALIDATION.INDUSTRY.min), Validators.maxLength(VALIDATION.INDUSTRY.max)]],
      address: ['', [Validators.minLength(VALIDATION.ADDRESS.min), Validators.maxLength(VALIDATION.ADDRESS.max)]],
      city: ['', [Validators.minLength(VALIDATION.CITY.min), Validators.maxLength(VALIDATION.CITY.max)]],
      country: ['Indonesia', [Validators.required, Validators.minLength(VALIDATION.COUNTRY.min), Validators.maxLength(VALIDATION.COUNTRY.max)]],
      status: [ClientStatus.ACTIVE],
      picName: ['', [Validators.required, Validators.minLength(VALIDATION.PIC_NAME.min), Validators.maxLength(VALIDATION.PIC_NAME.max)]],
      picEmail: ['', [Validators.required, Validators.email, Validators.minLength(VALIDATION.PIC_EMAIL.min), Validators.maxLength(VALIDATION.PIC_EMAIL.max)]],
      picPhone: ['', [Validators.minLength(VALIDATION.PIC_PHONE.min), Validators.maxLength(VALIDATION.PIC_PHONE.max)]],
      picPosition: ['', [Validators.minLength(VALIDATION.PIC_POSITION.min), Validators.maxLength(VALIDATION.PIC_POSITION.max)]],
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
    phoneFields.forEach(field => {
      const control = this.clientForm.get(field);
      if (control) {
        control.valueChanges.subscribe(value => {
          if (value && value.startsWith('0') && !value.startsWith('00')) {
            const formatted = '+62' + value.substring(1);
            control.setValue(formatted, { emitEvent: false });
          }
        });
      }
    });
  }

  get statusControl(): FormControl {
    return this.clientForm.get('status') as FormControl;
  }

  private loadClient(): void {
    this.isLoading = true;
    this.clientService.getClientById(this.clientId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.originalClient = res.data;
          this.patchForm(res.data);
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Failed to load client data', 'error');
        this.isLoading = false;
      },
    });
  }

  private patchForm(client: ClientResponse): void {
    this.clientForm.patchValue({
      companyName: client.companyName ?? '',
      clientName: client.clientName ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      industry: client.industry ?? '',
      address: client.address ?? '',
      city: client.city ?? '',
      country: client.country ?? 'Indonesia',
      status: client.status ?? ClientStatus.ACTIVE,
      picName: client.picName ?? '',
      picEmail: client.picEmail ?? '',
      picPhone: client.picPhone ?? '',
      picPosition: client.picPosition ?? '',
      notes: client.notes ?? '',
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

    this.clientService.updateClient(this.clientId, payload as any).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.showNotification('Client updated successfully!', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to update client';
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

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
