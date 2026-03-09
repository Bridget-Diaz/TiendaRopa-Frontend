import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/footer/footer.component'; // ruta correcta

@Component({
  selector: 'app-contactanos',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './contactanos.component.html',
  styleUrls: ['./contactanos.component.css']
})
export class ContactanosComponent {}