import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule]
})
export class ForgotComponent {
  email: string = '';
  enviando: boolean = false;
  enviado: boolean = false;
  mensajeExito: boolean = false;
  mensajeError: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email || this.enviando || this.enviado) return;

    this.enviando = true;
    this.mensajeExito = false;
    this.mensajeError = '';

    const inicio = Date.now();

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        const espera = Math.max(0, 1000 - (Date.now() - inicio));
        setTimeout(() => {
          this.enviando = false;
          this.enviado = true;
          this.mensajeExito = true;
        }, espera);
      },
      error: (err) => {
        const espera = Math.max(0, 2000 - (Date.now() - inicio));
        setTimeout(() => {
          this.enviando = false;
          if (err.status === 404) {
            this.mensajeError = 'El correo ingresado no está registrado en el sistema.';
          } else {
            this.mensajeError = 'No se pudo enviar el correo. Intenta nuevamente más tarde.';
          }
        }, espera);
      }
    });
  }
}