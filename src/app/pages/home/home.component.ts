import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  ngAfterViewInit(): void {
    // Verificar visibilidad inicial después de que la vista se haya inicializado
    setTimeout(() => {
      this.checkVisibility();
    }, 100);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkVisibility();
  }

  private checkVisibility(): void {
    const elements = document.querySelectorAll('.fade-in-section, .staggered-animation');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect();

      if (elementPosition.top < windowHeight * 0.85) {
        element.classList.add('is-visible');
      }
    });
  }

  navegarASeguridad() {
    this.router.navigate(['/seguridad-higiene']);
  }
}
