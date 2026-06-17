import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
// Importa tu servicio para luego poder hacer la petición HTTP
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: '../../app.css'
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  userId: string | null = null;
  token: string | null = null;
  
  proximosMedicamentos: any[] = []; 

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.username = localStorage.getItem('user_name');
    this.token = localStorage.getItem('token');
    this.userId = localStorage.getItem('user_id');

    if (this.userId) {
      this.cargarMedicamentos();
    }
  }

  cargarMedicamentos() {
    // Aquí es donde Angular se comunicará con tu ruta de Node.js
    // Ejemplo de cómo quedará una vez que conectes tu servicio:
    /*
    this.authService.getMedications(this.userId).subscribe({
      next: (res) => {
        this.proximosMedicamentos = res.medications;
      },
      error: (err) => console.error(err)
    });
    */
    console.log("Listo para pedirle al backend los medicamentos del usuario:", this.userId);
  }
}