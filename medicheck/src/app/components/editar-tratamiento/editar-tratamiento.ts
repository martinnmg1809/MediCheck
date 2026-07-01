import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../config/api.config';
import { contienePalabraBaneada } from '../../utils/palabras-ban';

@Component({
  selector: 'app-editar-tratamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-tratamiento.html',
  styleUrl: './editar-tratamiento.css'
})
export class EditarTratamiento implements OnInit {
  tratamientoId: number = 0;
  guardando: boolean = false;
  mensaje: string = '';
  error: string = '';
  medicamentoInfo: any = null;
  minutosPrueba: number | null = null;
  nombreBaneado: boolean = false;

  formulario = {
    tratamiento: '',
    medicamento_id: 0,
    horario_inicio: '',
    frecuencia_horas: 8,
    duracion_dias: 7
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.tratamientoId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.cargarDatosTratamiento();
  }

  cargarDatosTratamiento(): void {
    this.http.get<any>(`${API_BASE_URL}/api/tomas/tratamiento/${this.tratamientoId}`).subscribe({
      next: (data) => {
        this.formulario.tratamiento = data.nombre;
        this.formulario.medicamento_id = data.medicamento_id;
        this.formulario.horario_inicio = data.horario_inicio || '';
        this.formulario.frecuencia_horas = data.frecuencia_horas || 8;
        this.formulario.duracion_dias = data.duracion_dias || 7;
        this.cargarInfoRiesgoMedicamento();
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos del tratamiento.';
      }
    });
  }

  // Consulta el catálogo para saber si el medicamento de este tratamiento es de
  // alto riesgo. Si lo es, fuerza la frecuencia al valor fijo predefinido y el
  // select de frecuencia queda bloqueado en el template.
  cargarInfoRiesgoMedicamento(): void {
    this.http.get<any[]>(`${API_BASE_URL}/api/medicamentos`).subscribe({
      next: (medicamentos) => {
        this.medicamentoInfo = medicamentos.find(m => m.id === this.formulario.medicamento_id) || null;
        if (this.medicamentoInfo?.es_riesgo) {
          this.formulario.frecuencia_horas = this.medicamentoInfo.frecuencia_horas_fija;
        }
      },
      error: (err) => console.error('Error cargando catálogo de medicamentos:', err)
    });
  }

  validarTratamiento(): void {
    this.nombreBaneado = contienePalabraBaneada(this.formulario.tratamiento);
  }

  get esRiesgo(): boolean {
    return !!this.medicamentoInfo?.es_riesgo;
  }

  private calcularPrimeraDosisISO(): string {
    if (this.minutosPrueba && this.minutosPrueba > 0) {
      return new Date(Date.now() + this.minutosPrueba * 60_000).toISOString();
    }
    const [hh, mm] = this.formulario.horario_inicio.split(':');
    const candidata = new Date();
    candidata.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    if (candidata <= new Date()) {
      candidata.setDate(candidata.getDate() + 1);
    }
    return candidata.toISOString();
  }

  guardarCambios(): void {
    if (!this.formulario.tratamiento || !this.formulario.horario_inicio) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }
    if (this.nombreBaneado) {
      this.error = 'El nombre del tratamiento contiene términos no permitidos.';
      return;
    }
    this.guardando = true;
    this.error = '';

    const payload = { ...this.formulario, horario_inicio_iso: this.calcularPrimeraDosisISO() };

    this.http.put(
      `${API_BASE_URL}/api/tomas/tratamiento/${this.tratamientoId}`,
      payload
    ).subscribe({
      next: () => {
        this.mensaje = '¡Tratamiento actualizado con éxito!';
        this.guardando = false;
        setTimeout(() => this.router.navigate(['/list']), 1500);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Error al actualizar el tratamiento.';
        this.guardando = false;
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/list']);
  }
}