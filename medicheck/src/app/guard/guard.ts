import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { hasValidSession } from '../utils/session';

export const authGuard = () => {
  const router = inject(Router);

  if (hasValidSession()) {
    return true;
  }

  alert('Acceso denegado. Por favor, inicia sesión.');
  router.navigate(['/login']);
  return false;
};