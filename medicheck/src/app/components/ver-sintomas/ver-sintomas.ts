import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SintomasService, RegistroSintoma } from '../../services/sintomas.service';

type OrdenDir = 'asc' | 'desc';

@Component({
  selector: 'app-ver-sintomas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-sintomas.html',
  styleUrl:    './ver-sintomas.css'
})
export class VerSintomasComponent implements OnInit {

  historial: RegistroSintoma[] = [];
  cargando  = true;
  orden: OrdenDir = 'desc';

  private userId = 0;

  constructor(
    private sintomasService: SintomasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = typeof window !== 'undefined'
      ? window.localStorage.getItem('user_id')
      : null;

    if (!id || id === 'undefined' || id === 'null') {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = parseInt(id, 10);
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.sintomasService.getHistorial(this.userId, this.orden).subscribe({
      next: (data) => {
        this.historial = Array.isArray(data) ? data : [];
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historial = [];
        this.cargando  = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarOrden(dir: OrdenDir): void {
    if (this.orden === dir) return;
    this.orden = dir;
    this.cargarHistorial();
  }

  // Navega a la pantalla de edición con el id del registro
  editarSintoma(item: RegistroSintoma): void {
    this.router.navigate(['/editar-sintoma', item.id]);
  }

  // Elimina directamente sin modal
  eliminarSintoma(item: RegistroSintoma): void {
    this.sintomasService.eliminar(item.id).subscribe({
      next: () => {
        this.historial = this.historial.filter(h => h.id !== item.id);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  getColorIntensidad(intensidad: number): string {
    if (intensidad <= 3) return '#2ecc71';
    if (intensidad <= 6) return '#f39c12';
    return '#e74c3c';
  }

  getEtiqueta(intensidad: number): string {
    if (intensidad <= 2) return 'Muy leve';
    if (intensidad <= 4) return 'Leve';
    if (intensidad <= 6) return 'Moderado';
    if (intensidad <= 8) return 'Intenso';
    return 'Muy intenso';
  }

  volver(): void         { this.router.navigate(['/home']); }
  registrarNuevo(): void { this.router.navigate(['/registrar-sintomas']); }
}