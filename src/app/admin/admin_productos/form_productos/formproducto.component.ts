// src/app/admin/productos/form-producto/form-producto.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminProductoService, AdminProductoRequest } from '../../../core/services/admin-producto.service';
import { AdminCategoriaService, AdminCategoria } from '../../../core/services/admin-categoria.service';

@Component({
  selector: 'app-form-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './form-producto.component.html',
  styleUrls: ['./form-producto.component.css']
})
export class FormProductoComponent implements OnInit {

  esEdicion = false;
  productoId: number | null = null;
  guardando = false;
  categorias: AdminCategoria[] = [];

  form: AdminProductoRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    precioDescuento: null,
    stock: 0,
    idCategoria: 0,
    activo: true,
    destacado: false,
    nuevo: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: AdminProductoService,
    private categoriaService: AdminCategoriaService
  ) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.esEdicion = true;
    this.productoId = +id;
  }

  // ✅ Primero categorías, luego producto
  this.categoriaService.listar().subscribe({
    next: (cats) => {
      this.categorias = cats.filter(c => c.activo);
      
      // Cargar producto DESPUÉS de tener las categorías
      if (this.esEdicion && this.productoId) {
        this.cargarProducto(this.productoId);
      }
    },
    error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
  });
}

  cargarProducto(id: number): void {
    this.productoService.obtener(id).subscribe({
      next: (p) => {
        this.form = {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          precioDescuento: p.precioDescuento,
          stock: p.stock,
          idCategoria: p.idCategoria,
          activo: p.activo,
          destacado: p.destacado,
          nuevo: p.nuevo
        };
      },
      error: () => {
        Swal.fire('Error', 'No se encontró el producto', 'error');
        this.router.navigate(['/admin/productos']);
      }
    });
  }

  guardar(): void {
    if (!this.form.nombre || !this.form.idCategoria || !this.form.precio) {
      Swal.fire('Atención', 'Completa los campos obligatorios', 'warning');
      return;
    }

    this.guardando = true;

    const request$ = this.esEdicion
      ? this.productoService.actualizar(this.productoId!, this.form)
      : this.productoService.crear(this.form);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.esEdicion ? 'Producto actualizado' : 'Producto creado',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/admin/productos']));
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'No se pudo guardar el producto', 'error');
      }
    });
  }
}