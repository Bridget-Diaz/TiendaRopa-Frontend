import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  idUsuario: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  saveSession(token: string, rol: string, idUsuario: number): void {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol.toUpperCase());
    localStorage.setItem('idUsuario', idUsuario.toString());
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

isLogged(): boolean {

  const token = this.getToken();

  if (!token) return false;

  const payload = JSON.parse(atob(token.split('.')[1]));

  const expiration = payload.exp * 1000;

  if (Date.now() > expiration) {

    alert("Tu sesión expiró. Inicia sesión nuevamente");

    this.logout();

    return false;
  }

  return true;
}

  hasRole(role: string): boolean {
    return this.getRol() === role;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('idUsuario');
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/usuario/perfil`);
  }
}