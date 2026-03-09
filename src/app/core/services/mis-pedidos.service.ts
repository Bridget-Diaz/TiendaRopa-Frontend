import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PedidoResponse {
  idPedido: number;
  fecha: string;
  total: number;
  estado: string;
  metodoPago: string;
}

export interface PedidoDetalle {
  idPedido: number;
  fecha: string;
  total: number;
  estado: string;
  metodoPago: string;
  items: {
    nombreProducto: string;
    talla: string | null;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class MisPedidosService {

  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) {}

  obtenerMisPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/mis-pedidos`);
  }

  obtenerDetalle(idPedido: number): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/${idPedido}/detalle`);
  }
}