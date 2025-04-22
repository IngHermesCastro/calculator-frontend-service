import { Component, OnInit, TemplateRef, ViewChild, inject, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormFieldCounterComponent } from "../../form-field-counter/form-field-counter.component";


// Aqui vamos a empezar los cambios
// ok

@Component({
  selector: 'app-form-indicadores-s-h',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldCounterComponent],
  templateUrl: './form-indicadores-s-h.component.html',
  styleUrls: ['./form-indicadores-s-h.component.css'],
})
export class FormIndicadoresSHComponent implements OnInit {
  form!: FormGroup;
  mensaje: { [key: string]: string } = {}; // Objeto para almacenar mensajes por indicador
  focusedFields: { [key: string]: boolean } = {}; // Objeto para rastrear el estado de enfoque
  private readonly _formSvc = inject(RiesgosService);

  // Propiedades para el modal
  @ViewChild('diasCargoModal') diasCargoModal!: TemplateRef<any>;
  modalRef!: NgbModalRef;
  selectedNature: string = '';
  selectedDays: number = 0;

  // Tabla de días de cargo
  tablaDiasCargo = [
    { naturaleza: 'Muerte', jornadas: 6000 },
    { naturaleza: 'Incapacidad permanente absoluta (I.P.A.)', jornadas: 6000 },
    { naturaleza: 'Incapacidad permanente total (I.P.T.)', jornadas: 4500 },
    { naturaleza: 'Pérdida del brazo por encima del codo', jornadas: 4500 },
    {
      naturaleza: 'Pérdida del brazo por encima del codo o debajo',
      jornadas: 3600,
    },
    { naturaleza: 'Pérdida de la mano', jornadas: 3000 },
    { naturaleza: 'Pérdida o invalidez permanente del pulgar', jornadas: 600 },
    {
      naturaleza: 'Pérdida o invalidez permanente de un dedo cualquiera',
      jornadas: 300,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente de dos dedos',
      jornadas: 750,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente de tres dedos',
      jornadas: 1200,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente de cuatro dedos',
      jornadas: 1800,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente del pulgar y un dedo',
      jornadas: 1200,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente del pulgar y dos dedos',
      jornadas: 1500,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente del pulgar y tres dedos',
      jornadas: 2000,
    },
    {
      naturaleza: 'Pérdida o invalidez permanente del pulgar y cuatro dedos',
      jornadas: 2400,
    },
    {
      naturaleza: 'Pérdida de una pierna por encima de la rodilla',
      jornadas: 4500,
    },
    {
      naturaleza: 'Pérdida de una pierna por la rodilla o debajo',
      jornadas: 3000,
    },
    { naturaleza: 'Pérdida del pie', jornadas: 2400 },
    {
      naturaleza:
        'Pérdida o invalidez permanente de dedo gordo o de dos o más dedos del pie',
      jornadas: 300,
    },
    { naturaleza: 'Pérdida de la visión de un ojo', jornadas: 1800 },
    { naturaleza: 'Ceguera total', jornadas: 6000 },
    { naturaleza: 'Pérdida de un oído (uno solo)', jornadas: 600 },
    { naturaleza: 'Sordera total', jornadas: 3000 },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.form = this.fb.group({
      indiceFrecuencia: this.fb.group({
        totalTrabajadores: [''],
        totalHorasTrabajadas: ['', [Validators.required]],
        totalDiasTrabajadas: ['', [Validators.required]],
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador_total: [{ value: '', disabled: true }],
        denominador_horas: [{ value: '', disabled: true }],
        denominador_dias: [null, [Validators.required]],
        resultado: [0],
        mensaje: [''], // Agregar campo para el mensaje
      }),
      indiceGravedad: this.fb.group({
        // numerador: [, [Validators.required, Validators.min(0)]],
        diasPerdidos: [, [Validators.required, Validators.min(1)]],
        diasCargo: [, [Validators.required, Validators.min(1)]],
        denominador_horas: [, [Validators.required, Validators.min(1)]], // Asegúrate de incluir este campo
        denominador_dias: [, [Validators.required, Validators.min(1)]],
        denominador_total: [{ value: '', disabled: true }],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0],
        mensaje: [''], // Agregar campo para el mensaje
      }),
      tasaRiesgo: this.fb.group({
        numerador: [, [Validators.required, Validators.min(0)]],
        denominador: [, [Validators.required, Validators.min(1)]],
        resultado: [0],
        mensaje: [''], // Agregar campo para el mensaje
      }),
      capacitacionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0), Validators.required]],
        denominador: [, [Validators.min(1)]],
        resultado: ['ND'],
      }),
      inspeccionesSeguridad: this.fb.group({
        numerador: [, [Validators.min(0), Validators.required]],
        denominador: [, [Validators.min(1), Validators.required]],
        resultado: ['ND'],
      }),
      observacionesCSeguros: this.fb.group({
        numerador: [, [Validators.min(0), Validators.required]],
        denominador: [, [Validators.min(1), Validators.required]],
        resultado: ['ND'],
      }),
      correcionConInseguras: this.fb.group({
        numerador: [, [Validators.min(0), Validators.required]],
        denominador: [, [Validators.min(1), Validators.required]],
        resultado: ['ND'],
      }),
      cumplimientoUsoEPP: this.fb.group({
        numerador: [, [Validators.min(0), Validators.required]],
        denominador: [, [Validators.min(1), Validators.required]],
        resultado: ['ND'],
      }),
    });
  }
  // Método para abrir el modal
  openDiasCargoModal() {
    this.modalRef = this.modalService.open(this.diasCargoModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'dias-cargo-modal',
    });
  }

  // Método para seleccionar días de cargo
  selectDiasCargo(naturaleza: string, jornadas: number) {
    this.selectedNature = naturaleza;
    this.selectedDays = jornadas;
    this.form.get('indiceGravedad.diasCargo')?.setValue(jornadas);
    this.modalRef.close();
    this.calcularResultado('indiceGravedad');
  }
  ngOnInit(): void {
    this.iniciarForm();

    // Suscribirse al valor de totalTrabajadores
    this._formSvc.totalTrabajadores$.subscribe((totalTrabajadores) => {
      const control = this.form.get('indiceFrecuencia.totalTrabajadores');
      if (control) {
        control.setValue(totalTrabajadores);
        control.disable();

        // Llamar manualmente a onInputChange para actualizar campos dependientes
        this.onInputChange('totalTrabajadores', totalTrabajadores);
      }

      // Recalcular los campos dependientes
      this.recalcularCamposDependientes();
    });
  }

  private recalcularCamposDependientes() {
    // Obtener el valor actual de totalTrabajadores
    const totalTrabajadores = this.form.get(
      'indiceFrecuencia.totalTrabajadores'
    )?.value;

    if (totalTrabajadores) {
      // Actualizar manualmente los campos dependientes
      const denominadorTotalControl = this.form.get(
        'indiceFrecuencia.denominador_total'
      );
      if (denominadorTotalControl) {
        denominadorTotalControl.setValue(totalTrabajadores);
        denominadorTotalControl.disable();
      }
    }

    // Recalcular los resultados de los indicadores
    this.calcularResultado('indiceFrecuencia');
    this.calcularResultado('indiceGravedad');
    this.calcularResultado('tasaRiesgo');
  }

  iniciarForm() {
    Object.keys(this.form.controls).forEach((indicador) => {
      const controls = this.form.get(indicador) as FormGroup;
      if (controls) {
        controls.valueChanges.subscribe(() => {
          this.calcularResultado(indicador);
          if (
            indicador === 'indiceFrecuencia' ||
            indicador === 'indiceGravedad'
          ) {
            this.calcularResultado('tasaRiesgo');
          }
        });
      }
    });
  }

  public fieldMappings: { [key: string]: string[] } = {
    totalTrabajadores: [
      'indiceFrecuencia.denominador_total',
      'capacitacionesSeguridad.denominador',
      'indiceGravedad.denominador_total',
      // 'correcionConInseguras.denominador'
    ],
    totalHorasTrabajadas: [
      'indiceFrecuencia.denominador_horas',
      'indiceGravedad.denominador',
      'indiceGravedad.denominador_horas',
    ],
    totalDiasTrabajadas: [
      'indiceFrecuencia.denominador_dias',
      'indiceGravedad.denominador_dias',
      // 'indiceGravedad.denominador'
    ],
  };

  // Reemplaza tu método onDatosEntradaChange con este:
  onInputChange(fieldName: string, value: string | number): void {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    // Verificar si el campo tiene mapeos definidos
    if (this.fieldMappings[fieldName]) {
      this.fieldMappings[fieldName].forEach((controlPath) => {
        const control = this.form.get(controlPath);
        if (control) {
          control.setValue(numericValue);
          control.disable();
        }
      });
    }
  }

  private generarMensajeProyeccion(
    resultado: number,
    indicador: string
  ): string {
    const proyeccion = Number(resultado.toFixed(2));
    switch (indicador) {
      case 'indiceFrecuencia':
        return proyeccion !== 0
          ? // ? `Al completarse las 200 mil horas de trabajo, se proyecta${proyeccion === 1 ? '' : 'n'} ${proyeccion} accidente${proyeccion === 1 ? '.' : 's.'}`
            // : 'No se han registrado accidentes.';
            `Cuando la empresa haya completado 200mil horas de trabajo tendrá ${proyeccion} accidente${
              proyeccion === 1 ? '.' : 's.'
            }`
          : 'No se han registrado accidentes.';
      case 'indiceGravedad':
        return proyeccion !== 0
          ? `Cuando la empresa complete las 200 mil horas de trabajo, se habrá${
              proyeccion === 1 ? '' : 'n'
            } perdido ${proyeccion} día${proyeccion === 1 ? '.' : 's.'}`
          : 'No se han registrado días perdidos.';
      case 'tasaRiesgo':
        return proyeccion !== 0
          ? // ? `La empresa ha perdido ${proyeccion} día${proyeccion === 1 ? '' : 's'} debido a accidentes laborales.`
            `Cada vez que ocurre un accidente con baja, la empresa pierde en promedio  ${proyeccion} dia${
              proyeccion === 1 ? '' : 's'
            } de trabajo.`
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
      const diasPerdidos = controls.get('diasPerdidos')?.value || 1;
      const diasCargo = controls.get('diasCargo')?.value || 1;
      let resultado = 0;
      const ask = denominador_t * denominador_h * denominador_d;

      switch (indicador) {

        case 'indiceFrecuencia':

          resultado = denominador > 0 ? (numerador * 200000) / ask : 0;
          break;
        case 'indiceGravedad':
          const sum = diasCargo + diasPerdidos;
          resultado = denominador > 0 ? (sum * 200000) / ask : 0;
          break;
        case 'tasaRiesgo':
          const igValue = this.form.get('indiceGravedad.resultado')?.value || 0;
          const ifValue =
            this.form.get('indiceFrecuencia.resultado')?.value || 1;

          controls.get('numerador')?.setValue(igValue, { emitEvent: false });
          controls.get('denominador')?.setValue(ifValue, { emitEvent: false });

          resultado = ifValue > 0 ? igValue / ifValue : 0;
          break;
        default:
          resultado = denominador > 0 ? (numerador / denominador) * 100 : 0;
      }

      controls.patchValue(
        { resultado: resultado.toFixed(2) },
        { emitEvent: false }
      );

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

  // Función para manejar el enfoque de los inputs
  onFocus(fieldName: string) {
    this.focusedFields[fieldName] = true;
  }

  // Función para manejar el desenfoque de los inputs
  onBlur(fieldName: string) {
    this.focusedFields[fieldName] = false;
  }

  // Función para verificar si el label debe flotar
  shouldFloatLabel(fieldName: string): boolean {
    return !!this.form.get(fieldName)?.value || !!this.focusedFields[fieldName];
  }
  get nombreEmpresa() {
    return this.form.get('nombreEmpresa')?.value?.toUpperCase() || '';
  }
}
