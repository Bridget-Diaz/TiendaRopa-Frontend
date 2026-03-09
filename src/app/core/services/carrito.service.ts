import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface ComponenteSeleccionDTO {
  idPackComponente: number;
  idTalla: number;
}

export interface AgregarCarritoDTO {
  idUsuario: number;
  idProducto: number;
  idTalla: number | null;      // para productos simples
  cantidad: number;
  esPack: boolean;
  componentes: ComponenteSeleccionDTO[]; // para packs
}

export interface ComponenteResponseDTO {
  nombreComponente: string;  // "Hoodie", "Polo 1", etc.
  talla: string;             // "M", "L", etc.
}

export interface CarritoItem {
  idCarritoItem: number;
  nombreProducto: string;
  talla: string | null;           // solo productos simples
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  esPack: boolean;
componentes: ComponenteResponseDTO[] | null;
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private readonly apiUrl = 'http://localhost:8080/api/carrito';

  // BehaviorSubject para mostrar el contador en el header
  private _cantidadItems = new BehaviorSubject<number>(0);
  cantidadItems$ = this._cantidadItems.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Ya no lleva /{idUsuario} — el backend lo saca del JWT
  obtenerCarrito(): Observable<CarritoItem[]> {
    return this.http.get<CarritoItem[]>(this.apiUrl).pipe(
      tap(items => this._cantidadItems.next(items.length))
    );
  }

  agregarProducto(dto: AgregarCarritoDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/agregar`, dto, { responseType: 'text' });
  }

  actualizarCantidad(idItem: number, cantidad: number): Observable<string> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this.http.put(`${this.apiUrl}/actualizar/${idItem}`, null, {
      params,
      responseType: 'text'
    });
  }

  eliminarItem(idItem: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminar/${idItem}`, { responseType: 'text' });
  }

  calcularTotal(items: CarritoItem[]): number {
    return items.reduce((acc, item) => acc + Number(item.subtotal), 0);
  }
}