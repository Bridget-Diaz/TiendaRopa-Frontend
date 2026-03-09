import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CarritoService } from '../../core/services/carrito.service';

import {
  ProductoService,
  ProductoResponse,
  TallaStockDTO,
} from '../../core/services/producto.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css'],
})
export class ProductoDetalleComponent implements OnInit {
  producto: ProductoResponse | null = null;
  tallaSeleccionada: TallaStockDTO | null = null;
  tallasPackSeleccionadas: (TallaStockDTO | null)[] = [];

  cantidad: number = 1;
  cargando: boolean = true;
  imagenDetalleActiva: number = 0;

constructor(
  private route: ActivatedRoute,
  private router: Router,
  private productoService: ProductoService,
  private carritoService: CarritoService, // ← AGREGAR
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    // ✅ FORMA CORRECTA: Usar params observable para detectar cambios en la ruta
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.cargando = true;
        this.cdr.detectChanges(); // Forzar detección de cambios inmediata
        
        if (id) {
          return this.productoService.obtenerPorId(id);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.procesarProducto(data);
        } else {
          this.producto = null;
        }
        this.cargando = false;
        this.cdr.detectChanges(); // 👈 IMPORTANTE: Forzar detección de cambios
      },
      error: () => {
        this.producto = null;
        this.cargando = false;
        this.cdr.detectChanges(); // 👈 También en error
      }
    });
  }

  private procesarProducto(data: ProductoResponse): void {
    // Asegurar imágenes
    if (!data.imagenesUrl || data.imagenesUrl.length === 0) {
      data.imagenesUrl = ['assets/img/productos/default-1.jpg'];
    }

    // Si es pack, preparar array de tallas
    if (data.esPack && data.componentes) {
      this.tallasPackSeleccionadas = new Array(data.componentes.length).fill(null);
    } else {
      this.tallasPackSeleccionadas = [];
    }

    // Resetear selecciones
    this.tallaSeleccionada = null;
    this.cantidad = 1;
    this.imagenDetalleActiva = 0;

    // Asignar producto
    this.producto = data;
  }


cargarProducto(id: number): void {

  // Limpiar estado
  this.producto = null;
  this.cargando = true;
  this.imagenDetalleActiva = 0;
  this.cantidad = 1;
  this.tallaSeleccionada = null;
  this.tallasPackSeleccionadas = [];

  this.productoService.obtenerPorId(id).subscribe({
    next: (data) => {

      // Asegurar imágenes
      if (!data.imagenesUrl || data.imagenesUrl.length === 0) {
        data.imagenesUrl = ['/assets/no-image.png'];
      }

      // Si es pack, preparar array de tallas
      if (data.esPack && data.componentes) {
        this.tallasPackSeleccionadas = new Array(data.componentes.length).fill(null);
      }

      // Asignar UNA sola vez
      this.producto = data;

      this.cargando = false;
    },
    error: () => {
      this.producto = null;
      this.cargando = false;
    }
  });
}



  // =========================
  // 🖼 CARRUSEL
  // =========================

  siguienteImagen(): void {
    if (!this.producto?.imagenesUrl?.length) return;
    this.imagenDetalleActiva =
      (this.imagenDetalleActiva + 1) % this.producto.imagenesUrl.length;
  }

  anteriorImagen(): void {
    if (!this.producto?.imagenesUrl?.length) return;
    this.imagenDetalleActiva =
      this.imagenDetalleActiva === 0
        ? this.producto.imagenesUrl.length - 1
        : this.imagenDetalleActiva - 1;
  }

  seleccionarImagen(indice: number): void {
    this.imagenDetalleActiva = indice;
  }

  // =========================
  // 👕 TALLAS
  // =========================

  seleccionarTalla(talla: TallaStockDTO): void {
    if (talla.disponible) {
      this.tallaSeleccionada = talla;
    }
  }

  seleccionarTallaPack(indice: number, talla: TallaStockDTO): void {
    if (talla.disponible) {
      this.tallasPackSeleccionadas[indice] = talla;
    }
  }

  // =========================
  // 🔢 CANTIDAD
  // =========================

  incrementarCantidad(): void {
    if (!this.producto) return;

    const maxStock = this.tallaSeleccionada?.stock ?? this.producto.stock;

    if (this.cantidad < maxStock) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  // =========================
  // 🛒 VALIDAR LOGIN ANTES DE COMPRAR
  // =========================

agregarAlCarrito(): void {
  if (!this.producto) return;

  // 1️⃣ Verificar que el usuario esté logueado
  const token = localStorage.getItem('token');
  const idUsuario = Number(localStorage.getItem('idUsuario'));

  if (!token || !idUsuario) {
    Swal.fire({
      icon: 'warning',
      title: 'Debes iniciar sesión',
      confirmButtonColor: '#601C1D',
    }).then(() => this.router.navigate(['/login']));
    return;
  }

  // 2️⃣ Validar según si es pack o producto simple
  if (this.producto.esPack) {

    // Verificar que se eligió talla para CADA componente
    if (this.tallasPackSeleccionadas.some(t => t === null)) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona la talla de cada componente',
        confirmButtonColor: '#601C1D'
      });
      return;
    }

    // ✅ Armar DTO para pack
    const dto = {
      idUsuario,
      idProducto: this.producto.idProducto,
      idTalla: null,          // los packs no tienen talla directa
      cantidad: this.cantidad,
      esPack: true,
      componentes: this.producto.componentes!.map((comp, i) => ({
        idPackComponente: comp.idComponente,   // necesitas este campo en tu ProductoResponse
        idTalla: this.tallasPackSeleccionadas[i]!.idTalla
      }))
    };

    this.carritoService.agregarProducto(dto).subscribe({
      next: () => this.mostrarExitoYRedirigir(),
      error: (err: any) => Swal.fire('Error ' + err.status, err.error, 'error')
    });

  } else {

    // Verificar talla si el producto tiene tallas
    if (this.producto.tallasDisponibles?.length && !this.tallaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una talla',
        confirmButtonColor: '#601C1D'
      });
      return;
    }

    // ✅ Armar DTO para producto simple
    const dto = {
      idUsuario,
      idProducto: this.producto.idProducto,
      idTalla: this.tallaSeleccionada?.idTalla ?? null,
      cantidad: this.cantidad,
      esPack: false,
      componentes: []
    };

    this.carritoService.agregarProducto(dto).subscribe({
      next: () => this.mostrarExitoYRedirigir(),
      error: (err) => Swal.fire('Error ' + err.status, err.error, 'error')
    });
  }
}

// Helper para no repetir el Swal de éxito
private mostrarExitoYRedirigir(): void {
  Swal.fire({
    icon: 'success',
    title: '¡Agregado al carrito!',
    timer: 1200,
    showConfirmButton: false
  }).then(() => this.router.navigate(['/carrito']));
}

  // =========================
  // 💰 PRECIOS
  // =========================

  get precioFinal(): number {
    if (!this.producto) return 0;
    return this.producto.precioDescuento ?? this.producto.precio;
  }

  get tieneDescuento(): boolean {
    return !!this.producto?.precioDescuento &&
           this.producto.precioDescuento < this.producto.precio;
  }

  get porcentajeDescuento(): number {
    if (!this.tieneDescuento) return 0;
    return Math.round(
      ((this.producto!.precio - this.producto!.precioDescuento!) /
        this.producto!.precio) * 100
    );
  }

  get total(): number {
    return this.precioFinal * this.cantidad;
  }
}
