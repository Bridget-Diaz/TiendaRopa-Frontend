import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  template: `
    @if (!esRutaAdmin()) {
      <app-header></app-header>
    }

    <router-outlet></router-outlet>
  `
})
export class AppComponent {

  constructor(private router: Router) {}

  esRutaAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}