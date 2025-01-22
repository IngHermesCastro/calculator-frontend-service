import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-indicadores-s-h',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-indicadores-s-h.component.html',
  styleUrl: './form-indicadores-s-h.component.css'
})
export class FormIndicadoresSHComponent {
  form!: FormGroup;
  private readonly _formSvc = inject(RiesgosService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.iniciarForm();
  }

  iniciarForm() {
    this.form = this.fb.group({
      indiceFrecuencia: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0]
      }),
      indiceGravedad: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0]
      }),
      tasaRiesgo: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0]
      }),
      // Making these fields optional by removing Validators.required
      capacitacionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: [0]
      }),
      inspeccionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: [0]
      }),
      observacionesCSeguros: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: [0]
      }),
      correcionConInseguras: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: [0]
      }),
      cumplimientoUsoEPP: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: [0]
      })
    });

    Object.keys(this.form.controls).forEach(indicador => {
      const controls = this.form.get(indicador) as FormGroup;
      if (controls) {
        controls.valueChanges.subscribe(() => {
          this.calcularResultado(indicador);
        });
      }
    });
  }

  calcularResultado(indicador: string) {
    const controls = this.form.get(indicador) as FormGroup;
    if (controls) {
      const numerador = controls.get('numerador')?.value || 0;
      const denominador = controls.get('denominador')?.value || 1;
      let resultado = 0;
      switch (indicador) {
        case 'indiceFrecuencia':
          resultado = denominador > 0 ? ((numerador * 200) / denominador) * 100 : 0;
          break;
        case 'indiceGravedad':
          resultado = denominador > 0 ? ((numerador * 200) / denominador) * 100 : 0;
          break;
        case 'tasaRiesgo':
          resultado = denominador > 0 ? (numerador / denominador) : 0;
          break;
        default:
          resultado = denominador > 0 ? (numerador / denominador) * 100 : 0;
      }
      controls.patchValue({ resultado: resultado.toFixed(2) }, { emitEvent: false });
    }
  }

  regresar() {
    this.router.navigate(['seguridad-higiene/form-info-s-h']);
  }

  async continuar() {
    if (this.form.valid) {
      this._formSvc.setForm2(this.form.value);
      try {
        await this._formSvc.newForm();
        this.router.navigate(['/seguridad-higiene']);
      } catch (error) {
        console.error('Error al guardar el formulario:', error);
      }
    }
  }
}