import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  LoaderCircleIcon,
  ChevronDownIcon,
} from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UpdateUserRequest, UserResponse } from '../../../core/models/entity/user.model';
import { Role, UserStatus } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css',
})
export class UserEditComponent implements OnInit {
  // Lucide Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly MailIcon = MailIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly LockIcon = LockIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly CheckIcon = CheckIcon;
  readonly LoaderCircleIcon = LoaderCircleIcon;
  readonly ChevronDownIcon = ChevronDownIcon;

  userForm!: FormGroup;
  userId!: number;
  user = signal<UserResponse | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  showPassword = signal(false);

  roles = [
    { value: Role.ADMIN, label: 'Admin' },
    { value: Role.MARKETING_MANAGER, label: 'Marketing Manager' },
    { value: Role.MARKETING_TEAM, label: 'Marketing Team' },
    { value: Role.BOD, label: 'BOD' },
    { value: Role.CLIENT, label: 'Client' },
  ];

  statuses = [
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.INACTIVE, label: 'Inactive' },
    { value: UserStatus.LOCKED, label: 'Locked' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadUser();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9+\\-\\s]*$')]],
      role: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  private loadUser(): void {
    this.isLoading.set(true);
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user.set(response.data);
          this.userForm.patchValue({
            fullName: response.data.fullName,
            email: response.data.email,
            phone: response.data.phone || '',
            role: response.data.role,
            status: response.data.status,
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load user');
        this.isLoading.set(false);
        this.router.navigate(['/users']);
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSaving.set(true);
    const formValue = this.userForm.value;

    const request: UpdateUserRequest = {
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone || undefined,
      role: formValue.role,
      status: formValue.status,
    };

    this.userService.updateUser(this.userId, request).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'User updated successfully');
        this.isSaving.set(false);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to update user');
        this.isSaving.set(false);
      },
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  get f() {
    return this.userForm.controls;
  }
}
