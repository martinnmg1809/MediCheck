import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../config/api.config';

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

  get esRiesgo(): boolean {
    return !!this.medicamentoInfo?.es_riesgo;
  }

  guardarCambios(): void {
    if (!this.formulario.tratamiento || !this.formulario.horario_inicio) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }
    this.guardando = true;
    this.error = '';

    this.http.put(
      `${API_BASE_URL}/api/tomas/tratamiento/${this.tratamientoId}`,
      this.formulario
    ).subscribe({
      next: () => {
        this.mensaje = '¡Tratamiento actualizado con éxito!';
        this.guardando = false;
        setTimeout(() => this.router.navigate(['/list']), 1500);
      },
      error: (err) => {
        this.error = 'Error al actualizar el tratamiento.';
        this.guardando = false;
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/list']);
  }
}