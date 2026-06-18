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
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  userId: string | null = null;
  token: string | null = null;
  
  TratamientosActivos: any[] = []; 

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.username = localStorage.getItem('user_name');
    this.token = localStorage.getItem('token');
    this.userId = localStorage.getItem('user_id');

    if (this.userId) {
      this.authService.getTreatments(this.userId).subscribe({
        next: (res)=>{
          this.TratamientosActivos = res.treatments;
          console.log('Tratamientos obtenidos correctamente.')
        },
        error: (err)=>{
          console.error('Error al obtener tratamientos', err)
          alert('Hubo un error al obtener los tratamientos.')
        }
      });
    }
  }  
}