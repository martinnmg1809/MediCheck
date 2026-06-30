import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  historial: any[] = [];
  cargando: boolean = true;
  usuarioId: number = 0;

  tratamientoExpandido: number | null = null;
  detalleTomas: { [id: number]: any[] } = {};
  cargandoDetalle: { [id: number]: boolean } = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idGuardado = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;

    if (!idGuardado || idGuardado === 'undefined' || idGuardado === 'null') {
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioId = Number.parseInt(idGuardado, 10);
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;

    this.http.get<any[]>(
      `http://localhost:3000/api/tomas/usuario/${this.usuarioId}/cumplimiento`
    ).subscribe({
      next: (data) => {
        this.historial = Array.isArray(data) ? data : [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.historial = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getColorCumplimiento(porcentaje: number): string {
    if (porcentaje >= 80) return '#2ecc71';
    if (porcentaje >= 50) return '#f39c12';
    return '#e74c3c';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin registros aún';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  toggleDetalle(tratamientoId: number): void {
    if (this.tratamientoExpandido === tratamientoId) {
      this.tratamientoExpandido = null;
      return;
    }
    this.tratamientoExpandido = tratamientoId;
    if (!this.detalleTomas[tratamientoId]) {
      this.cargandoDetalle[tratamientoId] = true;
      this.http.get<any[]>(
        `http://localhost:3000/api/tomas/tratamiento/${tratamientoId}/tomas`
      ).subscribe({
        next: (data) => {
          this.detalleTomas[tratamientoId] = data;
          this.cargandoDetalle[tratamientoId] = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.detalleTomas[tratamientoId] = [];
          this.cargandoDetalle[tratamientoId] = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  volver(): void {
    this.router.navigate(['/list']);
  }
}