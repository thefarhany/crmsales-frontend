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
