import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SintomasService } from '../../services/sintomas.service';

@Component({
  selector: 'app-editar-sintoma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editar-sintoma.html',
  styleUrl: './editar-sintoma.css'
})
export class EditarSintomaComponent implements OnInit {
  registroId = 0;
  intensidad = 5;
  datosSintoma: any = null;
  cargando = true;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sintomasService: SintomasService
  ) {}

  ngOnInit(): void {
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.registroId) {
      this.volver();
      return;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.sintomasService.getRegistroById(this.registroId).subscribe({
      next: (data) => {
        this.datosSintoma = data;
        this.intensidad = data.intensidad;
        this.cargando = false;
      },
      error: () => {
        this.volver(); // Si falla, lo devolvemos al historial
      }
    });
  }

  setIntensidad(valor: number): void {
    this.intensidad = valor;
  }

  getColorIntensidad(): string {
    if (this.intensidad <= 3) return '#2ecc71';
    if (this.intensidad <= 6) return '#f39c12';
    return '#e74c3c';
  }

  getEtiquetaIntensidad(): string {
    if (this.intensidad <= 2) return 'Muy leve';
    if (this.intensidad <= 4) return 'Leve';
    if (this.intensidad <= 6) return 'Moderado';
    if (this.intensidad <= 8) return 'Intenso';
    return 'Muy intenso';
  }

  guardar(): void {
    this.guardando = true;
    this.sintomasService.actualizarIntensidad(this.registroId, this.intensidad).subscribe({
      next: () => {
        this.volver(); // Lo devolvemos al historial al terminar
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        this.guardando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/ver-sintomas']);
  }
}