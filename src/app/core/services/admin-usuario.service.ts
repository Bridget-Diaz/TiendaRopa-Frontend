import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUsuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  bloqueado: boolean;
  rol: string;
  idRol: number;
  fechaRegistro: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuarioService {
  private url = `${environment.apiUrl}/admin/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<AdminUsuario[]> {
    return this.http.get<AdminUsuario[]>(this.url);
  }

  obtener(id: number): Observable<AdminUsuario> {
    return this.http.get<AdminUsuario>(`${this.url}/${id}`);
  }

  toggleBloqueo(id: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/bloquear`, {});
  }

  cambiarRol(id: number, idRol: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/rol`, { idRol });
  }
}