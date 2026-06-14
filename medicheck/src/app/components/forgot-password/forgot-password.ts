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
  mensajeExito: boolean = false;
  mensajeError: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) return;

    this.enviando = true;
    this.mensajeError = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.enviando = false;
        this.mensajeExito = true;
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError = 'Ocurrió un error al intentar enviar el correo.';
        console.error(err);
      }
    });
  }
}