import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TomaDetalle {
  toma_id:             number;
  tratamiento_nombre:  string;
  nombre_comercial:    string;
  principio_activo:    string;
  concentracion:       string;
  tipo:                string;
  fecha:               string;   // 'YYYY-MM-DD'
  hora_programada:     string;   // 'HH:MM'
  verificado:          boolean;
  hora_real:           string | null;
  fecha_real:          string | null;
}

interface DiaAgrupado {
  fecha:       string;   // 'YYYY-MM-DD'
  fechaTexto:  string;   // 'lunes 23 de junio'
  tomas:       TomaDetalle[];
}

@Component({
  selector: 'app-detalle-tratamiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-tratamiento.html',
  styleUrl:    './detalle-tratamiento.css'
})
export class DetalleTratamientoComponent implements OnInit {

  tratamientoId    = 0;
  nombreTratamiento = '';
  medicamento       = '';
  concentracion     = '';

  dias:     DiaAgrupado[] = [];
  cargando  = true;

  // Estadísticas rápidas
  totalTomas      = 0;
  tomasVerificadas = 0;
  porcentaje       = 0;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tratamientoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.tratamientoId) {
      this.router.navigate(['/historial']);
      return;
    }
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    this.cargando = true;
    this.http
      .get<TomaDetalle[]>(
        `http://localhost:3000/api/tomas/tratamiento/${this.tratamientoId}/detalle`
      )
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.nombreTratamiento = data[0].tratamiento_nombre;
            this.medicamento       = `${data[0].nombre_comercial} — ${data[0].principio_activo}`;
            this.concentracion     = data[0].concentracion;
          }
          this.calcularEstadisticas(data);
          this.dias     = this.agruparPorDia(data);
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Agrupa las tomas por día para la línea de tiempo ────────
  private agruparPorDia(tomas: TomaDetalle[]): DiaAgrupado[] {
    const mapa = new Map<string, TomaDetalle[]>();

    for (const t of tomas) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, []);
      mapa.get(t.fecha)!.push(t);
    }

    return Array.from(mapa.entries()).map(([fecha, tomasDelDia]) => ({
      fecha,
      fechaTexto: this.formatearFechaDia(fecha),
      tomas: tomasDelDia
    }));
  }

  private calcularEstadisticas(tomas: TomaDetalle[]): void {
    this.totalTomas       = tomas.length;
    this.tomasVerificadas = tomas.filter(t => t.verificado).length;
    this.porcentaje       = this.totalTomas > 0
      ? Math.round((this.tomasVerificadas / this.totalTomas) * 100)
      : 0;
  }

  // ── Helpers de formato ───────────────────────────────────────
  formatearFechaDia(fecha: string): string {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Si la toma se tomó tarde respecto a la hora programada
  tomadaTarde(toma: TomaDetalle): boolean {
    if (!toma.verificado || !toma.hora_real || !toma.hora_programada) return false;
    return toma.hora_real > toma.hora_programada;
  }

  getColorBarra(): string {
    if (this.porcentaje >= 80) return '#2ecc71';
    if (this.porcentaje >= 50) return '#f39c12';
    return '#e74c3c';
  }

  // Si es hoy
  esHoy(fecha: string): boolean {
    const hoy = new Date();
    const [y, m, d] = fecha.split('-').map(Number);
    return (
      hoy.getFullYear() === y &&
      hoy.getMonth() + 1 === m &&
      hoy.getDate() === d
    );
  }

  esFuturo(fecha: string): boolean {
    const hoy  = new Date(); hoy.setHours(0,0,0,0);
    const [y, m, d] = fecha.split('-').map(Number);
    return new Date(y, m - 1, d) > hoy;
  }

  volver(): void { this.router.navigate(['/historial']); }
}