import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MisPedidosService } from '../../core/services/mis-pedidos.service';

export interface PedidoDetalle {
  idPedido: number;
  fecha: string;
  total: number;
  estado: string;
  metodoPago: string;
  items: {
    nombreProducto: string;
    talla: string | null;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {

  pedido: PedidoDetalle | null = null;
  loading = true;
  error: string | null = null;

  estados = [
    { key: 'PENDIENTE',      label: 'Pendiente',       icon: '⏳' },
    { key: 'EN_PREPARACION', label: 'En preparación',  icon: '📦' },
    { key: 'ENVIADO',        label: 'Enviado',          icon: '🚚' },
    { key: 'ENTREGADO',      label: 'Entregado',        icon: '✅' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private misPedidosService: MisPedidosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/mis-pedidos']); return; }
    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.misPedidosService.obtenerDetalle(id).subscribe({
      next: (data) => {
        this.pedido = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el pedido.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoIndex(): number {
    if (!this.pedido) return 0;
    return this.estados.findIndex(e => e.key === this.pedido!.estado);
  }

  esCancelado(): boolean { return this.pedido?.estado === 'CANCELADO'; }
  volver(): void { this.router.navigate(['/mis-pedidos']); }
}