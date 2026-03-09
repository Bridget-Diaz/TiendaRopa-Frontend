import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  registrar() {
  this.submitted = true;

  if (this.registerForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Formulario incompleto',
      text: 'Completa todos los campos correctamente',
      confirmButtonColor: '#601C1D'
    });
    return;
  }

  

const data = {
  nombre: this.f['nombre'].value.trim(),
  apellido: this.f['apellido'].value.trim(),
  email: this.f['email'].value.trim(),
  password: this.f['password'].value,
  rol: { nombreRol: 'COMPRADOR' } 
};


  console.log('Enviando registro:', data);

  this.auth.register(data).subscribe({
    next: (res: any) => {
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso! 🎉',
        text: res.mensaje || 'Ahora puedes iniciar sesión',
        confirmButtonColor: '#601C1D'
      }).then(() => {
        this.registerForm.reset();
        this.submitted = false;
        this.router.navigate(['/login']);
      });
    },
    error: (err) => {
      console.error('Error completo al registrar:', err);
      let mensaje = 'Error al registrar usuario';
      if (err.error?.mensaje) {
        mensaje = err.error.mensaje;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        confirmButtonColor: '#601C1D'
      });
    }
  });
}

}
