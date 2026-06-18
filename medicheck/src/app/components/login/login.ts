import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 1. Importamos el Router
import { AuthService } from '../../services/auth';
import { User } from '../../models/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
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
        localStorage.clear();
        this.authService.login(this.credencial).subscribe({
            next: (res) => {
                console.log("Respuesta del login:", res);

                localStorage.setItem('token', res.token); 
        
                localStorage.setItem('user_id', res.user.id.toString()); 
            
                if (res.user.name) {
                  localStorage.setItem('user_name', res.user.name);
                }
                
                alert('Inicio de sesio exitoso')
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
}
