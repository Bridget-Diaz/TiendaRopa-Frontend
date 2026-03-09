import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutRequest {
  nombre: string;
  apellido: string;
  dni: string;
  direccion: string;
  referencia: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  metodoPago: string;
}

export interface CheckoutResponse {
  idPedido: number;
  estado: string;
  total: number;
  metodoPago: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {

  private readonly apiUrl = 'http://localhost:8080/api/checkout';

  constructor(private http: HttpClient) {}

  procesarCheckout(dto: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.apiUrl, dto);
  }
}