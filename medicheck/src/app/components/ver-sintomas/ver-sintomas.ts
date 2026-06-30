import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SintomasService, RegistroSintoma } from '../../services/sintomas.service';

type OrdenDir = 'asc' | 'desc';

@Component({
  selector: 'app-ver-sintomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-sintomas.html',
  styleUrl:    './ver-sintomas.css'
})
export class VerSintomasComponent implements OnInit {

  historial:  RegistroSintoma[] = [];
  cargando  = true;
  orden: OrdenDir = 'desc';

  editandoItem:    RegistroSintoma | null = null;
  nuevaIntensidad: number = 5;
  guardando = false;

  eliminandoItem:  RegistroSintoma | null = null;
  eliminando = false;

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

  // ── Cambiar dirección de orden y recargar ────────────────────
  cambiarOrden(dir: OrdenDir): void {
    if (this.orden === dir) return;
    this.orden = dir;
    this.cargarHistorial();
  }

  // ── Formatear fecha 'YYYY-MM-DD' → 'DD de mes YYYY' ─────────
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    // Evitamos problemas de zona horaria parseando manualmente
    const [year, month, day] = fecha.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-CL', {
      day:   '2-digit',
      month: 'long',
      year:  'numeric'
    });
  }

  // ── Color según intensidad ───────────────────────────────────
  getColorIntensidad(intensidad: number): string {
    if (intensidad <= 3)  return '#2ecc71';
    if (intensidad <= 6)  return '#f39c12';
    return '#e74c3c';
  }

  getEtiqueta(intensidad: number): string {
    if (intensidad <= 2)  return 'Muy leve';
    if (intensidad <= 4)  return 'Leve';
    if (intensidad <= 6)  return 'Moderado';
    if (intensidad <= 8)  return 'Intenso';
    return 'Muy intenso';
  }

  // ── Edición ──────────────────────────────────────────────────
  abrirEditar(item: RegistroSintoma): void {
    this.editandoItem    = item;
    this.nuevaIntensidad = item.intensidad;
  }

  cerrarModal(): void {
    if (this.guardando) return;
    this.editandoItem = null;
  }

  guardarEdicion(): void {
    if (!this.editandoItem || this.guardando) return;
    this.guardando = true;

    this.sintomasService.actualizar(this.editandoItem.id, this.nuevaIntensidad).subscribe({
      next: () => {
        this.editandoItem!.intensidad = this.nuevaIntensidad;
        this.guardando    = false;
        this.editandoItem = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
      }
    });
  }

  // ── Eliminación ──────────────────────────────────────────────
  abrirConfirmEliminar(item: RegistroSintoma): void {
    this.eliminandoItem = item;
  }

  cerrarConfirmEliminar(): void {
    if (this.eliminando) return;
    this.eliminandoItem = null;
  }

  confirmarEliminar(): void {
    if (!this.eliminandoItem || this.eliminando) return;
    this.eliminando = true;

    this.sintomasService.eliminar(this.eliminandoItem.id).subscribe({
      next: () => {
        this.historial = this.historial.filter(i => i.id !== this.eliminandoItem!.id);
        this.eliminando     = false;
        this.eliminandoItem = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.eliminando = false;
      }
    });
  }

  // ── Navegación ───────────────────────────────────────────────
  volver(): void { this.router.navigate(['/home']); }
  registrarNuevo(): void { this.router.navigate(['/registrar-sintomas']); }
}