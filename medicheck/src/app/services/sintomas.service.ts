import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

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
  fecha: string;  // 'YYYY-MM-DD'
  hora: string;   // 'HH:MM'
}

@Injectable({ providedIn: 'root' })
export class SintomasService {
  private readonly BASE = `${API_BASE_URL}/api/sintomas`;

  constructor(private http: HttpClient) {}

  /** Devuelve el catálogo de síntomas disponibles */
  getCatalogo(): Observable<CatalogoSintoma[]> {
    return this.http.get<CatalogoSintoma[]>(`${this.BASE}/catalogo`);
  }

  /** Registra un síntoma para el usuario */
  registrar(userId: number, sintomaId: number, intensidad: number): Observable<any> {
    return this.http.post(this.BASE, {
      user_id:    userId,
      sintoma_id: sintomaId,
      intensidad
    });
  }

  /** Obtiene el historial de síntomas del usuario, ordenado por fecha */
  getHistorial(userId: number, orden: 'asc' | 'desc' = 'desc'): Observable<RegistroSintoma[]> {
    const params = new HttpParams().set('orden', orden);
    return this.http.get<RegistroSintoma[]>(`${this.BASE}/usuario/${userId}`, { params });
  }

  /** Actualiza la intensidad de un síntoma registrado */
  actualizar(registroId: number, intensidad: number): Observable<any> {
    return this.http.put(`${this.BASE}/${registroId}`, { intensidad });
  }

  /** Elimina un síntoma registrado */
  eliminar(registroId: number): Observable<any> {
    return this.http.delete(`${this.BASE}/${registroId}`);
  }
}