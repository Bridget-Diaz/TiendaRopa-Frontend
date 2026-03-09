import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckoutService, CheckoutRequest } from '../../core/services/checkout.service';
import { CarritoService, CarritoItem } from '../../core/services/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  items: CarritoItem[] = [];
  loadingCarrito = true;
  enviando = false;
  metodoPago: 'YAPE' | 'TARJETA' = 'YAPE';

  form: CheckoutRequest = {
    nombre: '', apellido: '', dni: '', direccion: '',
    referencia: '', ciudad: '', codigoPostal: '', telefono: '', metodoPago: 'YAPE'
  };

  constructor(
    private checkoutService: CheckoutService,
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.items = data;
        this.loadingCarrito = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCarrito = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarMetodo(metodo: 'YAPE' | 'TARJETA'): void {
    this.metodoPago = metodo;
    this.form.metodoPago = metodo;
  }

  get total(): number { return this.carritoService.calcularTotal(this.items); }

  confirmarPedido(): void {
    if (!this.form.nombre || !this.form.apellido || !this.form.dni ||
        !this.form.direccion || !this.form.ciudad || !this.form.telefono) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos obligatorios', confirmButtonColor: '#601C1D' });
      return;
    }
    if (this.form.dni.length !== 8) {
      Swal.fire({ icon: 'warning', title: 'DNI inválido', text: 'El DNI debe tener 8 dígitos', confirmButtonColor: '#601C1D' });
      return;
    }

    this.enviando = true;
    this.form.metodoPago = this.metodoPago;

    this.checkoutService.procesarCheckout(this.form).subscribe({
      next: (res) => {
        this.enviando = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'success', title: '¡Pedido confirmado!',
          html: `<p>Tu pedido <strong>#${res.idPedido}</strong> fue registrado.</p>
                 <p>Total: <strong>S/ ${Number(res.total).toFixed(2)}</strong></p>
                 <p>Método de pago: <strong>${res.metodoPago}</strong></p>`,
          confirmButtonColor: '#601C1D', confirmButtonText: 'Ver mis pedidos'
        }).then(() => this.router.navigate(['/mis-pedidos']));
      },
      error: (err) => {
        this.enviando = false;
        this.cdr.detectChanges();
        Swal.fire({ icon: 'error', title: 'Error al procesar el pedido', text: err.error?.message || 'Intenta nuevamente', confirmButtonColor: '#601C1D' });
      }
    });
  }

  volver(): void { this.router.navigate(['/carrito']); }
}