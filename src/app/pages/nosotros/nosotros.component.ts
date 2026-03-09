import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/footer/footer.component';// Ajusta la ruta según tu proyecto

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, FooterComponent], // <-- Agregamos FooterComponent
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent {}