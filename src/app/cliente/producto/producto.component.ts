import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService, ProductoResponse } from '../../core/services/producto.service';
import { CategoriaService, CategoriaResponse } from '../../core/services/categoria.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { Params } from '@angular/router';


@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css',
})
export class ProductoComponent implements OnInit {
  productos: ProductoResponse[] = [];
  categorias: CategoriaResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  Math = Math;

  // Filtros
  categoriaSeleccionada: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;
  terminoBusqueda: string = '';
  mostrarDestacados: boolean = false;

  cargando: boolean = true;
  imagenActiva: { [idProducto: number]: number } = {};

  // ✅ NUEVO: Variables de paginación
  paginaActual: number = 1;
  productosPorPagina: number = 6;
  productosPaginados: ProductoResponse[] = [];
  totalPaginas: number = 0;
  paginasVisibles: number[] = [];

  constructor(
  private productoService: ProductoService,
  private categoriaService: CategoriaService,
  private readonly route: ActivatedRoute,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    console.log('✅ ProductoComponent - ngOnInit iniciado');
    this.cargarCategorias();
    
    this.route.queryParams.subscribe((params: Params) => {
      if (params['busqueda']) {
        this.terminoBusqueda = params['busqueda'];
        console.log('🔎 Término de búsqueda desde header:', this.terminoBusqueda);
        this.aplicarFiltros();
      } else if (params['packs'] === 'todos') {
        console.log('📦 Mostrando todos los packs');
        this.categoriaSeleccionada = null;
        this.cargarTodosPacks();
      } else if (params['categoria']) {
        this.categoriaSeleccionada = Number(params['categoria']);
        console.log('📂 Categoría desde query params:', this.categoriaSeleccionada);
        this.cargarProductos();
      } else {
        this.cargarProductos();
      }
    });
    
    this.iniciarCarruselAutomatico();
  }

  cargarCategorias(): void {
    console.log('📂 Cargando categorías...');
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log(`✅ Categorías cargadas: ${data.length}`);
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
      },
    });
  }

  cargarProductos(): void {
    console.log('🛍️ Iniciando carga de productos...');
    this.cargando = true;
    
    if (this.categoriaSeleccionada) {
      this.productoService.obtenerPorCategoria(this.categoriaSeleccionada).subscribe({
        next: (data) => {
          console.log(`✅ Productos de categoría ${this.categoriaSeleccionada}:`, data.length);
          this.productos = data;
          this.productosFiltrados = [...data];
          
          data.forEach(producto => {
            this.imagenActiva[producto.idProducto] = 0;
          });
          
          this.cargando = false;
          this.aplicarPaginacion(); // ✅ NUEVO
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar productos por categoría:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.productoService.obtenerTodos().subscribe({
        next: (data) => {
          console.log(`✅ Productos recibidos: ${data.length}`);
          this.productos = data;
          this.productosFiltrados = [...data];
          
          data.forEach(producto => {
            this.imagenActiva[producto.idProducto] = 0;
          });
          
          this.cargando = false;
          this.aplicarPaginacion(); // ✅ NUEVO
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar productos:', err);
          this.cargando = false;
          this.productosFiltrados = [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  cargarTodosPacks(): void {
    console.log('📦 Cargando todos los packs...');
    this.cargando = true;
    
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        const todosPacks = data.filter(p => p.idCategoria === 1 || p.idCategoria === 2 || p.idCategoria === 3);
        console.log(`✅ Packs encontrados: ${todosPacks.length}`);
        
        this.productos = todosPacks;
        this.productosFiltrados = [...todosPacks];
        
        todosPacks.forEach(producto => {
          this.imagenActiva[producto.idProducto] = 0;
        });
        
        this.cargando = false;
        this.aplicarPaginacion(); // ✅ NUEVO
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar packs:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarImagen(idProducto: number, indice: number): void {
    this.imagenActiva[idProducto] = indice;
  }

  iniciarCarruselAutomatico(): void {
    setInterval(() => {
      this.productosPaginados.forEach(producto => {
        if (producto.imagenesUrl && producto.imagenesUrl.length > 1) {
          const actual = this.imagenActiva[producto.idProducto] || 0;
          const siguiente = (actual + 1) % producto.imagenesUrl.length;
          this.imagenActiva[producto.idProducto] = siguiente;
        }
      });
    }, 3000);
  }

  onCategoriaChange(event: any): void {
    const value = event.target.value;
    
    if (value === 'null' || value === '') {
      this.categoriaSeleccionada = null;
    } else {
      this.categoriaSeleccionada = Number(value);
    }
    
    console.log('📂 Categoría seleccionada:', this.categoriaSeleccionada);
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    console.log('🔍 Aplicando filtros...');
    this.cargando = true;
    this.paginaActual = 1; // ✅ NUEVO: Resetear a página 1

    if (this.terminoBusqueda.trim()) {
      console.log(`🔎 Buscando: "${this.terminoBusqueda}"`);
      this.productoService.buscar(this.terminoBusqueda).subscribe({
        next: (data) => {
          console.log(`✅ Resultados de búsqueda: ${data.length}`);
          this.productosFiltrados = [...data];
          this.cargando = false;
          this.aplicarPaginacion(); // ✅ NUEVO
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error en búsqueda:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
      return;
    }

    const filtros = {
      categoria: this.categoriaSeleccionada || undefined,
      precioMin: this.precioMin || undefined,
      precioMax: this.precioMax || undefined,
      destacado: this.mostrarDestacados || undefined,
    };

    console.log('🔧 Filtros aplicados:', filtros);

    this.productoService.filtrar(filtros).subscribe({
      next: (data) => {
        console.log(`✅ Productos filtrados: ${data.length}`);
        this.productosFiltrados = [...data];
        this.cargando = false;
        this.aplicarPaginacion(); // ✅ NUEVO
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al filtrar:', err);
        this.cargando = false;
        
        if (err.status === 404) {
          console.warn('⚠️ No se encontraron productos con esos filtros');
          this.productosFiltrados = [];
        }
      },
    });
  }

  limpiarFiltros(): void {
    console.log('🧹 Limpiando filtros...');
    this.categoriaSeleccionada = null;
    this.precioMin = null;
    this.precioMax = null;
    this.terminoBusqueda = '';
    this.mostrarDestacados = false;
    this.paginaActual = 1; // ✅ NUEVO: Resetear a página 1
    this.cargarProductos();
  }

  // ✅ NUEVO: Aplicar paginación
  aplicarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
    
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    
    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
    this.calcularPaginasVisibles();
    
    console.log(`📄 Página ${this.paginaActual} de ${this.totalPaginas} - Mostrando ${this.productosPaginados.length} productos`);
    
    // Scroll al inicio de los productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ✅ NUEVO: Calcular páginas visibles (máximo 5)
  calcularPaginasVisibles(): void {
    const maxPaginasVisibles = 5;
    const mitad = Math.floor(maxPaginasVisibles / 2);
    
    let inicio = Math.max(1, this.paginaActual - mitad);
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    // Ajustar inicio si estamos cerca del final
    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }
    
    this.paginasVisibles = [];
    for (let i = inicio; i <= fin; i++) {
      this.paginasVisibles.push(i);
    }
  }

  // ✅ NUEVO: Cambiar de página
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    
    this.paginaActual = pagina;
    this.aplicarPaginacion();
  }

  // ✅ NUEVO: Ir a primera página
  irAPrimeraPagina(): void {
    this.cambiarPagina(1);
  }

  // ✅ NUEVO: Ir a última página
  irAUltimaPagina(): void {
    this.cambiarPagina(this.totalPaginas);
  }

  // ✅ NUEVO: Página anterior
  paginaAnterior(): void {
    this.cambiarPagina(this.paginaActual - 1);
  }

  // ✅ NUEVO: Página siguiente
  paginaSiguiente(): void {
    this.cambiarPagina(this.paginaActual + 1);
  }

  calcularPrecioFinal(producto: ProductoResponse): number {
    return producto.precioDescuento || producto.precio;
  }

  tieneDescuento(producto: ProductoResponse): boolean {
    return !!producto.precioDescuento && producto.precioDescuento < producto.precio;
  }

  calcularPorcentajeDescuento(producto: ProductoResponse): number {
    if (!this.tieneDescuento(producto)) return 0;
    return Math.round(((producto.precio - producto.precioDescuento!) / producto.precio) * 100);
  }
}