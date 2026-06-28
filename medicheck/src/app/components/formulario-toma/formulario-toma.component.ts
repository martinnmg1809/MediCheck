import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-toma',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './formulario-toma.component.html',
  styleUrls: ['./formulario-toma.component.css']
})
export class FormularioTomaComponent implements OnInit {
  medicamentos: any[] = [];
  filtroTexto: string = '';
  medicamentoSeleccionado: string = '';
  nuevoHorario: string = '08:00';
  frecuencia: number = 8;
  duracionDias: number = 7;
  usuarioId: number = 0; 
  agregando: boolean = false;
  tratamiento: string ='';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('user_id');
    
    if (idGuardado) {
      this.usuarioId = parseInt(idGuardado, 10);
    } else {
      alert('Sesión expirada o inválida. Por favor inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    // Carga el catálogo maestro de medicamentos disponibles
    this.http.get<any[]>('http://192.168.100.14:3000/api/medicamentos').subscribe({
      next: (data) => this.medicamentos = data,
      error: (err) => console.error('Error cargando catálogo de medicamentos:', err)
    });
  }

  filtrarMedicamentos(): any[] {
    if (!this.filtroTexto) return this.medicamentos;
    return this.medicamentos.filter(m => 
      m.nombre_comercial.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      m.principio_activo.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  crearTratamiento(): void {
    if (!this.medicamentoSeleccionado) {
      alert('Por favor selecciona un medicamento de la lista.');
      return;
    }
    if (!this.tratamiento) {
      alert('Por favor especifica el tratamiento correspondiente.')
      return;
    }
    console.log(this.tratamiento)

    this.agregando = true;
    const datos = {
      user_id: this.usuarioId,
      medicamento_id: parseInt(this.medicamentoSeleccionado, 10),
      tratamiento: this.tratamiento,
      horario_inicio: this.nuevoHorario,
      frecuencia_horas: this.frecuencia,
      duracion_dias: this.duracionDias
    };

    this.http.post('http://192.168.100.14:3000/api/tomas', datos).subscribe({
      next: () => {
        this.agregando = false;
        this.router.navigate(['/list']);
      },
      error: (err) => {
        console.error('Error en el envío del tratamiento:', err);
        console.log(datos)
        alert('Hubo un error al procesar y guardar las tomas futuras.');
        this.agregando = false;
      }
    });
  }

  irALista(): void {
    this.router.navigate(['/list']);
  }
}