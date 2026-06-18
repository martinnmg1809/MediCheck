import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/interfaces'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api/auth';
  private API_TOMAS = 'http://localhost:3000/api/tomas'

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
}