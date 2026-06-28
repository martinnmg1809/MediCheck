import { Component } from '@angular/core';
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
  imports: [FormsModule, RouterLink]
})

export class RegisterComponent {
  nuevoUsuario: User = {
    name: '',
    email: '',
    password: '',
    role: 'paciente'
  };

  constructor(private authService: AuthService, private router: Router) {
    if (hasValidSession()) {
      this.router.navigate(['/home']);
    }
  }

  onRegister() {
    const name = this.nuevoUsuario.name?.trim() ?? '';
    const email = this.nuevoUsuario.email?.trim().toLowerCase() ?? '';
    const password = this.nuevoUsuario.password?.trim() ?? '';

    if (!name || !email || !password) {
      alert('Completa todos los campos para crear tu cuenta.');
      return;
    }

    if (name.length < 3) {
      alert('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    localStorage.clear();
    this.authService.register({ ...this.nuevoUsuario, name, email, password }).subscribe({
      next: (res) => {
        const token = res?.token?.trim() ?? '';
        const userId = res?.user?.id?.toString();
        const userName = res?.user?.name;

        if (!token || !userId) {
          alert('No se pudo completar el registro. Intenta nuevamente.');
          return;
        }

        saveSessionData({ token, userId, userName });
        alert('Usuario registrado correctamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al registrar', err);
        const message = err?.error?.error || 'Hubo un problema con el registro';
        alert(message);
      }
    });
  }
}