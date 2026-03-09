import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  // 🔐 Validar si está logueado
  if (!auth.isLogged()) {
    return router.createUrlTree(['/login']);
  }

  // 🔑 Validar rol si la ruta lo requiere
   const requiredRole = route.data?.['role'];
  const userRole = auth.getRol();

  if (requiredRole && userRole !== requiredRole) {
  return router.createUrlTree(['/home']);
}
  console.log('ROL USER:', userRole);
console.log('ROL REQUERIDO:', requiredRole);

  return true;
};
