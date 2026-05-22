import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-toma',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './formulario-toma.component.html'
})
export class FormularioTomaComponent implements OnInit {
  catalogoMedicamentos: any[] = [];
  usuarioId: number = 0;
  nuevoHorario: string = '08:00';
  medicamentoSeleccionado: string = '';
  filtroTexto: string = '';
  agregando: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userGuardado = localStorage.getItem('userId');
      if (userGuardado) {
        this.usuarioId = parseInt(userGuardado, 10);
        this.cargarCatalogo();
      } else {
        alert('Por favor, inicia sesión primero.');
        this.router.navigate(['/login']);
      }
    }
  }

  cargarCatalogo(): void {
    this.http.get<any[]>('http://localhost:3000/api/medicamentos')
      .subscribe({
        next: (data) => {
          this.catalogoMedicamentos = data;
          if (data.length > 0) {
            this.medicamentoSeleccionado = data[0].id.toString();
          }
        },
        error: (err) => console.error('Error al cargar catálogo:', err)
      });
  }

  filtrarMedicamentos() {
    if (!this.filtroTexto) return this.catalogoMedicamentos;
    return this.catalogoMedicamentos.filter(med =>
      med.nombre_comercial.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      med.principio_activo.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  crearHorario(): void {
    if (!this.medicamentoSeleccionado) {
      alert('Por favor selecciona un medicamento.');
      return;
    }

    this.agregando = true;
    const datos = {
      user_id: this.usuarioId,
      medicamento_id: parseInt(this.medicamentoSeleccionado, 10),
      horario: this.nuevoHorario
    };

    this.http.post('http://localhost:3000/api/tomas/crear', datos)
      .subscribe({
        next: () => {
          alert('¡Horario guardado!');
          this.agregando = false;
          this.router.navigate(['/list']); // Redirige a la nueva URL de la lista
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('No se pudo guardar.');
          this.agregando = false;
        }
      });
  }

  irALista(): void {
    this.router.navigate(['/list']); // Apunta a /list
  }
}