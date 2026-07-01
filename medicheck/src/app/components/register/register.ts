import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '../../models/interfaces';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { hasValidSession, saveSessionData } from '../../utils/session';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})

export class RegisterComponent {
  nuevoUsuario: User = {
    name: '',
    email: '',
    password: '',
    role: 'paciente'
  };
  errorMsg: string = '';

  constructor(private authService: AuthService, private router: Router) {
    if (hasValidSession()) {
      this.router.navigate(['/home']);
    }
  }

  onRegister() {
    this.errorMsg = '';
    const name = this.nuevoUsuario.name?.trim() ?? '';
    const email = this.nuevoUsuario.email?.trim().toLowerCase() ?? '';
    const password = this.nuevoUsuario.password?.trim() ?? '';

    if (!name || !email || !password) {
      this.errorMsg = 'Completa todos los campos para crear tu cuenta.';
      return;
    }

    if (name.length < 3) {
      this.errorMsg = 'El nombre debe tener al menos 3 caracteres.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMsg = 'Ingresa un correo electrónico válido.';
      return;
    }

    if (password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    localStorage.clear();
    this.authService.register({ ...this.nuevoUsuario, name, email, password }).subscribe({
      next: (res) => {
        const token = res?.token?.trim() ?? '';
        const userId = res?.user?.id?.toString();
        const userName = res?.user?.name;

        if (!token || !userId) {
          this.errorMsg = 'No se pudo completar el registro. Intenta nuevamente.';
          return;
        }

        saveSessionData({ token, userId, userName });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al registrar', err);
        this.errorMsg = err?.error?.error || 'Hubo un problema con el registro.';
      }
    });
  }
}