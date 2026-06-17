import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './form-new-password.html',
  styleUrls: ['./form-new-password.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule]
})
export class ResetComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  
  // Variable extra para guardar el código de seguridad
  token: string | null = null; 

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit() {
    // Esto extrae el valor de "?token=" de la URL al instante
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.mensajeError = 'Enlace de seguridad inválido o inexistente. Por favor solicita uno nuevo.';
    }
  }

  onReset() {
    // Limpiamos mensajes previos
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.token) {
      this.mensajeError = 'No se puede procesar sin un token de seguridad válido.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    
    // Conectamos con el backend a través de tu servicio
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensajeExito = '¡Contraseña actualizada con éxito! Redirigiendo al inicio...';
        
        // Un pequeño retraso de 2 segundos para que el usuario alcance a leer el éxito
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al resetear la clave:', err);
        // Si el token expiró o ya se usó, mostramos el mensaje que nos manda Postgres
        this.mensajeError = err.error?.error || 'Ocurrió un error al actualizar la contraseña.';
      }
    });
  }
}