// src/app/admin/admin_reportes/reportes.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminPedidoService, AdminPedido } from '../../core/services/admin-pedido.service';
import { AdminProductoService } from '../../core/services/admin-producto.service';

interface MesIngreso { mes: string; total: number; pedidos: number; porcentaje: number; }
interface ProductoVendido { nombre: string; cantidad: number; total: number; porcentaje: number; }

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  loading = true;
  ingresosPorMes: MesIngreso[] = [];
  productosTop: ProductoVendido[] = [];
  totalIngresos = 0;
  totalPedidos = 0;
  ticketPromedio = 0;

  constructor(
    private pedidoService: AdminPedidoService,
    private productoService: AdminProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      pedidos:   this.pedidoService.listar().pipe(catchError(() => of([]))),
      productos: this.productoService.listar().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ pedidos }) => {
        this.procesarDatos(pedidos as AdminPedido[]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  private procesarDatos(pedidos: AdminPedido[]): void {
    const activos = pedidos.filter(p => p.estado !== 'CANCELADO');
    this.totalPedidos   = activos.length;
    this.totalIngresos  = activos.reduce((s, p) => s + p.total, 0);
    this.ticketPromedio = this.totalPedidos > 0 ? this.totalIngresos / this.totalPedidos : 0;

    // Ingresos por mes
    const mapasMes: Record<string, { total: number; pedidos: number }> = {};
    activos.forEach(p => {
      const fecha = new Date(p.fecha);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (!mapasMes[clave]) mapasMes[clave] = { total: 0, pedidos: 0 };
      mapasMes[clave].total   += p.total;
      mapasMes[clave].pedidos += 1;
    });
    const maxMes = Math.max(...Object.values(mapasMes).map(m => m.total), 1);
    this.ingresosPorMes = Object.entries(mapasMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([mes, data]) => ({
        mes: this.formatMes(mes),
        total: data.total,
        pedidos: data.pedidos,
        porcentaje: Math.round((data.total / maxMes) * 100)
      }));

    // Productos más vendidos
    const mapaProducto: Record<string, { cantidad: number; total: number }> = {};
    activos.forEach(p => {
      p.items?.forEach((item: any) => {
        if (!mapaProducto[item.nombreProducto]) mapaProducto[item.nombreProducto] = { cantidad: 0, total: 0 };
        mapaProducto[item.nombreProducto].cantidad += item.cantidad;
        mapaProducto[item.nombreProducto].total    += item.subtotal;
      });
    });
    const maxProd = Math.max(...Object.values(mapaProducto).map(p => p.cantidad), 1);
    this.productosTop = Object.entries(mapaProducto)
      .sort(([, a], [, b]) => b.cantidad - a.cantidad)
      .slice(0, 8)
      .map(([nombre, data]) => ({
        nombre, cantidad: data.cantidad, total: data.total,
        porcentaje: Math.round((data.cantidad / maxProd) * 100)
      }));
  }

  private formatMes(clave: string): string {
    const [year, month] = clave.split('-');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${meses[parseInt(month) - 1]} ${year}`;
  }
}