import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CatalogoSintoma {
  id: number;
  nombre: string;
  categoria: string;
  icono: string;
}

export interface RegistroSintoma {
  id: number;
  sintoma_nombre: string;
  sintoma_categoria: string;
  sintoma_icono: string;
  intensidad: number;
  fecha: string;   // 'YYYY-MM-DD'
  hora: string;    // 'HH:MM'
}

@Injectable({ providedIn: 'root' })
export class SintomasService {
  private readonly BASE = 'http://localhost:3000/api/sintomas';

  constructor(private http: HttpClient) {}

  /** Catálogo de síntomas disponibles */
  getCatalogo(): Observable<CatalogoSintoma[]> {
    return this.http.get<CatalogoSintoma[]>(`${this.BASE}/catalogo`);
  }

  /** Registra un síntoma */
  registrar(userId: number, sintomaId: number, intensidad: number): Observable<any> {
    return this.http.post(this.BASE, {
      user_id:    userId,
      sintoma_id: sintomaId,
      intensidad
    });
  }

  /** Historial de síntomas del usuario */
  getHistorial(userId: number, orden: 'asc' | 'desc' = 'desc'): Observable<RegistroSintoma[]> {
    const params = new HttpParams().set('orden', orden);
    return this.http.get<RegistroSintoma[]>(`${this.BASE}/usuario/${userId}`, { params });
  }

  /** Obtiene un registro por id — usa /registro/:id para no chocar con /catalogo */
  getRegistroById(id: number): Observable<RegistroSintoma> {
    return this.http.get<RegistroSintoma>(`${this.BASE}/registro/${id}`);
  }

  /** Actualiza la intensidad de un registro */
  actualizarIntensidad(id: number, intensidad: number): Observable<any> {
    return this.http.put(`${this.BASE}/registro/${id}`, { intensidad });
  }

  /** Elimina un registro */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/registro/${id}`);
  }
}