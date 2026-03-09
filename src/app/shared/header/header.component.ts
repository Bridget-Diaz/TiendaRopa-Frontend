import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
// Agregar el import arriba:
import { CarritoService } from '../../core/services/carrito.service';

import { AuthService } from '../../core/services/auth.service';
import { CategoriaService, CategoriaResponse } from '../../core/services/categoria.service';
import { ProductoService, ProductoResponse } from '../../core/services/producto.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLogged = false;
  searchTerm: string = '';
  sugerencias: ProductoResponse[] = [];
  categorias: CategoriaResponse[] = [];
  dropdownOpen: boolean = false;
  cartItemCount: number = 0;

  constructor(
    private auth: AuthService,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private router: Router,
    private carritoService: CarritoService  // ← AGREGAR
  ) {}

  ngOnInit(): void {
   // this.isLogged = this.auth.isLogged();
    this.cargarCategorias();
    this.cargarCarrito();
  }

  // 🔹 Home
  irHome(): void {
    this.router.navigate(['/home']);
  }

  // 🔹 Categoría
  irCategoria(cat: CategoriaResponse): void {
    this.router.navigate(['/producto'], { queryParams: { categoria: cat.idCategoria } });
    this.closeDropdown();
  }

  // 🔹 Carrito
irCarrito(): void {
  this.router.navigate(['/carrito']);
}

  // 🔹 Perfil
irPerfil(): void {

  console.log("Click usuario");

  if (!this.auth.isLogged()) {

    console.log("Redirigiendo a login");

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 10);

    return;
  }

  console.log("Redirigiendo a perfil");

  setTimeout(() => {
    this.router.navigate(['/perfil']);
  }, 10);

}

  // 🔹 Dropdown
  toggleDropdown(): void { this.dropdownOpen = !this.dropdownOpen; }
  closeDropdown(): void { this.dropdownOpen = false; }

  cargarCategorias(): void {
  console.log('📦 Cargando categorías...');
  
  this.categoriaService.obtenerTodas().subscribe({
    next: (data) => {
      console.log('✅ Categorías obtenidas:', data);
      this.categorias = data;
      
      // 👇 Forzar que se vean incluso si el array está vacío (debug)
      if (data.length === 0) {
        console.warn('⚠️ Array vacío, usando datos quemados');
        this.categorias = [
          { idCategoria: 1, nombreCategoria: 'PACK 1', descripcion: '', totalProductos: 7 },
          { idCategoria: 2, nombreCategoria: 'PACK 2', descripcion: '', totalProductos: 6 },
          { idCategoria: 3, nombreCategoria: 'PACK 3', descripcion: '', totalProductos: 6 },
          { idCategoria: 4, nombreCategoria: 'POLOS', descripcion: '', totalProductos: 7 },
          { idCategoria: 5, nombreCategoria: 'PANTALONES', descripcion: '', totalProductos: 6 },
          { idCategoria: 6, nombreCategoria: 'GORRAS', descripcion: '', totalProductos: 4 },
          { idCategoria: 7, nombreCategoria: 'HOODIES', descripcion: '', totalProductos: 6 }
        ];
      }
    }
  });
}

// Reemplazar cargarCarrito():
cargarCarrito(): void {
  this.carritoService.cantidadItems$.subscribe(cantidad => {
    this.cartItemCount = cantidad;
  });

  if (this.auth.isLogged()) {
    this.carritoService.obtenerCarrito().subscribe({
      next: () => {},
      error: () => {} // ← silenciar errores, no redirigir
    });
  }
}

  onSearchInput(): void {
    if (this.searchTerm.length >= 2) {
      this.productoService.buscar(this.searchTerm).subscribe({
        next: (productos) => this.sugerencias = productos.slice(0, 5),
        error: () => this.sugerencias = []
      });
    } else {
      this.sugerencias = [];
    }
  }

  buscarProductos(): void {
    if (this.searchTerm.trim()) {
      this.sugerencias = [];
      this.router.navigate(['/producto'], { queryParams: { busqueda: this.searchTerm } });
    }
  }

  seleccionarSugerencia(producto: ProductoResponse): void {
    this.sugerencias = [];
    this.searchTerm = '';
    this.router.navigate(['/producto', producto.idProducto]);
  }

 @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {

  const target = event.target as HTMLElement;

  // ✅ Ignorar click en iconos
  if (target.closest('.icon')) return;

  if (!target.closest('.dropdown')) this.dropdownOpen = false;
  if (!target.closest('.search-box')) this.sugerencias = [];

}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
