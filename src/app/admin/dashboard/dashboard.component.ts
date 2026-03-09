// src/app/admin/dashboard/dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminProductoService } from '../../core/services/admin-producto.service';
import { AdminCategoriaService } from '../../core/services/admin-categoria.service';
import { AdminUsuarioService } from '../../core/services/admin-usuario.service';
import { AdminPedidoService } from '../../core/services/admin-pedido.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = true;

  stats = {
    totalProductos: 0,
    productosActivos: 0,
    totalCategorias: 0,
    totalUsuarios: 0,
    usuariosBloqueados: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosEnPreparacion: 0,
    pedidosEnviados: 0,
    ingresoTotal: 0
  };

  pedidosRecientes: any[] = [];

  constructor(
    private productoService: AdminProductoService,
    private categoriaService: AdminCategoriaService,
    private usuarioService: AdminUsuarioService,
    private pedidoService: AdminPedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Dashboard ngOnInit ejecutado');

    forkJoin({
      productos:  this.productoService.listar().pipe(catchError(() => of([]))),
      categorias: this.categoriaService.listar().pipe(catchError(() => of([]))),
      usuarios:   this.usuarioService.listar().pipe(catchError(() => of([]))),
      pedidos:    this.pedidoService.listar().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ productos, categorias, usuarios, pedidos }) => {
        this.stats.totalProductos       = productos.length;
        this.stats.productosActivos     = (productos as any[]).filter(p => p.activo).length;
        this.stats.totalCategorias      = categorias.length;
        this.stats.totalUsuarios        = usuarios.length;
        this.stats.usuariosBloqueados   = (usuarios as any[]).filter(u => u.bloqueado).length;
        this.stats.totalPedidos         = pedidos.length;
        this.stats.pedidosPendientes    = (pedidos as any[]).filter(p => p.estado === 'PENDIENTE').length;
        this.stats.pedidosEnPreparacion = (pedidos as any[]).filter(p => p.estado === 'EN_PREPARACION').length;
        this.stats.pedidosEnviados      = (pedidos as any[]).filter(p => p.estado === 'ENVIADO').length;
        this.stats.ingresoTotal         = (pedidos as any[])
          .filter(p => p.estado !== 'CANCELADO')
          .reduce((sum, p) => sum + p.total, 0);

        this.pedidosRecientes = (pedidos as any[]).slice(0, 5);

        // Forzar detección de cambios
        this.loading = false;
        this.cdr.detectChanges();

        console.log('✅ Dashboard cargado:', this.stats);
      },
      error: (err) => {
        console.error('❌ Error dashboard:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE':      'badge-pendiente',
      'EN_PREPARACION': 'badge-preparacion',
      'ENVIADO':        'badge-enviado',
      'ENTREGADO':      'badge-entregado',
      'CANCELADO':      'badge-cancelado'
    };
    return map[estado] ?? '';
  }
}