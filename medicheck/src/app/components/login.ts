import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 1. Importamos el Router
import { AuthService } from '../services/auth';
import { User } from '../models/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './styles/login.css',
    standalone: true,
    imports: [FormsModule]
})
export class LoginComponent {
    credencial: Pick<User, 'email' | 'password'> = {
        email: '',
        password: ''
    };

    // 2. Inyectamos el Router en el constructor
    constructor(private authService: AuthService, private router: Router) {}

    onLogin() {
        this.authService.login(this.credencial).subscribe({
            next: (res: any) => { // Puse 'any' para evitar errores de TypeScript al leer las propiedades
                console.log('¡Éxito!', res);
                
                // 3. Guardamos el token en el navegador (ajusta 'res.token' según lo que envíe tu backend)
                if (res.token) {
                    localStorage.setItem('token', res.token);
                }

                // 4. Guardamos el user_id. 
                // Ajusta 'res.usuario.id' o 'res.id' dependiendo de cómo tu backend envía los datos del usuario.
                if (res.usuario && res.usuario.id) {
                    localStorage.setItem('user_id', res.usuario.id.toString());
                } else if (res.user && res.user.id) {
                    localStorage.setItem('user_id', res.user.id.toString());
                } else if (res.id) {
                    localStorage.setItem('user_id', res.id.toString());
                }

                alert('Inicio de sesión exitoso');
                
                // 5. Redirigimos al usuario a la vista de agregar medicamentos
                this.router.navigate(['/agregar-medicamento']);
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
}