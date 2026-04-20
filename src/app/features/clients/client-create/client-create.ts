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
      companyName: ['', [Validators.required, Validators.maxLength(200)]],
      clientName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
      industry: ['', [Validators.maxLength(100)]],
      address: [''],
      city: ['', [Validators.maxLength(100)]],
      country: ['Indonesia', [Validators.required, Validators.maxLength(100)]],
      status: [ClientStatus.ACTIVE],

      picName: ['', [Validators.required, Validators.maxLength(100)]],
      picEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      picPhone: ['', [Validators.maxLength(20)]],
      picPosition: ['', [Validators.maxLength(100)]],

      notes: [''],
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
    if (control?.hasError('maxlength')) {
      const max = control.getError('maxlength').requiredLength;
      return `Maximum ${max} characters`;
    }
    return '';
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
