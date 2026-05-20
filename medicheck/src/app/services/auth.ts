import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/interfaces'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: User): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }
  
  login(credentials: Pick<User, 'email' | 'password'>): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }
}