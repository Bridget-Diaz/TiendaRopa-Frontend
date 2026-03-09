import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // ✅ IMPORTANTE: Importar RouterModule


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule], // ✅ IMPORTANTE: Agregar RouterModule a imports
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {}