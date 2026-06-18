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
        this.authService.login(this.credencial).subscribe({
            next: (res) => {
                // 1. Imprime la respuesta para asegurarte de qué te manda el backend
                console.log("Respuesta del login:", res);

                // 2. Guardamos las llaves con los NOMBRES EXACTOS que busca el Guardia
                // (Ajusta 'res.token' o 'res.user.id' dependiendo de cómo lo envíe tu backend)
                localStorage.setItem('token', res.token); 
        
                // Es importante convertir el ID a texto (toString) porque localStorage solo guarda strings
                localStorage.setItem('user_id', res.user.id.toString()); 
            
                if (res.user.name) {
                  localStorage.setItem('user_name', res.user.name);
                }
                
                alert('Inicio de sesio exitoso')
                // 3. AHORA SÍ, con las llaves guardadas, le pedimos al router que viaje al home
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Error al iniciar sesión', err);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
}
