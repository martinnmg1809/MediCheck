import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SintomasService, CatalogoSintoma } from '../../services/sintomas.service';

interface GrupoSintomas {
  categoria: string;
  sintomas: CatalogoSintoma[];
}

@Component({
  selector: 'app-registrar-sintomas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registrar-sintomas.html',
  styleUrl:    './registrar-sintomas.css'
})
export class RegistrarSintomasComponent implements OnInit {

  cargando  = true;
  guardando = false;
  exito     = false;

  grupos: GrupoSintomas[] = [];

  sintomaSeleccionado: CatalogoSintoma | null = null;
  intensidad = 5;

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
    this.cargarCatalogo();
  }

  private cargarCatalogo(): void {
    this.sintomasService.getCatalogo().subscribe({
      next: (lista) => {
        this.grupos   = this.agruparPorCategoria(lista);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private agruparPorCategoria(lista: CatalogoSintoma[]): GrupoSintomas[] {
    const mapa = new Map<string, CatalogoSintoma[]>();
    for (const s of lista) {
      if (!mapa.has(s.categoria)) mapa.set(s.categoria, []);
      mapa.get(s.categoria)!.push(s);
    }
    return Array.from(mapa.entries()).map(([categoria, sintomas]) => ({ categoria, sintomas }));
  }

  seleccionar(sintoma: CatalogoSintoma): void {
    this.sintomaSeleccionado = this.sintomaSeleccionado?.id === sintoma.id ? null : sintoma;
    this.exito = false;
    this.cdr.detectChanges();
  }

  estaSeleccionado(sintoma: CatalogoSintoma): boolean {
    return this.sintomaSeleccionado?.id === sintoma.id;
  }

  setIntensidad(valor: number): void {
    this.intensidad = valor;
  }

  getEtiquetaIntensidad(): string {
    if (this.intensidad <= 2) return 'Muy leve';
    if (this.intensidad <= 4) return 'Leve';
    if (this.intensidad <= 6) return 'Moderado';
    if (this.intensidad <= 8) return 'Intenso';
    return 'Muy intenso';
  }

  getColorIntensidad(): string {
    if (this.intensidad <= 3) return '#2ecc71';
    if (this.intensidad <= 6) return '#f39c12';
    return '#e74c3c';
  }

  guardar(): void {
    if (!this.sintomaSeleccionado || this.guardando) return;

    this.guardando = true;
    this.exito     = false;

    this.sintomasService
      .registrar(this.userId, this.sintomaSeleccionado.id, this.intensidad)
      .subscribe({
        next: () => {
          this.guardando           = false;
          this.exito               = true;
          this.sintomaSeleccionado = null;
          this.intensidad          = 5;
          this.cdr.detectChanges();
        },
        error: () => {
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
  }

  volver(): void       { this.router.navigate(['/home']); }
  verHistorial(): void { this.router.navigate(['/ver-sintomas']); }
}