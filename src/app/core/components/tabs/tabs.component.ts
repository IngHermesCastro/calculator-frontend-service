import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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
  lastScrollTop = 0; // Nueva variable para rastrear posición de scroll

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.actualizarTab(event.urlAfterRedirects);
      }
    });
  }

  private actualizarTab(url: string): void {
    switch (url) {
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

  // Agrega el HostListener para detectar eventos de scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const container = document.getElementById('container');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Si el scroll es mayor a 100px, aplicamos efectos
    if (scrollTop > 100) {
      // Scroll hacia abajo: ocultamos el menú
      if (scrollTop > this.lastScrollTop) {
        container?.classList.add('scroll-down');
        container?.classList.remove('scroll-up');
      }
      // Scroll hacia arriba: mostramos el menú
      else {
        container?.classList.add('scroll-up');
        container?.classList.remove('scroll-down');
      }
    } else {
      // Cerca del top, estado normal
      container?.classList.remove('scroll-down');
      container?.classList.remove('scroll-up');
    }

    this.lastScrollTop = scrollTop;
  }
}
