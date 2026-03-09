// src/app/admin/admin_productos/listproductos.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminProductoService, AdminProducto } from '../../core/services/admin-producto.service';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listproductos.component.html',
  styleUrls: ['./listproductos.component.css']
})
export class ListaProductosComponent implements OnInit {

  productos: AdminProducto[] = [];
  loading = true;

  constructor(
    private productoService: AdminProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges(); // ← fix
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges(); // ← fix
        Swal.fire('Error', 'No se pudo cargar los productos', 'error');
      }
    });
  }

  toggleActivo(p: AdminProducto): void {
    const accion = p.activo ? 'desactivar' : 'activar';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} producto?`,
      text: p.nombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#601C1D',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.productoService.toggleActivo(p.idProducto).subscribe({
          next: (res) => {
            p.activo = res.activo;
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: res.mensaje, timer: 1200, showConfirmButton: false });
          },
          error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
        });
      }
    });
  }

  confirmarEliminar(p: AdminProducto): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `"${p.nombre}" quedará inactivo`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#601C1D',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.productoService.eliminar(p.idProducto).subscribe({
          next: () => {
            this.productos = this.productos.filter(x => x.idProducto !== p.idProducto);
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: 'Producto eliminado', timer: 1200, showConfirmButton: false });
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el producto', 'error')
        });
      }
    });
  }
}