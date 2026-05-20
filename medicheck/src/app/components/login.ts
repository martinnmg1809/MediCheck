import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { User } from '../models/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    standalone: true,
    imports: [FormsModule]
})

export class LoginComponent {
    credencial: Pick<User, 'email' | 'password'> = {
        email: '',
        password: ''
    };

    constructor(private authService: AuthService) {}

    onLogin() {
        this.authService.login(this.credencial).subscribe({
            next: (res) => {
                console.log('¡Éxito!', res);
                alert('Inicio de sesión exitoso');
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
}