import { inject, Injectable } from '@angular/core';
import { addDoc, collection, DocumentData, DocumentReference, Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Form } from '../interfaces/form';

@Injectable({
  providedIn: 'root'
})
export class RiesgosService {
  private readonly _firestore = inject(Firestore);
  private readonly _formCollection = collection(this._firestore, 'forms');
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicializamos el formulario basado en la interfaz `Form`
    this.form = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      actividadEconomica: ['', Validators.required],
      cantidadHombres: [0, [Validators.required, Validators.min(0)]],
      cantidadMujeres: [0, [Validators.required, Validators.min(0)]],
      empresaTipo: ['', Validators.required],
      provincia: ['', Validators.required],
      tipoInstitucion: ['', Validators.required],
      comiteParitario: ['', Validators.required],
      monitorSeguridad: ['', Validators.required],
      personalSalud: ['', Validators.required],
      indiceFrecuencia: [0, Validators.min(0)],
      indiceGravedad: [0, Validators.min(0)],
      tasaRiesgo: [0, Validators.min(0)],
      capacitacionesSeguridad: [0, Validators.min(0)],
      inspeccionesSeguridad: [0, Validators.min(0)],
      observacionesCSeguros: [0, Validators.min(0)],
      correcionConInseguras: [0, Validators.min(0)],
      cumplimientoUsoEPP: [0, Validators.min(0)],
    });
  }

  /**
   * Agregar un nuevo formulario a Firestore.
   */
  newForm(): Promise<DocumentReference<DocumentData>> {
    return addDoc(this._formCollection, this.form.value);
  }

  /**
   * Actualizar los datos generales del formulario.
   */
  setForm1(pForm: Partial<Form>) {
    this.form.patchValue({
      nombreEmpresa: pForm.nombreEmpresa || '',
      correoElectronico: pForm.correoElectronico || '',
      actividadEconomica: pForm.actividadEconomica || '',
      cantidadHombres: pForm.cantidadHombres || 0,
      cantidadMujeres: pForm.cantidadMujeres || 0,
      empresaTipo: pForm.empresaTipo || '',
      provincia: pForm.provincia || '',
      tipoInstitucion: pForm.tipoInstitucion || '',
      comiteParitario: pForm.comiteParitario || '',
      monitorSeguridad: pForm.monitorSeguridad || '',
      personalSalud: pForm.personalSalud || '',
    });
  }

  /**
   * Actualizar los indicadores de riesgos.
   */
  setForm2(pForm: Partial<Form>) {
    this.form.patchValue({
      indiceFrecuencia: pForm.indiceFrecuencia || 0,
      indiceGravedad: pForm.indiceGravedad || 0,
      tasaRiesgo: pForm.tasaRiesgo || 0,
      capacitacionesSeguridad: pForm.capacitacionesSeguridad || 0,
      inspeccionesSeguridad: pForm.inspeccionesSeguridad || 0,
      observacionesCSeguros: pForm.observacionesCSeguros || 0,
      correcionConInseguras: pForm.correcionConInseguras || 0,
      cumplimientoUsoEPP: pForm.cumplimientoUsoEPP || 0,
    });
  }
}
