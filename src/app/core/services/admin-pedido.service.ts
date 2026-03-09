import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminPedidoItem {
  nombreProducto: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface AdminPedido {
  idPedido: number;
  nombreCliente: string;
  emailCliente: string;
  fecha: string;
  total: number;
  estado: string;
  ciudad: string;
  tipoEntrega: string;
  items: AdminPedidoItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminPedidoService {
  private url = `${environment.apiUrl}/admin/pedidos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<AdminPedido[]> {
    return this.http.get<AdminPedido[]>(this.url);
  }

  obtener(id: number): Observable<AdminPedido> {
    return this.http.get<AdminPedido>(`${this.url}/${id}`);
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.url}/${id}/estado`, { estado });
  }
}