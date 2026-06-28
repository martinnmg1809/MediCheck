import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/interfaces';
import { FormsModule } from '@angular/forms';
import { hasValidSession, saveSessionData } from '../../utils/session';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
    standalone: true,
    imports: [FormsModule, RouterLink]
})
export class LoginComponent {
    credencial: Pick<User, 'email' | 'password'> = {
        email: '',
        password: ''
    };

    constructor(private authService: AuthService, private router: Router) {
        if (hasValidSession()) {
            this.router.navigate(['/home']);
        }
    }

    onLogin() {
        const email = this.credencial.email?.trim() ?? '';
        const password = this.credencial.password?.trim() ?? '';

        if (!email || !password) {
            alert('Completa tu correo y contraseña para iniciar sesión.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Ingresa un correo electrónico válido.');
            return;
        }

        localStorage.clear();
        this.authService.login({ email, password }).subscribe({
            next: (res) => {
                const token = res?.token?.trim() ?? '';
                const userId = res?.user?.id?.toString();
                const userName = res?.user?.name;

                if (!token || !userId) {
                    alert('No se pudo iniciar sesión. Intenta nuevamente.');
                    return;
                }

                saveSessionData({ token, userId, userName });
                alert('Inicio de sesión exitoso');
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                const message = err?.error?.error || 'Hubo un problema con el inicio de sesión';
                alert(message);
            }
        });
    }
}
