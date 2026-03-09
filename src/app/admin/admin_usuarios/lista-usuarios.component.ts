// src/app/admin/admin_usuarios/lista-usuarios.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminUsuarioService, AdminUsuario } from '../../core/services/admin-usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {

  usuarios: AdminUsuario[] = [];
  loading = true;

  constructor(
    private usuarioService: AdminUsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.usuarioService.listar().subscribe({
      next: (data) => { this.usuarios = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error'); }
    });
  }

  toggleBloqueo(u: AdminUsuario): void {
    const accion = u.bloqueado ? 'desbloquear' : 'bloquear';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `${u.nombre} ${u.apellido}`, icon: 'question',
      showCancelButton: true, confirmButtonColor: '#601C1D', cancelButtonColor: '#999',
      confirmButtonText: 'Sí', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.toggleBloqueo(u.idUsuario).subscribe({
          next: (res) => {
            u.bloqueado = res.bloqueado;
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: res.mensaje || 'Estado actualizado', timer: 1200, showConfirmButton: false });
          },
          error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
        });
      }
    });
  }

  getRolClass(rol: string): string {
    return rol === 'administrador' ? 'rol-admin' : 'rol-user';
  }
}