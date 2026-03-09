import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TallaStockDTO {
  idTalla: number;
  nombreTalla: string;
  stock: number;
  disponible: boolean;
}

export interface ComponenteDTO {
  idComponente: number;
  nombreComponente: string;
  tallasDisponibles: TallaStockDTO[];
}

export interface ProductoResponse {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioDescuento?: number;
  stock: number;
  categoria: string;
  idCategoria: number;
  destacado: boolean;
  nuevo: boolean;
  tallasDisponibles?: TallaStockDTO[];
  imagenesUrl?: string[];
  esPack?: boolean;
  componentes?: ComponenteDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  // ✅ NUEVO: Mapeo de imágenes por NOMBRE de producto (NO por ID)
  private imagenesPorNombre: { [key: string]: string[] } = {
    // ==================== PACK 1 (7 productos) ====================
    'Pack 1: Boxy Fit Azul + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitazul.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitazul.jpg'
    ],
    'Pack 1: Boxy Fit Verde + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitverde.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitverde.jpg'
    ],
    'Pack 1: Boxy Fit Plomo + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitplomo.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitplomo.jpg'
    ],
    'Pack 1: Boxy Fit Blanco + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitblanco.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitblanco.jpg'
    ],
    'Pack 1: Boxy Fit Negro + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitnegro.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitnegro.jpg'
    ],
    'Pack 1: Boxy Fit Gargola + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitgargola.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitgargola.jpg'
    ],
    'Pack 1: Boxy Fit Marron + 2 Polos Boxy/Over': [
      'assets/img/productos/pack_hoodie_polos/1boxyfitmarron.jpg',
      'assets/img/productos/pack_hoodie_polos/2boxyfitmarron.jpg'
    ],

    // ==================== PACK 2 (6 productos) ====================
    'Pack 2: Super Pantalón baggy jean tribal NG + Polo': [
      'assets/img/productos/pack_urbano/1pantalon_baggy_jean_tribalNG_polo.jpg',
      'assets/img/productos/pack_urbano/2pantalon_baggy_jean_tribalNG_polo.jpg'
    ],
    'Pack 2: Pantalón Baggy Jean Vintage H + Polo': [
      'assets/img/productos/pack_urbano/1pantalon_baggy_jean_VintageH_polo.jpg',
      'assets/img/productos/pack_urbano/2pantalon_baggy_jean_VintageH_polo.jpg'
    ],
    'Pack 2: Pantalón Baggy Jean Oxido+ Polo': [
      'assets/img/productos/pack_urbano/1pantalon_baggy_jean_Oxido_polo.jpg'
    ],
    'Pack 2: Pantalón Baggy Jean Celeste + Polo': [
      'assets/img/productos/pack_urbano/1pantalon_baggy_jean_celeste_polo.jpg',
      'assets/img/productos/pack_urbano/2pantalon_baggy_jean_celeste_polo.jpg'
    ],
    'Pack 2: Pantalón Cargo Be+ Polo': [
      'assets/img/productos/pack_urbano/1pant_cargo_Be_polo.jpg'
    ],
    'Pack 2: Pantalón Baggy Jean Acid Wash + Polo': [
      'assets/img/productos/pack_urbano/1pantalon_baggy_jean_AcidWash_polo.jpg',
      'assets/img/productos/pack_urbano/2pantalon_baggy_jean_AcidWash_polo.jpg'
    ],

    // ==================== PACK 3 (6 productos) ====================
    'Pack 3: Zip Hoodie RJ +Buzo Oversive NG': [
      'assets/img/productos/pack_streetwear/1zip_hoodie_RJ_buzo_oversive_NG.jpg',
      'assets/img/productos/pack_streetwear/2zip_hoodie_RJ_buzo_oversive_NG.jpg'
    ],
    'Pack 3: Zip Hoodies Rojo + Buzo Oversize Plomo': [
      'assets/img/productos/pack_streetwear/1zip_hoodies_rojo_buzo_oversive_plomo.jpg',
      'assets/img/productos/pack_streetwear/2zip_hoodies_rojo_buzo_oversive_plomo..jpg'
    ],
    'Pack 3: Zip Hoodie Agatha +Buzo Oversive Agatha': [
      'assets/img/productos/pack_streetwear/1zip_hoodie_agatha_buzo_oversive_agatha.jpg',
      'assets/img/productos/pack_streetwear/2zip_hoodie_agatha_buzo_oversive_agatha.jpg'
    ],
    'Pack 3: Zip Hoodies Marron +Buzo Oversive Marron': [
      'assets/img/productos/pack_streetwear/1zip_hoodies_buzo_oversive.jpg',
      'assets/img/productos/pack_streetwear/2zip_hoodies_buzo_oversive.jpg'
    ],
    'Pack 3: Zip Hoodie Plomo +Buzo Oversive plomo': [
      'assets/img/productos/pack_streetwear/1zip_hoodie_plomo_buzo_oversive_plomo.jpg',
      'assets/img/productos/pack_streetwear/2zip_hoodie_plomo_buzo_oversive_plomo.jpg'
    ],
    'Pack 3: Balaclava + buzo oversize': [
      'assets/img/productos/pack_streetwear/1balaclava_buzo_oversize.jpg',
      'assets/img/productos/pack_streetwear/2balaclava_buzo_oversize.jpg'
    ],

    // ==================== POLOS (7 productos) ====================
    'Polo Smoking Boxy/Over 24/1': [
      'assets/img/productos/polos/1Polo_Smoking_Boxy_over.jpg',
      'assets/img/productos/polos/2Polo_Smoking_Boxy_over.jpg'
    ],
    'Polo Grin Boxy/Over 24/1': [
      'assets/img/productos/polos/1Polo_Grin_Boxy_over.jpg',
      'assets/img/productos/polos/2Polo_Grin_Boxy_over.jpg'
    ],
    'Polo NG Eternal Boxy/Over 24/1': [
      'assets/img/productos/polos/1Polo_NG_Eternal_boxy_over.jpeg',
      'assets/img/productos/polos/2Polo_NG_Eternal_boxy_over.jpeg'
    ],
    'Polo Manga Larga NG con Mangas BL Boxy Fit 24/1': [
      'assets/img/productos/polos/1Polo_Manga_larga_NG_con_mangas_BL_boxy_fit.jpg',
      'assets/img/productos/polos/2Polo_Manga_larga_NG_con_mangas_BL_boxy_fit.jpg'
    ],
    'Polo Manga Larga AC con Mangas NG Boxy Fit 24/1': [
      'assets/img/productos/polos/1Polo_Manga_larga_AC_con_mangas_NG_boxy fit.jpeg'
    ],
    'Polo Manga Larga Negro con Mangas Blancas Boxy Fit 24/1': [
      'assets/img/productos/polos/1Manga_larga_NG_con_mangas_BL_boxy_fit.jpeg'
    ],
    'Polo Malla Deportivo Rojo Kraniet Corte Boxy Fit': [
      'assets/img/productos/polos/1Polo_Malla_deportivo_Rojo_Kraniet_corte_boxy_fit.jpg',
      'assets/img/productos/polos/2Polo_Malla_deportivo_Rojo_Kraniet_corte_boxy_fit.jpg'
    ],

    // ==================== PANTALONES (6 productos) ====================
    'Pántalon extra baggy brillos Ng': [
      'assets/img/productos/pantalones/1Pantalon_extra_baggy_brillos_Ng.jpg',
      'assets/img/productos/pantalones/2Pantalon_extra_baggy_brillos_Ng.jpg'
    ],
    'Pantalón Flare multicargo Ng': [
      'assets/img/productos/pantalones/1Pantalon_Flare_multicargo_Ng.jpg',
      'assets/img/productos/pantalones/2Pantalon_Flare_multicargo_Ng.jpg'
    ],
    'Pantalón Flare Blue': [
      'assets/img/productos/pantalones/1Pantalon_Flare_Blue.jpg',
      'assets/img/productos/pantalones/2Pantalon_Flare_Blue.jpg'
    ],
    'Pantalón Baggy Jean Celeste / Unisex': [
      'assets/img/productos/pantalones/1Pantalon_Baggy_Jean_Celeste_Unisex.jpg',
      'assets/img/productos/pantalones/2Pantalon_Baggy_Jean_Celeste_Unisex.jpg'
    ],
    'Pantalón baggy Jean Mocca': [
      'assets/img/productos/pantalones/1Pantalon_baggy_Jean_Mocca.jpg',
      'assets/img/productos/pantalones/2Pantalon_baggy_Jean_Mocca.jpg'
    ],
    'Pantalón baggy Rawn Denim': [
      'assets/img/productos/pantalones/1Pantalon_baggy_RawnDenim.jpg',
      'assets/img/productos/pantalones/2Pantalon_baggy_RawnDenim.jpg'
    ],

    // ==================== GORRAS (4 productos) ====================
    'Gorra 59Fifty MLB New York Yankees': [
      'assets/img/productos/gorras/newyorkrojo.jpg',
      'assets/img/productos/gorras/newyorkrojo2.jpg'
    ],
    'Gorra Rebel Street': [
      'assets/img/productos/gorras/rebelstreet.png'
    ],
    'Gorra 59Fifty MLB Los Angeles': [
      'assets/img/productos/gorras/losangelesnegro.jpg',
      'assets/img/productos/gorras/los-angelesnegro2.jpg'
    ],
    'Gorra 59Fifty Chicago Bulls': [
      'assets/img/productos/gorras/thefarm.jpg'
    ],

    // ==================== HOODIES (6 productos) ====================
    'Polera Boxy Fit Negro': [
      'assets/img/productos/hoodies/1Poleras_Boxy_Fit_Negro_Unisex.jpg',
      'assets/img/productos/hoodies/2Poleras_Boxy_Fit_Negro_Unisex.jpg'
    ],
    'Polera Boxy Fit Gargola': [
      'assets/img/productos/hoodies/1Poleras_Boxy_Fit_Gargola_Unisex.jpg',
      'assets/img/productos/hoodies/2Poleras_Boxy_Fit_Gargola_Unisex.jpg'
    ],
    'Polera Boxy Fit Blanco': [
      'assets/img/productos/hoodies/1Poleras_Boxy_Fit_Blanco_Unisex.jpg',
      'assets/img/productos/hoodies/2Poleras_Boxy_Fit_Blanco_Unisex.jpg'
    ],
    'Zip hoodie Boxy Fit Rojo': [
      'assets/img/productos/hoodies/Zip_hoodie_Boxy_fit_Rj.jpg'
    ],
    'Zip hoodie Boxy Fit Negro': [
      'assets/img/productos/hoodies/Zip_hoodie_Boxy_fit_Ng.jpg'
    ],
    'Zip hoodie Boxy Fit Plomo': [
      'assets/img/productos/hoodies/Zip_hoodie_Boxy_fit_Plomo.jpg'
    ]
  };

  private imagenesDefault = [
    'assets/img/productos/default-1.jpg',
    'assets/img/productos/default-2.jpg'
  ];

  constructor(private http: HttpClient) {}

  // ✅ NUEVO: Método para agregar imágenes basado en NOMBRE (NO en ID)
  private agregarImagenes(productos: ProductoResponse[]): ProductoResponse[] {
    return productos.map((producto) => {
      // Buscar imágenes por el nombre EXACTO del producto
      const imagenes = this.imagenesPorNombre[producto.nombre];
      
      // Log opcional para depuración (lo puedes quitar después)
      if (!imagenes) {
        console.warn(`⚠️ No hay imágenes mapeadas para: "${producto.nombre}" (ID: ${producto.idProducto})`);
      }
      
      return {
        ...producto,
        imagenesUrl: imagenes || this.imagenesDefault,
      };
    });
  }

  obtenerTodos(): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(this.apiUrl)
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  obtenerPorId(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/${id}`).pipe(
      map((producto) => ({
        ...producto,
        imagenesUrl: this.imagenesPorNombre[producto.nombre] || this.imagenesDefault,
      }))
    );
  }

  obtenerDestacados(): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/destacados`)
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  obtenerNuevos(): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/nuevos`)
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  obtenerPorCategoria(idCategoria: number): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/categoria/${idCategoria}`)
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  buscar(termino: string): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/buscar`, {
        params: { termino },
      })
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  obtenerOfertas(): Observable<ProductoResponse[]> {
    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/ofertas`)
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  filtrar(filtros: {
    categoria?: number;
    precioMin?: number;
    precioMax?: number;
    destacado?: boolean;
  }): Observable<ProductoResponse[]> {
    let params: any = {};

    if (filtros.categoria) params.categoria = filtros.categoria.toString();
    if (filtros.precioMin) params.precioMin = filtros.precioMin.toString();
    if (filtros.precioMax) params.precioMax = filtros.precioMax.toString();
    if (filtros.destacado !== undefined) params.destacado = filtros.destacado.toString();

    return this.http
      .get<ProductoResponse[]>(`${this.apiUrl}/filtrar`, { params })
      .pipe(map((productos) => this.agregarImagenes(productos)));
  }

  /**
   * Método para actualizar el mapeo de imágenes dinámicamente
   */
  actualizarImagenesProducto(nombreProducto: string, rutasImagenes: string[]): void {
    this.imagenesPorNombre[nombreProducto] = rutasImagenes;
  }
}