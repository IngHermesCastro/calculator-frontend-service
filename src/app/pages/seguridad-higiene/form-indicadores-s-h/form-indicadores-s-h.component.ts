import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-indicadores-s-h',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-indicadores-s-h.component.html',
  styleUrls: ['./form-indicadores-s-h.component.css']
})
export class FormIndicadoresSHComponent implements OnInit {
  form!: FormGroup;
  mensaje: { [key: string]: string } = {}; // Objeto para almacenar mensajes por indicador
  focusedFields: { [key: string]: boolean } = {}; // Objeto para rastrear el estado de enfoque
  private readonly _formSvc = inject(RiesgosService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      indiceFrecuencia: this.fb.group({
        totalTrabajadores: [''],
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador_total: [{ value: '', disabled: true }],
        denominador_horas: [{ value: '', disabled: true }],
        denominador_dias: [null, [Validators.required]],
        resultado: [0],
        mensaje: [''] // Agregar campo para el mensaje
      }),
      indiceGravedad: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0],
        mensaje: [''] // Agregar campo para el mensaje
      }),
      tasaRiesgo: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0],
        mensaje: [''] // Agregar campo para el mensaje
      }),
      capacitacionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND']
      }),
      inspeccionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND']
      }),
      observacionesCSeguros: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND']
      }),
      correcionConInseguras: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND']
      }),
      cumplimientoUsoEPP: this.fb.group({
        numerador: [, [Validators.min(0)]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND']
      })
    });
  }

  ngOnInit(): void {
    this.iniciarForm();
  }

  iniciarForm() {
    Object.keys(this.form.controls).forEach(indicador => {
      const controls = this.form.get(indicador) as FormGroup;
      if (controls) {
        controls.valueChanges.subscribe(() => {
          this.calcularResultado(indicador);
          if (indicador === 'indiceFrecuencia' || indicador === 'indiceGravedad') {
            this.calcularResultado('tasaRiesgo');
        }
        });
      }
    });
  }

  public fieldMappings: { [key: string]: string[] } = {
    totalTrabajadores: [
        'indiceFrecuencia.denominador_total',
        'capacitacionesSeguridad.denominador', // Ejemplo: asignar también al denominador de capacitaciones
        //'correcionConInseguras.denominador'    // Y al de corrección de condiciones inseguras
    ],
    totalHorasTrabajadas: [
        'indiceFrecuencia.denominador_horas',
        'indiceGravedad.denominador'           // Ejemplo: asignar también al denominador del índice de gravedad
    ]
};

// Reemplaza tu método onDatosEntradaChange con este:
onInputChange(fieldName: string, value: string): void {
    const numericValue = Number(value);

    // Verificar si el campo tiene mapeos definidos
    if (this.fieldMappings[fieldName]) {
        this.fieldMappings[fieldName].forEach(controlPath => {
            const control = this.form.get(controlPath);
            if (control) {
                control.setValue(numericValue);
                control.disable();
            }
        });
    }
}

  private generarMensajeProyeccion(resultado: number, indicador: string): string {
    const proyeccion = Number(resultado.toFixed(0));
    switch (indicador) {
      case 'indiceFrecuencia':
        return proyeccion !== 0
          ? `Al completarse las 200 mil horas de trabajo, se proyecta${proyeccion === 1 ? '' : 'n'} ${proyeccion} accidente${proyeccion === 1 ? '.' : 's.'}`
          : 'No se han registrado accidentes.';
      case 'indiceGravedad':
        return proyeccion !== 0
          ? `Cuando la empresa complete las 200 mil horas de trabajo, se habrá${proyeccion === 1 ? '' : 'n'} perdido ${proyeccion} día${proyeccion === 1 ? '.' : 's.'}`
          : 'No se han registrado días perdidos.';
      case 'tasaRiesgo':
        return proyeccion !== 0
        ? `La empresa ha perdido ${proyeccion} día${proyeccion === 1 ? '' : 's'} debido a accidentes laborales.`
        : 'No se han registrado días perdidos.';
      default:
        return `Resultado calculado: ${proyeccion}`;
    }
  }

  calcularResultado(indicador: string) {
  const controls = this.form.get(indicador) as FormGroup;
  if (controls) {
    let numerador = controls.get('numerador')?.value || 0;
    let denominador = controls.get('denominador')?.value || 1;
    const denominador_t = controls.get('denominador_total')?.value || 1;
    const denominador_h = controls.get('denominador_horas')?.value || 1;
    const denominador_d = controls.get('denominador_dias')?.value || 1;
    let resultado = 0;

    switch (indicador) {
      case 'indiceFrecuencia':
        const ask = denominador_t * denominador_h * denominador_d;
        resultado = denominador > 0 ? ((numerador * 200000) / ask) : 0;
        break;
      case 'indiceGravedad':
        resultado = denominador > 0 ? ((numerador * 200000) / denominador) : 0;
        break;
      case 'tasaRiesgo':
        const igValue = this.form.get('indiceGravedad.resultado')?.value || 0;
        const ifValue = this.form.get('indiceFrecuencia.resultado')?.value || 1;

        controls.get('numerador')?.setValue(igValue, { emitEvent: false });
        controls.get('denominador')?.setValue(ifValue, { emitEvent: false });

        resultado = ifValue > 0 ? (igValue / ifValue) : 0;
        break;
      default:
        resultado = denominador > 0 ? (numerador / denominador) * 100 : 0;
    }

    controls.patchValue({ resultado: resultado.toFixed(0) }, { emitEvent: false });

    // Generar y guardar el mensaje en el formulario
    const mensaje = this.generarMensajeProyeccion(resultado, indicador);
    controls.patchValue({ mensaje }, { emitEvent: false });
    this.mensaje[indicador] = mensaje;
  }
}

  regresar() {
    this.router.navigate(['seguridad-higiene/form-info-s-h']);
  }

  async continuar() {
    if (this.form.valid) {
      this._formSvc.setForm2(this.form.value); // Asegúrate de que los mensajes estén incluidos
      try {
        this.router.navigate(['/seguridad-higiene/form-pdf']);
      } catch (error) {
        console.error('Error al guardar el formulario:', error);
      }
    }
  }

  onFocus(fieldName: string) {
    this.focusedFields[fieldName] = true;
  }

  onBlur(fieldName: string) {
    this.focusedFields[fieldName] = false;
  }

  shouldFloatLabel(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control?.value || !!this.focusedFields[fieldName];
  }
}
