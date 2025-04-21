import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Riesgo } from 'src/app/core/interfaces/riesgos';
import { Provincia } from 'src/app/core/interfaces/provincias';
import { FormFieldCounterComponent } from "../../form-field-counter/form-field-counter.component";

@Component({
  selector: 'app-form-info-s-h',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule, FormFieldCounterComponent],
  templateUrl: './form-info-s-h.component.html',
  styleUrl: './form-info-s-h.component.css',
})
export class FormInfoSHComponent implements OnInit {
  form!: FormGroup;
  focusedFields: { [key: string]: boolean } = {}; // Objeto para rastrear el estado de enfoque
  todasLasActividades: Riesgo[] = [];
  actividadSeleccionada: Riesgo | null = null;
  provincias: Provincia[] = [];
  ciudades: { id: string; name: string; }[] = [];
  private readonly _formSvc = inject(RiesgosService);
  // Agregar un Subject para controlar cuándo mostrar el menú
  focus$ = new Subject<string>();

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      actividadEconomica: ['', [Validators.required]],
      cantidadHombres: [0, [Validators.required, Validators.min(0)]],
      cantidadMujeres: [0, [Validators.required, Validators.min(0)]],
      empresaTipo: ['', Validators.required],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      tipoInstitucion: [{ value: '', disabled: true }],
      comiteParitario: ['', Validators.required],
      monitorSeguridad: [{ value: '', disabled: true }],
      numeroTrabajadores: [{ value: '', disabled: true }],
      nivelDeRiesgo: [{ value: '', disabled: true }],
      horasMinimasGestion: [{ value: '', disabled: true }],
      personalSaludDetalles: [{ value: '', disabled: true }],
      decretoInformacion: [{ value: '', disabled: true }],
    });
  }

  ngOnInit() {
    /**Cambios Para Guardar los datos Temporal* */
    // Cargar datos guardados si existen
  const savedFormData = this._formSvc.getFormInfoData();
  if (savedFormData) {
    this.form.patchValue(savedFormData);
    // Primero establecemos todos los valores excepto ciudad
    const { ciudad, ...otherFormValues } = savedFormData;
    this.form.patchValue(otherFormValues);
    // Si hay una provincia guardada, cargamos sus ciudades primero
    if (savedFormData.provincia) {
      // Cargar provincias y luego establecer la ciudad
      this._formSvc.obtenerTodasLasProvincias().subscribe({
        next: (provincias) => {
          this.provincias = provincias;
          // Encontrar la provincia seleccionada
          const provincia = this.provincias.find(p => p.name === savedFormData.provincia);
          if (provincia) {
            // Cargar las ciudades de la provincia
            this.ciudades = provincia.cities;

            // Ahora podemos establecer el valor de la ciudad guardada

          }
        }
      });
    }

    // Si hay una actividad económica guardada, buscarla y seleccionarla
    if (savedFormData.actividadEconomica) {
      // Cargar la actividad guardada cuando los datos estén disponibles
      this._formSvc.obtenerTodasLasActividades().subscribe({
        next: (actividades) => {
          this.todasLasActividades = actividades;

          // Buscar la actividad por descripción
          const actividadEncontrada = actividades.find(a =>
            a.descripcion === savedFormData.actividadEconomica ||
            (savedFormData.actividadEconomica.descripcion &&
             a.descripcion === savedFormData.actividadEconomica.descripcion));

          if (actividadEncontrada) {
            this.actividadSeleccionada = actividadEncontrada;
            // Actualizar el formulario con la actividad encontrada
            this.form.patchValue({
              actividadEconomica: actividadEncontrada
            });
          }
        }
      });
    }

    // Actualizar campos calculados después de cargar datos
    setTimeout(() => this.actualizarCamposCalculados(), 100);
  }
    /**Hasta aqui los cambios para Guardar Informacion* */




    // Cargar actividades
    this._formSvc.obtenerTodasLasActividades().subscribe({
      next: (actividades) => {
        this.todasLasActividades = actividades;
        console.log('Actividades cargadas:', this.todasLasActividades);
      },
      error: (error) => {
        console.error('Error al cargar actividades:', error);
      }
    });

    // Cargar provincias
    this._formSvc.obtenerTodasLasProvincias().subscribe({
      next: (provincias) => {
        this.provincias = provincias;
        console.log('Provincias cargadas:', this.provincias);
      },
      error: (error) => {
        console.error('Error al cargar provincias:', error);
      }
    });

    // Observar cambios en la provincia seleccionada
    this.form.get('provincia')?.valueChanges.subscribe((provinciaName) => {
      if (provinciaName) {
        const provincia = this.provincias.find(p => p.name === provinciaName);
        if (provincia) {
          this.ciudades = provincia.cities;
          this.form.patchValue({ ciudad: '' }); // Resetear la ciudad seleccionada
        }
      } else {
        this.ciudades = [];
        this.form.patchValue({ ciudad: '' });
      }
    });

    // Observar cambios en la cantidad de trabajadores
    this.form.get('cantidadHombres')?.valueChanges.subscribe(() => {
      this.actualizarCamposCalculados();
    });

    this.form.get('cantidadMujeres')?.valueChanges.subscribe(() => {
      this.actualizarCamposCalculados();
    });

    this.form.get('actividadEconomica')?.valueChanges.subscribe(() => {
      if (this.actividadSeleccionada) {
        this.actualizarCamposCalculados();
      }
    });


  }


  actualizarCamposCalculados() {
    const formValue = this.form.getRawValue();
    const cantidadHombres = formValue.cantidadHombres || 0;
    const cantidadMujeres = formValue.cantidadMujeres || 0;
    const totalTrabajadores = cantidadHombres + cantidadMujeres;

    // Enviar el valor al servicio
    this._formSvc.setTotalTrabajadores(totalTrabajadores);





    const rangoTrabajadores = this._formSvc.determinarRangoTrabajadores(totalTrabajadores);
    const tipoInstitucion = this._formSvc.setTipoEmpresa(totalTrabajadores);
    const nivelDeRiesgo = this.actividadSeleccionada?.nivel_de_riesgo || '';
    const horasMinimasGestion = this._formSvc.obtenerHorasMinimasGestion(tipoInstitucion, nivelDeRiesgo);
    const personalSaludDetalles = this._formSvc.obtenerPersonalSaludDetalles(tipoInstitucion, totalTrabajadores);
    const monitorSeguridad = this._formSvc.determinarMonitorTecnico(tipoInstitucion, nivelDeRiesgo, totalTrabajadores);

    // Establecer el tipo de comité paritario y el mensaje del decreto
    const comiteInfo = this._formSvc.setTipoComiteParitario(totalTrabajadores);

    this.form.patchValue({
      numeroTrabajadores: rangoTrabajadores,
      tipoInstitucion: tipoInstitucion,
      nivelDeRiesgo: nivelDeRiesgo,
      horasMinimasGestion: horasMinimasGestion,
      personalSaludDetalles: personalSaludDetalles,
      monitorSeguridad: monitorSeguridad,
      comiteParitario: comiteInfo.comiteParitario,
      decretoInformacion: comiteInfo.decretoInformacion
    });
  }

 // Modifica el método buscarActividad
buscarActividad = (text$: Observable<string>) =>
  text$.pipe(
    startWith(''),
    debounceTime(200),
    distinctUntilChanged(),
    map(term => {
      // Si es el foco inicial y no hay término de búsqueda, mostramos las primeras 10 actividades
      if (this.mostrarDropdownInicial && term === '') {
        this.mostrarDropdownInicial = false;
        return this.todasLasActividades.slice(0, 10);
      }

      // Búsqueda normal
      return term === ''
        ? [] // No mostramos nada si el término está vacío (excepto en el foco inicial)
        : this.todasLasActividades.filter(actividad =>
            `${actividad.id} ${actividad.descripcion}`.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 10);
    })
  );
  formatearActividad = (actividad: Riesgo | null) => {
    if (actividad && actividad.id && actividad.descripcion) {
      return `${actividad.id} ${actividad.descripcion}`;
    } else {
      return '';
    }
  };

 seleccionarActividad(event: { item: Riesgo, preventDefault: Function }) {
  const actividad = event.item;
  if (actividad && actividad.descripcion) {
    this.actividadSeleccionada = actividad;
    const valorFormateado = this.formatearActividad(actividad);
    this.actividadSeleccionadaPrevia = valorFormateado;
    this.form.patchValue({
      actividadEconomica: valorFormateado
    });
    this.actualizarCamposCalculados();
    this.mostrarDropdownInicial = false; // Evitamos que se muestre de nuevo al volver a enfocar
  } else {
    console.error('Actividad no seleccionada correctamente o no tiene descripción:', event);
  }
}

  regresar() {
    this.router.navigate(['/seguridad-higiene']);
  }

  continuar() {
    if (this.form.valid && this.actividadSeleccionada) {
      const formValue = this.form.getRawValue();
      const dataToSave = {
        ...formValue,
        actividadEconomica: this.actividadSeleccionada,
        ciudad: formValue.ciudad.name ? formValue.ciudad.name : formValue.ciudad //Obetener la Ciudad Guardada
      };

      // Guardar datos para recuperarlos si volvemos a este componente
      this._formSvc.setFormInfoData(dataToSave);

      // Tu código actual para continuar
      this._formSvc.setForm1({
        ...formValue,
        actividadEconomica: this.actividadSeleccionada.descripcion,
        ciudad: formValue.ciudad.name ? formValue.ciudad.name : formValue.ciudad //Obetener la Ciudad Guardada
      });
      this.actualizarCamposCalculados();
      this._formSvc.form.patchValue(this.form.value);
      this.router.navigate(['/seguridad-higiene/form-indicadores-s-h']);
    }
    /**Cambios Temprales Para Guadar los Datos de Forma Temporal* */

  }
// Método para mostrar las actividades al hacer clic
showDropdown = false;
private actividadSeleccionadaPrevia: string = '';
private mostrarDropdownInicial: boolean = true;
mostrarActividades(event: any) {
  event.preventDefault();
  this.showDropdown = true;
  // Disparamos un evento de búsqueda vacía para mostrar todas las opciones
  this.focus$.next('');
}
// Método para manejar el foco en el campo de actividad económica
onFocusActividadEconomica() {
  this.onFocus('actividadEconomica');

  // Solo mostramos el dropdown inicial si no hay una actividad seleccionada
  // o si el valor actual es diferente al previamente seleccionado
  const valorActual = this.form.get('actividadEconomica')?.value;
  if (!this.actividadSeleccionada || valorActual !== this.actividadSeleccionadaPrevia) {
    this.mostrarDropdownInicial = true;
    this.focus$.next('');
  }
}

  /**PARA LA VALIDACION EN TIME REALTIME */
// Función para manejar el enfoque de los inputs
onFocus(fieldName: string) {
  this.focusedFields[fieldName] = true;
}

// Función para manejar el desenfoque de los inputs
onBlur(fieldName: string) {
  this.focusedFields[fieldName] = false;
  if (fieldName === 'actividadEconomica') {
    this.showDropdown = true;
  }
}
// Función para verificar si el label debe flotar
shouldFloatLabel(fieldName: string): boolean {
  return !!this.form.get(fieldName)?.value || !!this.focusedFields[fieldName];
}
get nombreEmpresa() {
  return this.form.get('nombreEmpresa')?.value?.toUpperCase() || '';
}

// Método para abrir el menú desplegable al hacer foco

}
