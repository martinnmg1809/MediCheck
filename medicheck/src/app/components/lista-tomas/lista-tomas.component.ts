import { Component, OnInit, Inject, PLATFORM_ID,  ChangeDetectorRef  } from '@angular/core'; // <-- 1. Añadimos Inject y PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- 2. Añadimos isPlatformBrowser
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-tomas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './lista-tomas.component.html',
  styleUrls: ['./lista-tomas.component.css']
})
export class ListaTomasComponent implements OnInit {
  medicamentos: any[] = [];
  medicamentosFiltrados: any[] = [];
  cargandoInicial: boolean = true;
  usuarioId: number = 0; 
  
  diasSemana: any[] = [];
  diaSeleccionado: string = '';

  // 3. Inyectamos el PLATFORM_ID en el constructor
  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Generamos los días inmediatamente para que el HTML dibuje las opciones desde ya
    this.generarDiasSemana();

    if (isPlatformBrowser(this.platformId)) {
      const idGuardado = localStorage.getItem('user_id');
      
      if (idGuardado) {
        this.usuarioId = parseInt(idGuardado, 10);
        this.cargarLista();
      } else {
        alert('Por favor, inicia sesión para acceder a tu horario.');
        this.router.navigate(['/login']); 
      }
    }
  }

  generarDiasSemana(): void {
    const formateadorFecha = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const partesFecha = (d: Date) => {
      const p = formateadorFecha.format(d).split('-');
      return `${p[2]}-${p[1]}-${p[0]}`; // YYYY-MM-DD
    };

    const hoyISO = partesFecha(new Date());

    // Recoger fechas únicas de las tomas devueltas por el backend
    const fechasEnDatos = new Set<string>(
      (this.medicamentos || []).map(item => item.fecha_exacta)
    );

    // Unir con los próximos 7 días para que siempre aparezcan días futuros
    for (let i = 0; i < 7; i++) {
      const f = new Date();
      f.setDate(f.getDate() + i);
      fechasEnDatos.add(partesFecha(f));
    }

    // Ordenar cronológicamente y construir las pestañas
    this.diasSemana = Array.from(fechasEnDatos)
      .sort()
      .map(iso => {
        const [y, m, d] = iso.split('-').map(Number);
        const fecha = new Date(y, m - 1, d);
        let nombre: string;
        if (iso === hoyISO) {
          nombre = 'Hoy';
        } else {
          nombre = fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric' });
          nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        }
        return { nombre, valor: iso };
      });

    // Seleccionar: primer día con tomas pendientes, o hoy si no hay ninguno
    const primerPendiente = this.diasSemana.find(d =>
      (this.medicamentos || []).some(m => m.fecha_exacta === d.valor && !m.verificado)
    );
    this.diaSeleccionado = primerPendiente ? primerPendiente.valor : hoyISO;
  }

  cargarLista(): void {
    this.cargandoInicial = true;
    this.http.get<any[]>(`http://localhost:3000/api/tomas/usuario/${this.usuarioId}/historial`).subscribe({
      next: (data) => {
        this.medicamentos = data;
        this.generarDiasSemana();
        this.filtrarPorDia();
        this.cargandoInicial = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
        this.cargandoInicial = false;
      }
    });
  }
  filtrarPorDia(): void {
    if (!this.diaSeleccionado && this.diasSemana.length > 0) {
      this.diaSeleccionado = this.diasSemana[0].valor;
    }

    this.medicamentosFiltrados = this.medicamentos.filter(item => {
      return item.fecha_exacta === this.diaSeleccionado;
    });
  }

  getSelectedDayLabel(): string {
    const dia = this.diasSemana.find(item => item.valor === this.diaSeleccionado);
    return dia ? dia.nombre : 'Tu día';
  }

  marcarTomado(tomaId: number): void {
    this.http.put(`http://localhost:3000/api/tomas/verificar/${tomaId}`, {}).subscribe({
      next: () => {
        this.cargarLista();
      },
      error: (err) => {
        console.error('Error al verificar toma:', err);
        alert('No se pudo registrar la toma médica.');
      }
    });
  }

  irACrear(): void {
    this.router.navigate(['/create']);
  }
}