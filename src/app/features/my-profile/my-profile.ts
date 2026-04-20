import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-angular';
import { ProfileService } from '../../core/services/profile.service';
import { UserResponse } from '../../core/models/entity/user.model';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './my-profile.html',
})
export class MyProfileComponent implements OnInit {
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly LockIcon = LockIcon;
  readonly SaveIcon = SaveIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly CheckCircle2Icon = CheckCircle2Icon;
  readonly XCircleIcon = XCircleIcon;

  user: UserResponse | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isLoadingProfile = false;
  isSavingProfile = false;
  isSavingPassword = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  private loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.user = res.data!;
        this.profileForm.patchValue({
          fullName: this.user.fullName,
          email: this.user.email,
          phone: this.user.phone || '',
        });
        this.isLoadingProfile = false;
      },
      error: () => {
        this.showNotification('Failed to load profile', 'error');
        this.isLoadingProfile = false;
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;

    this.profileService.updateMyProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.user = res.data!;
        this.showNotification('Profile updated successfully', 'success');
        this.isSavingProfile = false;
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Failed to update profile', 'error');
        this.isSavingProfile = false;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.showNotification('New password and confirm password do not match', 'error');
      return;
    }

    this.isSavingPassword = true;

    this.profileService.changeMyPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.showNotification('Password changed successfully', 'success');
        this.passwordForm.reset();
        this.isSavingPassword = false;
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Failed to change password', 'error');
        this.isSavingPassword = false;
      },
    });
  }

  getInitial(): string {
    return this.user?.fullName?.charAt(0).toUpperCase() || 'U';
  }

  getRoleBadgeClass(): string {
    switch (this.user?.role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'MARKETING_MANAGER':
        return 'bg-amber-100 text-amber-800';
      case 'MARKETING_TEAM':
        return 'bg-emerald-100 text-emerald-800';
      case 'BOD':
        return 'bg-violet-100 text-violet-800';
      case 'CLIENT':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatRole(): string {
    return this.user?.role?.replace(/_/g, ' ') || '';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
