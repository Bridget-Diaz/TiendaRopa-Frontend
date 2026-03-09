import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

login() {

  if (!this.email || !this.password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos requeridos',
      text: 'Completa todos los campos',
      confirmButtonColor: '#601C1D'
    });
    return;
  }

  this.auth.login({
    email: this.email,
    password: this.password
  }).subscribe({

    next: (res) => {

      // ✅ Guardar sesión correctamente
      this.auth.saveSession(res.token, res.rol, res.idUsuario);

      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        timer: 1500,
        showConfirmButton: false
      });

      // ✅ Rutas coherentes
      if (res.rol === 'ADMINISTRADOR') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    },

    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo o contraseña incorrectos',
        confirmButtonColor: '#601C1D'
      });
    }

  });
}

}
