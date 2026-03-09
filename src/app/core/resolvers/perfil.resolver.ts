import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const perfilResolver: ResolveFn<any> = () => {
  const auth = inject(AuthService);
  return auth.getPerfil();
};
