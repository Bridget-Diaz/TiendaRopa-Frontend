import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  perfil: any;
  inicial = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auth.getPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.inicial = this.perfil.nombre.charAt(0).toUpperCase();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.auth.logout();
          this.router.navigate(['/login']);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el perfil' });
        }
        this.cdr.detectChanges();
      }
    });
  }

  irMisPedidos(): void { this.router.navigate(['/mis-pedidos']); }

  logout(): void {
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
        Swal.fire({ icon: 'success', title: 'Sesión cerrada', timer: 1500, showConfirmButton: false });
        this.router.navigate(['/home']);
      }
    });
  }
}