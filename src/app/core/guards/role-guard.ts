import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/enums/enums.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Role[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasAccess = authService.hasAnyRole(requiredRoles);

  if (hasAccess) {
    return true;
  }

  const currentRole = authService.getCurrentRole();
  if (currentRole) {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
