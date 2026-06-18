import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  if (token && userId) {
    return true; // Todo en orden, deja que la vista cargue
  } else {
    alert('Acceso denegado. Por favor, inicia sesión.');
    router.navigate(['/login']);
    return false; // Bloquea el acceso ANTES de cargar el HTML
  }
};