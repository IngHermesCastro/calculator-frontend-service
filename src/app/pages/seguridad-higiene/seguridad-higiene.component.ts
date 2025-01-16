import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
          this.router.url.includes('form-indicadores-s-h');
      });
  }

  irAlFormulario() {
    this.router.navigate(['seguridad-higiene/form-info-s-h']);
  }
}