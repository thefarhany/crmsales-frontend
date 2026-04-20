import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        const apiError = error.error;

        switch (error.status) {
          case 400:
            if (apiError?.data && typeof apiError.data === 'object') {
              const validationErrors = Object.values(apiError.data).join(', ');
              errorMessage = `${apiError.message}: ${validationErrors}`;
            } else {
              errorMessage = apiError?.message || 'Bad request';
            }
            break;

          case 401:
            errorMessage = apiError?.message || 'Unauthorized. Please login again.';

            authService.currentUser.set(null);
            authService.isAuthenticated.set(false);
            localStorage.removeItem('currentUser');
            router.navigate(['/login']);
            break;

          case 403:
            errorMessage = apiError?.message || 'Access denied. You do not have permission.';
            break;

          case 404:
            errorMessage = apiError?.message || 'Resource not found';
            break;

          case 500:
            errorMessage = apiError?.message || 'Internal server error. Please try again later.';
            break;

          case 0:
            errorMessage = 'Network error. Please check your connection or backend server.';
            break;

          default:
            errorMessage = apiError?.message || `Error: ${error.status} ${error.statusText}`;
        }
      }

      const skipToastUrls = ['/login', '/forgot-password', '/reset-password'];
      const shouldShowToast = !skipToastUrls.some((url) => req.url.includes(url));

      if (shouldShowToast && error.status !== 401) {
        toast.error(errorMessage);
      }

      return throwError(() => error);
    }),
  );
};
