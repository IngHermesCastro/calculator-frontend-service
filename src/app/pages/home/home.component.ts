import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  irAlFormulario() {
      Swal.fire({
        icon: "warning",
        title: "Importante",
        html: `
          <div style="text-align: left;">
            <p>Los datos que usted ingresa en esta plataforma:</p>
            <ul>
              <li>No se almacenan en ninguna base de datos.</li>
              <li>No se utilizan para ningún otro propósito que no sea la generación del informe solicitado.</li>
              <li>Se eliminan automáticamente una vez que el documento PDF ha sido generado.</li>
              <li>Puede ingresar datos ficticios de empresas u otros elementos si lo desea.</li>
            </ul>
            <p><b>Nota:</b> El objetivo principal de esta herramienta es proporcionar cálculos precisos y demostrar la metodología aplicada.</p>
            <p>La calculadora y sus fórmulas son el elemento central de esta aplicación, diseñada exclusivamente como herramienta educativa y profesional para facilitar el trabajo en el ámbito de la Seguridad Industrial.</p>
            <p><b>Su privacidad es nuestra prioridad.</b> Utilice esta herramienta con total confianza.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Acepto y deseo continuar",
        cancelButtonText: "No acepto y deseo salir",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        backdrop: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['seguridad-higiene/form-info-s-h']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.router.navigate(['/**/']);
        }
      });
    }
}
