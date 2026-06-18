import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core'; // <-- 1. Añadimos Inject y PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- 2. Añadimos isPlatformBrowser
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
  usuarioId: number = 0; 
  
  diasSemana: any[] = [];
  diaSeleccionado: string = '';

  // 3. Inyectamos el PLATFORM_ID en el constructor
  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // 1. Generamos los días inmediatamente para que el HTML dibuje las opciones desde ya
    this.generarDiasSemana();

    if (isPlatformBrowser(this.platformId)) {
      const idGuardado = localStorage.getItem('user_id');
      
      if (idGuardado) {
        this.usuarioId = parseInt(idGuardado, 10);
        this.cargarLista();
      } else {
        alert('Por favor, inicia sesión para acceder a tu horario.');
        this.router.navigate(['/login']); 
      }
    }
  }

  generarDiasSemana(): void {
    this.diasSemana = []; // Limpiamos el arreglo por seguridad
    const hoy = new Date();
    
    // Configuramos un formateador nativo con la zona horaria de Chile
    const formateadorFecha = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    for (let i = 0; i < 7; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      
      // Formatea a "DD-MM-YYYY" respetando la zona horaria de Chile
      const partes = formateadorFecha.format(fecha).split('-');
      // Lo transformamos a "YYYY-MM-DD" para que sea idéntico al TO_CHAR de tu base de datos
      const localISOTime = `${partes[2]}-${partes[1]}-${partes[0]}`;
      
      const nombreDia = i === 0 ? 'Hoy' : fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric' });
      
      this.diasSemana.push({ 
        nombre: nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1), // Primera letra en mayúscula
        valor: localISOTime 
      });
    }

    // Aseguramos que el día seleccionado por defecto sea el primero de la lista ('Hoy')
    this.diaSeleccionado = this.diasSemana[0].valor; 
  }

 cargarLista(): void {
    this.cargandoInicial = true;
    this.http.get<any[]>(`http://localhost:3000/api/tomas/usuario/${this.usuarioId}/historial`).subscribe({
      next: (data) => {
        this.medicamentos = data;

        // SOLUCIÓN PARCHE: Si hay datos y las tomas son antiguas, 
        // obligamos a la app a mirar el día del primer medicamento devuelto
        if (this.medicamentos.length > 0) {
          const tieneTomasParaHoy = this.medicamentos.some(item => item.fecha_exacta === this.diaSeleccionado);
          
          // Si no hay nada programado para hoy, muéstrame el día de la primera toma disponible
          if (!tieneTomasParaHoy) {
            this.diaSeleccionado = this.medicamentos[0].fecha_exacta;
          }
        }

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
    // 1. Diagnóstico de variables globale
    if (!this.diaSeleccionado && this.diasSemana.length > 0) {
      this.diaSeleccionado = this.diasSemana[0].valor;
    }

    // 2. Ejecutar el filtro
    this.medicamentosFiltrados = this.medicamentos.filter(item => {
      return item.fecha_exacta === this.diaSeleccionado;
    });

   
  }

  marcarTomado(tomaId: number): void {
    this.http.put(`http://localhost:3000/api/tomas/verificar/${tomaId}`, {}).subscribe({
      next: () => {
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