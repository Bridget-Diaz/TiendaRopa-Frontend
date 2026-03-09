import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductoService, ProductoResponse } from '../../core/services/producto.service';
import { CategoriaService, CategoriaResponse } from '../../core/services/categoria.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  banners = [
    'assets/img/menu/banner01.png', 'assets/img/menu/banner02.png',
    'assets/img/menu/banner03.png', 'assets/img/menu/banner04.png',
    'assets/img/menu/banner05.png'
  ];

  index = 0;
  intervalId!: number;
  usuario: any;
  categories: any[] = [];
  products: ProductoResponse[] = [];

  info = [
    { icon: 'assets/img/menu/nav1.png', number: '11K+', text: 'Clientes satisfechos' },
    { icon: 'assets/img/menu/nav2.png', number: '24-48h', text: 'Entrega rápida' },
    { icon: 'assets/img/menu/nav3.png', number: '100%', text: 'Garantía de calidad' },
    { icon: 'assets/img/menu/nav4.png', number: '4.9/5', text: 'Valoración promedio' }
  ];

  packs = [
    { step: 'assets/img/menu/UNOindex.png', title: 'ELIGE TUS POLOS', text: 'Selecciona 2 o más polos de nuestro catálogo.', image: 'assets/img/menu/poloindex2.jpg', buttonText: 'VER POLOS', categoriaId: 4 },
    { step: 'assets/img/menu/DOSindex.png', title: 'ELIGE TU ESTILO', text: 'Combina a tu gusto.', image: 'assets/img/menu/BaggyIndex3.jpg', buttonText: 'VER PANTALONES', categoriaId: 5 },
    { step: 'assets/img/menu/TRESindex.png', title: 'AÑADE UNA GORRA', text: 'Completa tu look con nuestras gorras.', image: 'assets/img/productos/gorras/losangelesnegro.jpg', buttonText: 'VER GORRAS', categoriaId: 6 }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
  if (this.auth.isLogged() && this.auth.getRol() === 'ADMINISTRADOR' 
      && this.router.url === '/home') {          // ← solo desde /home
    this.router.navigate(['/admin/dashboard']);
    return;
  }

    this.intervalId = window.setInterval(() => {
      this.index = (this.index + 1) % this.banners.length;
      this.cdr.detectChanges();
    }, 3000);

    if (this.auth.isLogged()) {
      this.auth.getPerfil().subscribe({
        next: (data) => { this.usuario = data; this.cdr.detectChanges(); },
        error: () => {}
      });
    }

    this.cargarCategorias();
    this.cargarProductosDestacados();
  }

  ngOnDestroy(): void { clearInterval(this.intervalId); }

 agregarCarrito(product: ProductoResponse): void {

  // ❌ Si NO está logueado
  if (!this.auth.isLogged()) {

    Swal.fire({
      icon: 'warning',
      title: 'Debes iniciar sesión',
      text: 'Regístrate o inicia sesión para continuar',
      confirmButtonText: 'Ir al Login'
    }).then(() => {

      this.router.navigate(['/login']);

    });

    return;
  }

  // ✅ Si está logueado → ir al producto
  this.router.navigate(['/producto', product.idProducto]);

}

  agregarCarritoPack(pack: any): void {
    if (!this.auth.isLogged()) {
      Swal.fire({ icon: 'warning', title: '¡Regístrate para continuar!', text: 'Debes iniciar sesión para agregar productos al carrito.', confirmButtonText: 'Ir a Login' })
        .then(() => this.router.navigate(['/login']));
    } else {
      this.verDetallePack(pack);
    }
  }

  navegarCategoria(categoria: any): void {
    if (categoria.id === 'packs') {
      this.router.navigate(['/producto'], { queryParams: { packs: 'todos' } });
    } else {
      this.router.navigate(['/producto'], { queryParams: { categoria: categoria.id } });
    }
  }

  verDetalle(product: ProductoResponse): void { this.router.navigate(['/producto', product.idProducto]); }

  verDetallePack(pack: any): void {
    this.productoService.obtenerPorCategoria(pack.categoriaId).subscribe({
      next: (productos: ProductoResponse[]) => {
        if (productos.length > 0) {
          this.router.navigate(['/producto', productos[0].idProducto]);
        } else {
          Swal.fire('Oops', 'No hay productos en este pack', 'info');
        }
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el pack', 'error')
    });
  }

  onImageError(event: any): void { event.target.src = 'assets/img/productos/default-1.jpg'; }

  cargarCategorias(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: (categorias: CategoriaResponse[]) => {
        const idPolos     = categorias.find(c => c.nombreCategoria === 'POLOS')?.idCategoria || 4;
        const idHoodies   = categorias.find(c => c.nombreCategoria === 'HOODIES')?.idCategoria || 7;
        const idPantalones = categorias.find(c => c.nombreCategoria === 'PANTALONES')?.idCategoria || 5;
        const idsPacks    = [
          categorias.find(c => c.nombreCategoria === 'PACK 1')?.idCategoria || 1,
          categorias.find(c => c.nombreCategoria === 'PACK 2')?.idCategoria || 2,
          categorias.find(c => c.nombreCategoria === 'PACK 3')?.idCategoria || 3
        ];
        this.categories = [
          { id: idPolos,      name: 'Polos',      image: 'assets/img/menu/poloindex2.jpg' },
          { id: idHoodies,    name: 'Hoodies',    image: 'assets/img/menu/hoddiIndex03.jpg' },
          { id: idPantalones, name: 'Pantalones', image: 'assets/img/menu/BaggyIndex2.png' },
          { id: 'packs', idsPacks, name: 'Packs', image: 'assets/img/menu/packeteindex04.jpg' }
        ];
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [
          { id: 4, name: 'Polos',      image: 'assets/img/menu/poloindex2.jpg' },
          { id: 7, name: 'Hoodies',    image: 'assets/img/menu/hoddiIndex03.jpg' },
          { id: 5, name: 'Pantalones', image: 'assets/img/menu/BaggyIndex2.png' },
          { id: 'packs', idsPacks: [1, 2, 3], name: 'Packs', image: 'assets/img/menu/packeteindex04.jpg' }
        ];
        this.cdr.detectChanges();
      }
    });
  }

  cargarProductosDestacados(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (productos: ProductoResponse[]) => {
        const pack1 = productos.find(p => p.idCategoria === 1 && p.imagenesUrl?.length);
        const pack2 = productos.find(p => p.idCategoria === 2 && p.imagenesUrl?.length);
        const pack3 = productos.find(p => p.idCategoria === 3 && p.imagenesUrl?.length);
        this.products = [pack1, pack2, pack3].filter(Boolean) as ProductoResponse[];

        if (this.products.length === 0) {
          this.productoService.obtenerDestacados().subscribe({
            next: (destacados) => {
              this.products = destacados.slice(0, 3);
              this.cdr.detectChanges();
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: () => { this.products = []; this.cdr.detectChanges(); }
    });
  }
}