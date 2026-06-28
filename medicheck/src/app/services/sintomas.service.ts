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
  fecha: string;  // 'YYYY-MM-DD'
  hora: string;   // 'HH:MM'
}

@Injectable({ providedIn: 'root' })
export class SintomasService {
  private readonly BASE = 'http://192.168.100.14:3000/api/sintomas';

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
}