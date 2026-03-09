// src/app/admin/admin_pedidos/lista-pedidos.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminPedidoService, AdminPedido } from '../../core/services/admin-pedido.service';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.css']
})
export class ListaPedidosComponent implements OnInit {

  pedidos: AdminPedido[] = [];
  pedidosFiltrados: AdminPedido[] = [];
  pedidoSeleccionado: AdminPedido | null = null;
  loading = true;
  filtroActivo = 'TODOS';
  nuevoEstado = '';

  filtros = [
    { valor: 'TODOS',          label: '📋 Todos' },
    { valor: 'PENDIENTE',      label: '⏳ Pendientes' },
    { valor: 'EN_PREPARACION', label: '📦 En preparación' },
    { valor: 'ENVIADO',        label: '🚚 Enviados' },
    { valor: 'ENTREGADO',      label: '✅ Entregados' },
    { valor: 'CANCELADO',      label: '❌ Cancelados' }
  ];

  estadosTimeline = [
    { key: 'PENDIENTE',      label: 'Pendiente',      icon: '⏳' },
    { key: 'EN_PREPARACION', label: 'Preparando',     icon: '📦' },
    { key: 'ENVIADO',        label: 'Enviado',         icon: '🚚' },
    { key: 'ENTREGADO',      label: 'Entregado',       icon: '✅' }
  ];

  // Flujo de estados: qué sigue después de cada estado
  private flujo: Record<string, string> = {
    'PENDIENTE':      'EN_PREPARACION',
    'EN_PREPARACION': 'ENVIADO',
    'ENVIADO':        'ENTREGADO'
  };

  private siguienteLabel: Record<string, string> = {
    'PENDIENTE':      'Preparar',
    'EN_PREPARACION': 'Enviar',
    'ENVIADO':        'Entregar'
  };

  constructor(
    private pedidoService: AdminPedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.pedidoService.listar().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.aplicarFiltro();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
      }
    });
  }

  filtrar(estado: string): void {
    this.filtroActivo = estado;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    this.pedidosFiltrados = this.filtroActivo === 'TODOS'
      ? [...this.pedidos]
      : this.pedidos.filter(p => p.estado === this.filtroActivo);
  }

  contarPorEstado(estado: string): number {
    if (estado === 'TODOS') return this.pedidos.length;
    return this.pedidos.filter(p => p.estado === estado).length;
  }

  verDetalle(p: AdminPedido): void {
    // Si el pedido no tiene items cargados, los trae del backend
    if (!p.items || p.items.length === 0) {
      this.pedidoService.obtener(p.idPedido).subscribe({
        next: (detalle) => {
          this.pedidoSeleccionado = detalle;
          this.nuevoEstado = '';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.pedidoSeleccionado = p;
      this.nuevoEstado = '';
    }
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado = null;
    this.nuevoEstado = '';
  }

  // Avanzar al siguiente estado directamente desde la tabla
  avanzarEstado(p: AdminPedido): void {
    const siguiente = this.flujo[p.estado];
    if (!siguiente) return;

    Swal.fire({
      title: `¿Avanzar pedido #${p.idPedido}?`,
      text: `Estado: ${this.getEstadoLabel(p.estado)} → ${this.getEstadoLabel(siguiente)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#601C1D',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, avanzar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) this.ejecutarCambioEstado(p, siguiente);
    });
  }

  cancelarPedido(p: AdminPedido): void {
    Swal.fire({
      title: `¿Cancelar pedido #${p.idPedido}?`,
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c0392b',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, cancelar pedido',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) this.ejecutarCambioEstado(p, 'CANCELADO');
    });
  }

  // Cambiar estado desde el modal
  cambiarEstado(p: AdminPedido): void {
    if (!this.nuevoEstado) return;
    this.ejecutarCambioEstado(p, this.nuevoEstado);
  }

  private ejecutarCambioEstado(p: AdminPedido, nuevoEstado: string): void {
    this.pedidoService.actualizarEstado(p.idPedido, nuevoEstado).subscribe({
      next: () => {
        // Actualizar en la lista local
        const idx = this.pedidos.findIndex(x => x.idPedido === p.idPedido);
        if (idx !== -1) this.pedidos[idx].estado = nuevoEstado;
        if (this.pedidoSeleccionado?.idPedido === p.idPedido) {
          this.pedidoSeleccionado.estado = nuevoEstado;
        }
        this.aplicarFiltro();
        this.nuevoEstado = '';
        this.cdr.detectChanges();
        Swal.fire({ icon: 'success', title: 'Estado actualizado', text: `→ ${this.getEstadoLabel(nuevoEstado)}`, timer: 1500, showConfirmButton: false });
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
    });
  }

  puedeAvanzar(estado: string): boolean { return !!this.flujo[estado]; }
  puedeCancelar(estado: string): boolean { return estado !== 'ENTREGADO' && estado !== 'CANCELADO'; }
  getSiguienteEstadoLabel(estado: string): string { return this.siguienteLabel[estado] ?? ''; }

  estadosDisponibles(estadoActual: string): { key: string, label: string }[] {
    return this.estadosTimeline
      .filter(e => e.key !== estadoActual)
      .concat([{ key: 'CANCELADO', label: '❌ Cancelado', icon: '' }]);
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'pendiente', 'EN_PREPARACION': 'preparacion',
      'ENVIADO': 'enviado', 'ENTREGADO': 'entregado', 'CANCELADO': 'cancelado'
    };
    return map[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': '⏳ Pendiente', 'EN_PREPARACION': '📦 En preparación',
      'ENVIADO': '🚚 Enviado', 'ENTREGADO': '✅ Entregado', 'CANCELADO': '❌ Cancelado'
    };
    return map[estado] ?? estado;
  }

  getTimelineClass(key: string, estadoActual: string): string {
    const orden = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO'];
    const idxKey = orden.indexOf(key);
    const idxActual = orden.indexOf(estadoActual);
    if (estadoActual === 'CANCELADO') return 'cancelado';
    if (idxKey < idxActual) return 'completado';
    if (idxKey === idxActual) return 'activo';
    return 'pendiente';
  }
}