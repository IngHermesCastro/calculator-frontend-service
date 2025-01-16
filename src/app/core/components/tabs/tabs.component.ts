import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  seleccionado = [false, false, false];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.actualizarTab(event.urlAfterRedirects);
      }
    });
  }

  private actualizarTab(url: string): void {
    switch (url) {
      case '/login':
        this.seleccionado = [false, true, false];
        break;
      case '/seguridad-higiene':
      case '/seguridad-higiene/form-info-s-h':
      case '/seguridad-higiene/form-indicadores-s-h':
        this.seleccionado = [false, false, true];
        break;
      default:
        this.seleccionado = [true, false, false];
        break;
    }
  }

  navegar(direccion: string): void {
    this.router.navigate([direccion]);
  }
}