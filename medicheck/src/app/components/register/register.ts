import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { User } from '../../models/interfaces';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveSessionData } from '../../utils/session';

@Component({
  selector: 'app-register',
  templateUrl: './register.html', // Aquí iría tu formulario HTML
  styleUrl: './register.css', // Aquí irían tus estilos CSS
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

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    localStorage.clear();
    this.authService.register(this.nuevoUsuario).subscribe({
      next: (res) => {
        console.log('¡Éxito!', res);
        alert('Usuario registrado correctamente');

        const token = res?.token ?? '';
        const userId = res?.user?.id?.toString();
        const userName = res?.user?.name;

        saveSessionData({ token, userId, userName });

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al registrar', err);
        alert('Hubo un problema con el registro');
      }
    });
  }
}