// src/app/admin/admin_categorias/lista-categorias.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminCategoriaService, AdminCategoria, AdminCategoriaRequest } from '../../core/services/admin-categoria.service';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.css']
})
export class ListaCategoriasComponent implements OnInit {

  categorias: AdminCategoria[] = [];
  loading = true;
  mostrarForm = false;
  editando = false;
  categoriaEditId: number | null = null;
  guardando = false;

  form: AdminCategoriaRequest = { nombreCategoria: '', descripcion: '', activo: true };

  constructor(
    private categoriaService: AdminCategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.categoriaService.listar().subscribe({
      next: (data) => { this.categorias = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); Swal.fire('Error', 'No se pudieron cargar las categorías', 'error'); }
    });
  }

  abrirNuevo(): void {
    this.editando = false;
    this.categoriaEditId = null;
    this.form = { nombreCategoria: '', descripcion: '', activo: true };
    this.mostrarForm = true;
  }

  abrirEditar(c: AdminCategoria): void {
    this.editando = true;
    this.categoriaEditId = c.idCategoria;
    this.form = { nombreCategoria: c.nombreCategoria, descripcion: c.descripcion, activo: c.activo };
    this.mostrarForm = true;
  }

  cerrarForm(): void { this.mostrarForm = false; }

  guardar(): void {
    if (!this.form.nombreCategoria.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning'); return;
    }
    this.guardando = true;
    const req$ = this.editando
      ? this.categoriaService.actualizar(this.categoriaEditId!, this.form)
      : this.categoriaService.crear(this.form);

    req$.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm = false;
        this.cargar();
        Swal.fire({ icon: 'success', title: this.editando ? 'Categoría actualizada' : 'Categoría creada', timer: 1400, showConfirmButton: false });
      },
      error: () => { this.guardando = false; Swal.fire('Error', 'No se pudo guardar', 'error'); }
    });
  }

  toggleActivo(c: AdminCategoria): void {
    this.categoriaService.toggleActivo(c.idCategoria).subscribe({
      next: (res) => { c.activo = res.activo; this.cdr.detectChanges(); Swal.fire({ icon: 'success', title: res.mensaje || 'Estado actualizado', timer: 1200, showConfirmButton: false }); },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }

  eliminar(c: AdminCategoria): void {
    if (c.totalProductos > 0) {
      Swal.fire('No permitido', `Esta categoría tiene ${c.totalProductos} productos. Muévelos primero.`, 'warning'); return;
    }
    Swal.fire({
      title: '¿Eliminar categoría?', text: c.nombreCategoria, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#601C1D', cancelButtonColor: '#999',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoriaService.eliminar(c.idCategoria).subscribe({
          next: () => {
            this.categorias = this.categorias.filter(x => x.idCategoria !== c.idCategoria);
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1200, showConfirmButton: false });
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}