// src/app/core/services/admin/admin-producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminProducto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioDescuento: number | null;
  stock: number;
  idCategoria: number;
  nombreCategoria: string;
  activo: boolean;
  destacado: boolean;
  nuevo: boolean;
  fechaCreacion: string;
}

export interface AdminProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  precioDescuento?: number | null;
  stock: number;
  idCategoria: number;
  activo: boolean;
  destacado: boolean;
  nuevo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminProductoService {
  private url = `${environment.apiUrl}/admin/productos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<AdminProducto[]> {
    return this.http.get<AdminProducto[]>(this.url);
  }

  obtener(id: number): Observable<AdminProducto> {
    return this.http.get<AdminProducto>(`${this.url}/${id}`);
  }

  crear(data: AdminProductoRequest): Observable<AdminProducto> {
    return this.http.post<AdminProducto>(this.url, data);
  }

  actualizar(id: number, data: AdminProductoRequest): Observable<AdminProducto> {
    return this.http.put<AdminProducto>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  toggleActivo(id: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/toggle-activo`, {});
  }
}