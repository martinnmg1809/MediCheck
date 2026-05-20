import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { User } from '../models/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html', // Aquí iría tu formulario HTML
  standalone: true,
  imports: [FormsModule]
})

export class RegisterComponent {
  // Objeto que se vincula al formulario HTML
  nuevoUsuario: User = {
    name: '',
    email: '',
    password: '',
    role: "paciente"
  };

  constructor(private authService: AuthService) {}

  onRegister() {
    this.authService.register(this.nuevoUsuario).subscribe({
      next: (res) => {
        console.log('¡Éxito!', res);
        alert('Usuario registrado correctamente');
      },
      error: (err) => {
        console.error('Error al registrar', err);
        alert('Hubo un problema con el registro');
      }
    });
  }
}