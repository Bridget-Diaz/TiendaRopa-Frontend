import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MisPedidosService, PedidoResponse } from '../../core/services/mis-pedidos.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {

  pedidos: PedidoResponse[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private misPedidosService: MisPedidosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.error = null;
    this.misPedidosService.obtenerMisPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err.status, err.error);
        this.error = 'No se pudieron cargar los pedidos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente', 'EN_PREPARACION': 'estado-preparacion',
      'ENVIADO': 'estado-enviado', 'ENTREGADO': 'estado-entregado', 'CANCELADO': 'estado-cancelado'
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

  verDetalle(id: number): void { this.router.navigate(['/pedido', id]); }
  irAlInicio(): void { this.router.navigate(['/home']); }
  seguirComprando(): void { this.router.navigate(['/producto']); }
}