import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/interfaces';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './styles/forgot-password.css', 
  standalone: true,
  imports: [FormsModule]
})
export class forgotComponent {
    credencial: Pick<User, 'email'> = {
        email: ''
    };

    // Esta es la función que Angular estaba buscando
    onSubmit() {
        if (!this.credencial.email) {
            alert('Por favor ingresa un correo electrónico.');
            return;
        }
        
        console.log('Enviando solicitud de recuperación para:', this.credencial.email);
        
        // Más adelante conectaremos esto con el backend (authService)
        alert('Si el correo existe, recibirás instrucciones para recuperar tu contraseña.');
    }
}