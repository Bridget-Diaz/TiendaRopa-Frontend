import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CategoriaResponse {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
  totalProductos: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;
  
  // Datos quemados como respaldo
  private categoriasRespaldo: CategoriaResponse[] = [
    { idCategoria: 1, nombreCategoria: 'PACK 1', descripcion: 'Conjuntos de productos', totalProductos: 7 },
    { idCategoria: 2, nombreCategoria: 'PACK 2', descripcion: 'Pantalon denim + polos', totalProductos: 6 },
    { idCategoria: 3, nombreCategoria: 'PACK 3', descripcion: 'Zip Hoodie + Buzo', totalProductos: 6 },
    { idCategoria: 4, nombreCategoria: 'POLOS', descripcion: 'Polos de algodon', totalProductos: 7 },
    { idCategoria: 5, nombreCategoria: 'PANTALONES', descripcion: 'Pantalones', totalProductos: 6 },
    { idCategoria: 6, nombreCategoria: 'GORRAS', descripcion: 'Gorras', totalProductos: 4 },
    { idCategoria: 7, nombreCategoria: 'HOODIES', descripcion: 'Hoodies', totalProductos: 6 }
  ];

  constructor(private http: HttpClient) {
    console.log('🔧 API URL configurada:', this.apiUrl);
  }

  obtenerTodas(): Observable<CategoriaResponse[]> {
    console.log('📡 Intentando conectar a:', this.apiUrl);
    
    // Intento 1: Usar la API
    return this.http.get<CategoriaResponse[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('❌ Error conectando a API:', error);
        console.log('✅ Usando categorías de respaldo');
        
        // Intento 2: Devolver datos quemados
        return of(this.categoriasRespaldo);
      })
    );
  }

  obtenerPorId(id: number): Observable<CategoriaResponse> {
    const categoria = this.categoriasRespaldo.find(c => c.idCategoria === id);
    if (categoria) {
      return of(categoria);
    }
    return this.http.get<CategoriaResponse>(`${this.apiUrl}/${id}`);
  }
}