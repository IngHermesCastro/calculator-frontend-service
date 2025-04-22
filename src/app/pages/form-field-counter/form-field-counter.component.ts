import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-form-field-counter',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './form-field-counter.component.html',
  styleUrl: './form-field-counter.component.css',
})
export class FormFieldCounterComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() requiredFields: string[] = [];
  @Input() fieldLabels: Record<string, string> = {}; // { 'campo.técnico': 'Label amigable' }


  getFieldLabel(fieldName: string): string {
    return this.fieldLabels[fieldName] || fieldName;
  }

  pendingFields: number = 0;
  showDetails: boolean = false;
  bounce: boolean = false;
  completedFields: string[] = [];
  remainingFields: string[] = [];

  private formSubscription?: Subscription;

  ngOnInit() {
    // Inicializar contadores
    this.updatePendingFields();
    this.onWindowScroll();


    // Suscribirse a cambios en el formulario
    this.formSubscription = this.form.valueChanges.subscribe(() => {
      const previousCount = this.pendingFields;
      this.updatePendingFields();

      // Activar animación si el contador cambió
      if (previousCount !== this.pendingFields) {
        this.bounce = true;
        setTimeout(() => (this.bounce = false), 500);
      }
    });
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const counterContainer = document.querySelector('.counter-container') as HTMLElement;
    if (counterContainer) {
      // Calcula una posición que sea relativa al scroll
      // Esto mantiene el componente visible pero permite que se mueva con el scroll
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;

      // Esto hará que el componente se mantenga a 20px del borde superior visible
      // mientras se hace scroll
      counterContainer.style.top = `${scrollY + 20}px`;

      // Opcionalmente, puedes agregar lógica para que se mantenga visible
      // en todo momento sin salirse de la pantalla
    }
  }
  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  updatePendingFields() {
    this.completedFields = [];
    this.remainingFields = [];

    // Revisar cada campo requerido
    this.requiredFields.forEach((fieldName) => {
      const control = this.form.get(fieldName);

      // Verificar si el campo está completo y es válido
      if (control && control.valid && control.value) {
        this.completedFields.push(fieldName);
      } else {
        this.remainingFields.push(fieldName);
      }
    });

    this.pendingFields = this.remainingFields.length;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getCounterColor(): string {
    if (this.pendingFields === 0) return 'bg-success';
    if (this.pendingFields <= 3) return 'bg-warning';
    return 'bg-danger';
  }

  getCounterText(): string {
    if (this.pendingFields === 0) return '¡Completado!';
    return this.pendingFields === 1 ? 'campo pendiente' : 'campos pendientes';
  }
}
