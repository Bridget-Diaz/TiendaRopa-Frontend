import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService, CarritoItem } from '../../core/services/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  items: CarritoItem[] = [];
  loading = true;
  error: string | null = null;
  actualizando: Set<number> = new Set();

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.loading = true;
    this.error = null;
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404 || err.status === 500) {
          this.items = [];
        } else {
          this.error = 'No se pudo cargar el carrito.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarCantidad(item: CarritoItem, delta: number): void {
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;
    this.actualizando.add(item.idCarritoItem);
    this.carritoService.actualizarCantidad(item.idCarritoItem, nuevaCantidad).subscribe({
      next: () => {
        item.cantidad = nuevaCantidad;
        item.subtotal = item.precioUnitario * nuevaCantidad;
        this.actualizando.delete(item.idCarritoItem);
        this.cdr.detectChanges();
      },
      error: () => {
        this.actualizando.delete(item.idCarritoItem);
        this.cdr.detectChanges();
        Swal.fire('Error', 'No se pudo actualizar la cantidad', 'error');
      }
    });
  }

  eliminar(idItem: number): void {
    this.actualizando.add(idItem);
    this.carritoService.eliminarItem(idItem).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.idCarritoItem !== idItem);
        this.actualizando.delete(idItem);
        this.carritoService['_cantidadItems'].next(this.items.length);
        this.cdr.detectChanges();
        Swal.fire({ icon: 'success', title: 'Producto eliminado', timer: 1200, showConfirmButton: false });
      },
      error: () => {
        this.actualizando.delete(idItem);
        this.cdr.detectChanges();
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    });
  }

  get total(): number { return this.carritoService.calcularTotal(this.items); }
  isActualizando(idItem: number): boolean { return this.actualizando.has(idItem); }
  irAlCheckout(): void { this.router.navigate(['/checkout']); }
  seguirComprando(): void { this.router.navigate(['/producto']); }
}