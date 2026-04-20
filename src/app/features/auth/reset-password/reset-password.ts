import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ResetPasswordRequest } from '../../../core/models/entity/auth.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  tokenValid = signal(false);
  tokenChecking = signal(true);
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.tokenValid.set(false);
      this.tokenChecking.set(false);
      return;
    }

    this.authService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.tokenValid.set(response.data || false);
        this.tokenChecking.set(false);
      },
      error: () => {
        this.tokenValid.set(false);
        this.tokenChecking.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const request: ResetPasswordRequest = {
      token: this.token,
      ...this.resetPasswordForm.value,
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastService.success(response.message || 'Password has been reset successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error(error.error?.message || 'Failed to reset password');
      },
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.resetPasswordForm.errors?.['passwordMismatch'] && this.confirmPassword?.touched;
  }
}
