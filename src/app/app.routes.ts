  import { Routes } from '@angular/router';
  import { HomeComponent } from './cliente/home/home.component';
  import { LoginComponent } from './auth/login/login.component';
  import { RegisterComponent } from './auth/register/register.component';
  import { PerfilComponent } from './auth/perfil/perfil.component';
  import { perfilResolver } from './core/resolvers/perfil.resolver';
  import { AdminLayoutComponent } from './admin/shared/layout/admin-layout.component';
  import { ProductoComponent } from './cliente/producto/producto.component';
  import { ProductoDetalleComponent } from './cliente/producto-detalle/producto-detalle.component';
  import { CarritoComponent } from './cliente/carrito/carrito.component';
  import { authGuard } from './core/guards/auth.guard';
  import { CheckoutComponent } from './cliente/checkout/checkout.component';
  import { MisPedidosComponent } from './cliente/mis-pedidos/mis-pedidos.component';
  import { PedidoDetalleComponent } from './cliente/pedido-detalle/pedido-detalle.component';
  import { NosotrosComponent } from './pages/nosotros/nosotros.component';
  import { ContactanosComponent } from './pages/contactanos/contactanos.component';

  // ── Admin ──────────────────────────────────────────────────────────
  import { DashboardComponent } from './admin/dashboard/dashboard.component';
  import { ListaProductosComponent } from './admin/admin_productos/listproductos.component';
  import { FormProductoComponent } from './admin/admin_productos/form_productos/formproducto.component';
  import { ListaCategoriasComponent } from './admin/admin_categorias/lista-categorias.component';
  import { ListaUsuariosComponent } from './admin/admin_usuarios/lista-usuarios.component';
  import { ListaPedidosComponent } from './admin/admin_pedidos/lista-pedidos.component';
  import { ReportesComponent } from './admin/admin_reportes/reportes.component';

  export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home',      component: HomeComponent },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'contactanos', component: ContactanosComponent },
    { path: 'login',     component: LoginComponent },
    { path: 'registro',  component: RegisterComponent },
    { path: 'producto',  component: ProductoComponent },
    { path: 'producto/:id', component: ProductoDetalleComponent },
    { path: 'checkout',  component: CheckoutComponent },
    { path: 'carrito',   component: CarritoComponent },
    { path: 'pedido/:id', component: PedidoDetalleComponent },
    { path: 'mis-pedidos', component: MisPedidosComponent },
    

    {
      path: 'perfil',
      component: PerfilComponent,
      canActivate: [authGuard],
      resolve: { perfil: perfilResolver }
    },
    
    {
      path: 'admin',
      component: AdminLayoutComponent,
      canActivate: [authGuard],
      data: { role: 'ADMINISTRADOR' },
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },

        // Productos
        { path: 'productos',            component: ListaProductosComponent },
        { path: 'productos/nuevo',      component: FormProductoComponent },
        { path: 'productos/editar/:id', component: FormProductoComponent },

        // Categorías
        { path: 'categorias', component: ListaCategoriasComponent },

        // Usuarios
        { path: 'usuarios', component: ListaUsuariosComponent },

        // Pedidos
        { path: 'pedidos', component: ListaPedidosComponent },

        // Reportes
        { path: 'reportes', component: ReportesComponent }
      ]
    },
    { path: '**', redirectTo: 'home' }
  ];