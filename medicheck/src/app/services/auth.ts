import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/interfaces';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `${API_BASE_URL}/api/auth`;
  private API_TOMAS = `${API_BASE_URL}/api/tomas`;

  constructor(private http: HttpClient) {}

  register(userData: User): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  login(credentials: Pick<User, 'email' | 'password'>): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, { token, newPassword });
  }

  getTreatments(userId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/treatments/${userId}`);
  }

  getUpcomingDoses(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_TOMAS}/usuario/${userId}/historial`);
  }

  logOut(userId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/logout/`, userId);
  }

  eliminarTratamiento(tratamientoId: number): Observable<any> {
    return this.http.delete(`${this.API_TOMAS}/tratamiento/${tratamientoId}`);
  }

  editarTratamiento(tratamientoId: number, datos: any): Observable<any> {
    return this.http.put(`${this.API_TOMAS}/tratamiento/${tratamientoId}`, datos);
  }
}