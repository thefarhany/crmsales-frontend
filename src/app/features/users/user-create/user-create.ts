import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  LoaderCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
} from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateUserRequest } from '../../../core/models/entity/user.model';
import { Role } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
})
export class UserCreateComponent {
  // Lucide Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly MailIcon = MailIcon;
  readonly LockIcon = LockIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly CheckIcon = CheckIcon;
  readonly LoaderCircleIcon = LoaderCircleIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly ChevronDownIcon = ChevronDownIcon;

  userForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);

  roles = [
    { value: Role.ADMIN, label: 'Admin' },
    { value: Role.MARKETING_MANAGER, label: 'Marketing Manager' },
    { value: Role.MARKETING_TEAM, label: 'Marketing Team' },
    { value: Role.BOD, label: 'BOD' },
    { value: Role.CLIENT, label: 'Client' },
  ];

  statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9+\\-\\s]*$')]],
      role: [Role.MARKETING_TEAM, [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isLoading.set(true);
    const request: CreateUserRequest = this.userForm.value;

    this.userService.createUser(request).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'User created successfully');
        this.isLoading.set(false);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to create user');
        this.isLoading.set(false);
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
