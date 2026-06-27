import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { clearSessionData } from '../../utils/session';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  userId: string | null = null;
  token: string | null = null;
  TratamientosActivos: any[] = [];
  proximaToma: any | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('user_name');
    this.token    = localStorage.getItem('token');
    this.userId   = localStorage.getItem('user_id');

    if (this.userId) {
      this.authService.getTreatments(this.userId).subscribe({
        next: (res) => {
          this.TratamientosActivos = res.treatments;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener tratamientos', err)
      });

      this.authService.getUpcomingDoses(this.userId).subscribe({
        next: (doses) => {
          this.proximaToma = this.getNextPendingDose(doses);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener la próxima toma', err)
      });
    }
  }

  OnLogout() {
    clearSessionData();
    this.router.navigate(['/login']);
  }

  OnNew() { this.router.navigate(['/create']); }

  editarTratamiento(id: number)  { this.router.navigate(['/editar-tratamiento', id]); }

  eliminarTratamiento(id: number) {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tratamiento?')) {
      this.authService.eliminarTratamiento(id).subscribe({
        next: () => {
          this.TratamientosActivos = this.TratamientosActivos.filter((t: any) => t.id !== id);
          this.cdr.detectChanges();
        },
        error: () => console.error('No se pudo eliminar el tratamiento.')
      });
    }
  }

  irAHistorial()  { this.router.navigate(['/historial']); }

  /** NUEVO — navega al módulo de síntomas */
  irASintomas()   { this.router.navigate(['/registrar-sintomas']); }

  private getNextPendingDose(doses: any[]): any | null {
    const pendientes = (doses || [])
      .filter((d) => !d.verificado)
      .map((d) => ({
        ...d,
        fechaHora: this.parseDateTime(d.fecha_exacta, d.horario_programado)
      }))
      .filter((d) => d.fechaHora && d.fechaHora.getTime() > Date.now())
      .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());

    const siguiente = pendientes[0];
    if (!siguiente) return null;

    return { ...siguiente, resumen: this.getDoseSummary(siguiente.fechaHora) };
  }

  private parseDateTime(fecha: string, hora: string): Date | null {
    if (!fecha || !hora) return null;
    const parsed = new Date(`${fecha}T${hora}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private getDoseSummary(fechaHora: Date): string {
    const ahora     = Date.now();
    const diffHoras = Math.round((fechaHora.getTime() - ahora) / (1000 * 60 * 60));

    if (diffHoras > 0 && diffHoras <= 24)
      return `En ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`;

    if (diffHoras <= 0) return 'Hoy';

    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    if (fechaHora.toDateString() === mañana.toDateString())
      return `Mañana a las ${fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    return `${fechaHora.toLocaleDateString('es-ES', opciones)} a las ${fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }
}