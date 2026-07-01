import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../config/api.config';
import { contienePalabraBaneada } from '../../utils/palabras-ban';

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
  medicamentoInfo: any = null;
  nuevoHorario: string = '08:00';
  frecuencia: number = 8;
  duracionDias: number = 7;
  usuarioId: number = 0;
  agregando: boolean = false;
  tratamiento: string = '';
  minutosPrueba: number | null = null;
  errorMsg: string = '';
  nombreBaneado: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

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
    this.http.get<any[]>(`${API_BASE_URL}/api/medicamentos`).subscribe({
      next: (data) => { this.medicamentos = data; this.cdr.detectChanges(); },
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

  // Se ejecuta al elegir un medicamento del select. Si es de alto riesgo,
  // bloquea la frecuencia al valor predefinido (el usuario solo elige la primera toma).
  actualizarMedicamentoInfo(): void {
    const id = parseInt(this.medicamentoSeleccionado, 10);
    this.medicamentoInfo = this.medicamentos.find(m => m.id === id) || null;

    if (this.medicamentoInfo?.es_riesgo) {
      this.frecuencia = this.medicamentoInfo.frecuencia_horas_fija;
    }
  }

  get esRiesgo(): boolean {
    return !!this.medicamentoInfo?.es_riesgo;
  }

  private calcularPrimeraDosisISO(): string {
    if (this.minutosPrueba && this.minutosPrueba > 0) {
      return new Date(Date.now() + this.minutosPrueba * 60_000).toISOString();
    }
    const [hh, mm] = this.nuevoHorario.split(':');
    const candidata = new Date();
    candidata.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    if (candidata <= new Date()) {
      candidata.setDate(candidata.getDate() + 1);
    }
    return candidata.toISOString();
  }

  validarTratamiento(): void {
    this.nombreBaneado = contienePalabraBaneada(this.tratamiento);
  }

  crearTratamiento(): void {
    this.errorMsg = '';
    if (!this.medicamentoSeleccionado) {
      this.errorMsg = 'Por favor selecciona un medicamento de la lista.';
      return;
    }
    if (!this.tratamiento) {
      this.errorMsg = 'Por favor especifica el tratamiento correspondiente.';
      return;
    }
    if (this.nombreBaneado) {
      this.errorMsg = 'El nombre del tratamiento contiene términos no permitidos.';
      return;
    }
    if (!this.frecuencia || this.frecuencia <= 0) {
      this.errorMsg = 'La frecuencia debe ser un número mayor a 0.';
      return;
    }
    if (!this.duracionDias || this.duracionDias <= 0) {
      this.errorMsg = 'La duración debe ser al menos 1 día.';
      return;
    }

    this.agregando = true;
    const datos = {
      user_id: this.usuarioId,
      medicamento_id: parseInt(this.medicamentoSeleccionado, 10),
      tratamiento: this.tratamiento,
      horario_inicio_iso: this.calcularPrimeraDosisISO(),
      frecuencia_horas: this.frecuencia,
      duracion_dias: this.duracionDias
    };

    this.http.post(`${API_BASE_URL}/api/tomas`, datos).subscribe({
      next: () => {
        this.agregando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/list']);
      },
      error: (err) => {
        console.error('Error en el envío del tratamiento:', err);
        this.errorMsg = err?.error?.error || 'Hubo un error al procesar y guardar las tomas futuras.';
        this.agregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  irALista(): void {
    this.router.navigate(['/list']);
  }
}