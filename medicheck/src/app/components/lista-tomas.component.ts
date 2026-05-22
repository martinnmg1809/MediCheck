import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-tomas',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './lista-tomas.component.html'
})
export class ListaTomasComponent implements OnInit {
  medicamentos: any[] = [];
  cargandoInicial: boolean = true;
  usuarioId: number = 0;

  // 2. Lo inyectamos en el constructor
  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userGuardado = localStorage.getItem('userId');
      if (userGuardado) {
        this.usuarioId = parseInt(userGuardado, 10);
        this.cargarLista();
      } else {
        alert('Por favor, inicia sesión primero.');
        this.router.navigate(['/login']);
      }
    }
  }

  cargarLista(): void {
    this.http.get<any[]>(`http://localhost:3000/api/tomas/usuario/${this.usuarioId}/hoy`)
      .subscribe({
        next: (data) => {
          this.medicamentos = data;
          this.cargandoInicial = false;
          this.cdr.detectChanges(); // 3. ¡Forzamos a la pantalla a mostrar los datos ya!
        },
        error: (err) => {
          console.error('Error al cargar datos:', err);
          this.cargandoInicial = false;
          this.cdr.detectChanges();
        }
      });
  }

  marcarTomado(tomaId: number): void {
    this.http.patch(`http://localhost:3000/api/tomas/${tomaId}/verificar`, {})
      .subscribe({
        next: () => {
          const medicamentoModificado = this.medicamentos.find(item => item.toma_id === tomaId);
          if (medicamentoModificado) {
            medicamentoModificado.verificado = true;
            medicamentoModificado.fecha_real_toma = new Date().toISOString();
            this.cdr.detectChanges(); // Actualizamos la pantalla al marcar tomado
          }
        },
        error: (err) => {
          console.error('Error al marcar la toma:', err);
          alert('No se pudo registrar la toma.');
        }
      });
  }

  irACrear(): void {
    this.router.navigate(['/create']);
  }
}