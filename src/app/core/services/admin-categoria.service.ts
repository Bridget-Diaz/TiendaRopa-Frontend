// src/app/core/services/admin/admin-categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminCategoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  totalProductos: number;
}

export interface AdminCategoriaRequest {
  nombreCategoria: string;
  descripcion: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCategoriaService {
  private url = `${environment.apiUrl}/admin/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<AdminCategoria[]> {
    return this.http.get<AdminCategoria[]>(this.url);
  }

  obtener(id: number): Observable<AdminCategoria> {
    return this.http.get<AdminCategoria>(`${this.url}/${id}`);
  }

  crear(data: AdminCategoriaRequest): Observable<AdminCategoria> {
    return this.http.post<AdminCategoria>(this.url, data);
  }

  actualizar(id: number, data: AdminCategoriaRequest): Observable<AdminCategoria> {
    return this.http.put<AdminCategoria>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  toggleActivo(id: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/toggle-activo`, {});
  }
}