import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Riesgo } from 'src/app/core/interfaces/riesgos';

@Component({
  selector: 'app-form-info-s-h',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule],
  templateUrl: './form-info-s-h.component.html',
  styleUrl: './form-info-s-h.component.css'
})
export class FormInfoSHComponent implements OnInit {
  form!: FormGroup;
  todasLasActividades: Riesgo[] = [];
  actividadSeleccionada: Riesgo | null = null;
  private readonly _formSvc = inject(RiesgosService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      actividadEconomica: ['', [Validators.required]],
      cantidadHombres: [0, [Validators.required, Validators.min(0)]],
      cantidadMujeres: [0, [Validators.required, Validators.min(0)]],
      empresaTipo: ['', Validators.required],
      provincia: ['', Validators.required],
      tipoInstitucion: [{ value: '', disabled: true }],
      comiteParitario: ['', Validators.required],
      monitorSeguridad: ['', Validators.required],
      personalSalud: ['', Validators.required],
      numeroTrabajadores: [{ value: 0, disabled: true }],
      nivelDeRiesgo: [{ value: '', disabled: true }],
      horasMinimasGestion: [{ value: '', disabled: true }],
      personalSaludDetalles: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this._formSvc.obtenerTodasLasActividades().subscribe({
      next: (actividades) => {
        this.todasLasActividades = actividades;
        console.log('Actividades cargadas:', this.todasLasActividades);
      },
      error: (error) => {
        console.error('Error al cargar actividades:', error);
      }
    });

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
    
    const tipoInstitucion = this._formSvc.setTipoEmpresa(totalTrabajadores);
    const nivelDeRiesgo = this.actividadSeleccionada?.nivel_de_riesgo || '';
    console.log('Nivel de riesgo:', nivelDeRiesgo);
    console.log('Tipo de institución:', tipoInstitucion);
    const horasMinimasGestion = this._formSvc.obtenerHorasMinimasGestion(tipoInstitucion, nivelDeRiesgo);
    console.log('Horas mínimas de gestión:', horasMinimasGestion);
    const personalSaludDetalles = this._formSvc.obtenerPersonalSaludDetalles(tipoInstitucion, totalTrabajadores);
  
    this.form.patchValue({
      numeroTrabajadores: totalTrabajadores,
      tipoInstitucion: tipoInstitucion,
      nivelDeRiesgo: nivelDeRiesgo,
      horasMinimasGestion: horasMinimasGestion,
      personalSaludDetalles: personalSaludDetalles
    });
  }

  buscarActividad = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        return term === '' ? []
          : this.todasLasActividades
              .filter(actividad => actividad.descripcion.toLowerCase().includes(term.toLowerCase()))
              .slice(0, 10);
      })
    );

  formatearActividad = (actividad: Riesgo) => actividad.descripcion;

  seleccionarActividad(event: { item: Riesgo, preventDefault: Function }) {
    const actividad = event.item;
    if (actividad && actividad.descripcion) {
      this.actividadSeleccionada = actividad;
      this.form.patchValue({
        actividadEconomica: actividad.descripcion
      });
      this.actualizarCamposCalculados();
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
      this._formSvc.setForm1({
        ...formValue,
        actividadEconomica: this.actividadSeleccionada.descripcion
      });
      this.actualizarCamposCalculados();
      this._formSvc.form.patchValue(this.form.value);
      this.router.navigate(['/seguridad-higiene/form-indicadores-s-h']);
    }
  }
}