import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seguridad-higiene',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './seguridad-higiene.component.html',
  styleUrls: ['./seguridad-higiene.component.css']
})
export class SeguridadHigieneComponent {
  isFormRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isFormRoute =
          this.router.url.includes('form-info-s-h') ||
          this.router.url.includes('form-indicadores-s-h')||
          this.router.url.includes('form-pdf');;
      });
  }

  // irAlFormulario() {
  //   this.router.navigate(['seguridad-higiene/form-info-s-h']);
  // }
  irAlFormulario() {
    Swal.fire({
      icon: "warning",
      title: "IMPORTANTE",
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
