import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {

  menuOpen = false; // controla el dropdown del perfil

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#601C1D',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then(result => {

      if (result.isConfirmed) {
        this.auth.logout();

        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });

        this.router.navigate(['/login']);
      }

    });
  }
}