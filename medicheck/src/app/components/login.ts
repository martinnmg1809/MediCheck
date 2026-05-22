import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { User } from '../models/interfaces';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

    constructor(private authService: AuthService, private router: Router) {}

    onLogin() {
        this.authService.login(this.credencial).subscribe({
            next: (res: any) => {
                console.log('¡Éxito!', res);
                
                // Guardamos el ID del usuario dinámicamente
                const idDelUsuario = res.user?.id || res.usuario?.id || res.id;
                
                if (idDelUsuario) {
                    localStorage.setItem('userId', idDelUsuario.toString());
                }

                alert('Inicio de sesión exitoso');
                this.router.navigate(['/create']);
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
}