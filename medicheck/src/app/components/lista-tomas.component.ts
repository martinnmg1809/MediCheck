import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-tomas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './lista-tomas.component.html',
  styleUrls: ['./lista-tomas.component.css']
})
export class ListaTomasComponent implements OnInit {
  medicamentos: any[] = [];
  medicamentosFiltrados: any[] = [];
  cargandoInicial: boolean = true;
  usuarioId: number = 0; // Se inicializa en 0 hasta confirmar sesión
  
  diasSemana: any[] = [];
  diaSeleccionado: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Recuperamos el ID del usuario desde el almacenamiento del navegador
    const idGuardado = localStorage.getItem('user_id');
    
    if (idGuardado) {
      this.usuarioId = parseInt(idGuardado, 10);
      this.generarDiasSemana();
      this.cargarLista();
    } else {
      // Redirección de seguridad si intenta ingresar sin loguearse
      alert('Por favor, inicia sesión para acceder a tu horario.');
      this.router.navigate(['/login']); 
    }
  }

  // Genera los próximos 7 días para el menú desplegable en el formato correcto
  generarDiasSemana(): void {
    const hoy = new Date();
    for (let i = 0; i < 7; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      
      // Evitamos desfases de zona horaria al extraer la fecha local YYYY-MM-DD
      const offset = fecha.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(fecha.getTime() - offset)).toISOString().split('T')[0];
      
      const nombreDia = i === 0 ? 'Hoy' : fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
      
      this.diasSemana.push({ nombre: nombreDia, valor: localISOTime });
    }
    this.diaSeleccionado = this.diasSemana[0].valor; 
  }

  cargarLista(): void {
    this.cargandoInicial = true;
    this.http.get<any[]>(`http://localhost:3000/api/tomas/usuario/${this.usuarioId}/historial`).subscribe({
      next: (data) => {
        this.medicamentos = data;
        this.filtrarPorDia(); 
        this.cargandoInicial = false;
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
        this.cargandoInicial = false;
      }
    });
  }

  filtrarPorDia(): void {
    // Filtra la lista total comparando las cadenas de fecha YYYY-MM-DD
    this.medicamentosFiltrados = this.medicamentos.filter(item => {
      return item.fecha_exacta === this.diaSeleccionado;
    });
  }

  marcarTomado(tomaId: number): void {
    this.http.put(`http://localhost:3000/api/tomas/verificar/${tomaId}`, {}).subscribe({
      next: () => {
        // Recargamos la lista para actualizar los estados visuales instantáneamente
        this.cargarLista();
      },
      error: (err) => {
        console.error('Error al verificar toma:', err);
        alert('No se pudo registrar la toma médica.');
      }
    });
  }

  irACrear(): void {
    this.router.navigate(['/create']);
  }
}