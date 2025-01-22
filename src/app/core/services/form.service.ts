import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, query, where, DocumentData } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Form } from '../interfaces/form';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Riesgo } from '../interfaces/riesgos';

@Injectable({
  providedIn: 'root'
})
export class RiesgosService {
  private readonly _firestore = inject(Firestore);
  private readonly _formCollection = collection(this._firestore, 'forms');
  private readonly _riesgosCollection = collection(this._firestore, 'riesgos');
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      actividadEconomica: ['', Validators.required],
      cantidadHombres: [0, [Validators.required, Validators.min(0)]],
      cantidadMujeres: [0, [Validators.required, Validators.min(0)]],
      empresaTipo: ['', Validators.required],
      provincia: ['', Validators.required],
      tipoInstitucion: [{ value: '', disabled: true }, Validators.required],
      comiteParitario: ['', Validators.required],
      monitorSeguridad: ['', Validators.required],
      indiceFrecuencia: [{ value: 0, disabled: true }, Validators.min(0)],
      indiceGravedad: [{ value: 0, disabled: true }, Validators.min(0)],
      tasaRiesgo: [{ value: 0, disabled: true }, Validators.min(0)],
      capacitacionesSeguridad: [{ value: 0, disabled: true }, Validators.min(0)],
      inspeccionesSeguridad: [{ value: 0, disabled: true }, Validators.min(0)],
      observacionesCSeguros: [{ value: 0, disabled: true }, Validators.min(0)],
      correcionConInseguras: [{ value: 0, disabled: true }, Validators.min(0)],
      cumplimientoUsoEPP: [{ value: 0, disabled: true }, Validators.min(0)],
      numeroTrabajadores: [{ value: '', disabled: true }],
      nivelDeRiesgo: [{ value: '', disabled: true }],
      horasMinimasGestion: [{ value: '', disabled: true }],
      personalSaludDetalles: [{ value: '', disabled: true }]
    });
  }

  newForm(): Promise<any> {
    const formData = this.form.getRawValue();
    const formValues: Form = {
      ...formData,
      indiceFrecuencia: formData.indiceFrecuencia.resultado,
      indiceGravedad: formData.indiceGravedad.resultado,
      tasaRiesgo: formData.tasaRiesgo.resultado,
      capacitacionesSeguridad: formData.capacitacionesSeguridad.resultado,
      inspeccionesSeguridad: formData.inspeccionesSeguridad.resultado,
      observacionesCSeguros: formData.observacionesCSeguros.resultado,
      correcionConInseguras: formData.correcionConInseguras.resultado,
      cumplimientoUsoEPP: formData.cumplimientoUsoEPP.resultado
    };
    return addDoc(this._formCollection, formValues);
  }

  obtenerTodasLasActividades(): Observable<Riesgo[]> {
    return collectionData(this._riesgosCollection, { idField: 'id' }) as Observable<Riesgo[]>;
  }

  buscarActividades(searchTerm: string): Observable<Riesgo[]> {
    const q = query(this._riesgosCollection, where('descripcion', '>=', searchTerm), where('descripcion', '<=', searchTerm + '\uf8ff'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((riesgos: DocumentData[]) => riesgos.filter((actividad: DocumentData) => 
        (actividad['descripcion'] || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) as Riesgo[])
    );
  }

  getNivelDeRiesgo(descripcion: string): Observable<string> {
    const q = query(this._riesgosCollection, where('descripcion', '==', descripcion));
    return collectionData(q, { idField: 'id' }).pipe(
      map(riesgos => {
        if (riesgos.length > 0 && riesgos[0]['nivel_de_riesgo']) {
          return riesgos[0]['nivel_de_riesgo'];
        } else {
          console.warn('No se encontró el nivel de riesgo para la actividad:', descripcion);
          return '';
        }
      }),
      catchError(error => {
        console.error('Error al obtener el nivel de riesgo:', error);
        return of('');
      })
    );
  }

  setForm1(formValue: Partial<Form>) {
    this.form.patchValue(formValue);
  }
  
  setForm2(pForm: Partial<Form>) {
    this.form.patchValue(pForm);
  }

  setTipoEmpresa(totalTrabajadores: number): string {
    if (totalTrabajadores >= 1 && totalTrabajadores <= 9) {
      return 'Micro';
    } else if (totalTrabajadores >= 10 && totalTrabajadores <= 49) {
      return 'Pequeña';
    } else if (totalTrabajadores >= 50 && totalTrabajadores <= 99) {
      return 'Mediana A';
    } else if (totalTrabajadores >= 100 && totalTrabajadores <= 199) {
      return 'Mediana B';
    } else if (totalTrabajadores >= 200) {
      return 'Grande';
    }
    return '';
  }

  calcularNumeroTrabajadores(cantidadHombres: number, cantidadMujeres: number): number {
    return cantidadHombres + cantidadMujeres;
  }

  obtenerNivelDeRiesgo(tipoInstitucion: string, actividadEconomica: any): string {
    const actividadEconomicaStr = String(actividadEconomica || '');
    
    if (actividadEconomicaStr.toLowerCase().includes('alto')) {
      return 'Alto';
    } else if (actividadEconomicaStr.toLowerCase().includes('medio')) {
      return 'Medio';
    } else {
      return 'Bajo';
    }
  }

  MinimasGestion(tipoInstitucion: string, nivelDeRiesgo: string): string {
    const trabajadores = this.calcularNumeroTrabajadores(this.form.get('cantidadHombres')?.value, this.form.get('cantidadMujeres')?.value);
    let horas = '';

    if (tipoInstitucion === 'Micro') {
      horas = nivelDeRiesgo === 'Bajo/Medio' ? '8 horas/mes' : '16 horas/mes';
    } else if (tipoInstitucion === 'Pequeña') {
      if (nivelDeRiesgo === 'Bajo') horas = '16 horas/mes';
      else if (nivelDeRiesgo === 'Medio') horas = '32 horas/mes';
      else horas = '48 horas/mes';
    } else if (tipoInstitucion === 'Mediana A') {
      if (nivelDeRiesgo === 'Bajo') horas = '32 horas/mes';
      else if (nivelDeRiesgo === 'Medio') horas = '48 horas/mes';
      else horas = '64 horas/mes';
    } else if (tipoInstitucion === 'Mediana B') {
      horas = 'Personal permanente (8 horas diarias)';
    } else if (tipoInstitucion === 'Grande') {
      if (nivelDeRiesgo === 'Bajo/Medio') {
        horas = `Personal permanente (8 horas diarias) * por técnico de seguridad e higiene del trabajo`;
      } else {
        horas = `Personal permanente (8 horas diarias) * por técnico de seguridad e higiene del trabajo`;
      }
    }

    return horas;
  }

  obtenerPersonalSaludDetalles(tipoInstitucion: string, numeroTrabajadores: number): string {
    if (!tipoInstitucion) return '';

    let detalles = '';
    
    if (tipoInstitucion === 'Micro' || tipoInstitucion === 'Pequeña') {
      detalles = 'Un profesional médico con formación en 4to nivel en seguridad y salud en el trabajo de visita periódica.';
    } else if (tipoInstitucion === 'Mediana A' || tipoInstitucion === 'Mediana B' || tipoInstitucion === 'Grande') {
      detalles = 'Un profesional médico con formación en 4to nivel en seguridad y salud en el trabajo.';
      
      if (tipoInstitucion === 'Grande') {
        detalles += ' Un profesional de enfermería.';
        if (numeroTrabajadores >= 300) {
          detalles += ' Un profesional en psicología.';
        }
        if (numeroTrabajadores >= 1000) {
          detalles += ' Un profesional médico con especialidad en Medicina del trabajo.';
        }
      }
    }

    return detalles;
  }

  unirFormularios(): Form {
    return {
      ...this.form.value, // Asegúrate de que 'this.form' tiene todos los campos necesarios
    };
  }

  obtenerHorasMinimasGestion(tipoInstitucion: string, nivelDeRiesgo: string): string {
    if (!tipoInstitucion || !nivelDeRiesgo) return '';

    switch (tipoInstitucion) {
      case 'Micro':
        return nivelDeRiesgo.toLowerCase().includes('bajo') || nivelDeRiesgo.toLowerCase().includes('medio') 
          ? '8 horas/mes' 
          : '16 horas/mes';
      case 'Pequeña':
        if (nivelDeRiesgo.toLowerCase().includes('bajo')) return '16 horas/mes';
        if (nivelDeRiesgo.toLowerCase().includes('medio')) return '32 horas/mes';
        return '48 horas/mes';
      case 'Mediana A':
        if (nivelDeRiesgo.toLowerCase().includes('bajo')) return '32 horas/mes';
        if (nivelDeRiesgo.toLowerCase().includes('medio')) return '48 horas/mes';
        return '64 horas/mes';
      case 'Mediana B':
      case 'Grande':
        return 'Personal permanente (8 horas diarias)';
      default:
        return '';
    }
  }

  determinarRangoTrabajadores(total: number): string {
    if (total >= 1 && total <= 9) return "1 a 9";
    if (total >= 10 && total <= 49) return "10 a 49";
    if (total >= 50 && total <= 99) return "50 a 99";
    if (total >= 100 && total <= 199) return "100-199";
    if (total >= 200) return "200 en adelante";
    return '';
  }

  determinarMonitorTecnico(tipoInstitucion: string, nivelDeRiesgo: string, totalTrabajadores: number): string {
    let monitorTecnico = '';

    if (tipoInstitucion === 'Micro') {
      if (nivelDeRiesgo.toLowerCase().includes('bajo') || nivelDeRiesgo.toLowerCase().includes('medio')) {
        monitorTecnico = 'Un monitor de seguridad e higiene del trabajo por lugar y/o centro de trabajo';
      } else {
        monitorTecnico = 'Un técnico de seguridad e higiene del trabajo';
      }
    } else if (tipoInstitucion === 'Pequeña') {
      if (nivelDeRiesgo.toLowerCase().includes('bajo') || nivelDeRiesgo.toLowerCase().includes('medio')) {
        monitorTecnico = 'Un monitor de seguridad e higiene del trabajo por lugar y/o centro de trabajo';
      } else {
        monitorTecnico = 'Un técnico de seguridad e higiene del trabajo';
      }
    } else if (tipoInstitucion === 'Mediana A') {
      monitorTecnico = 'Un técnico de seguridad e higiene del trabajo';
    } else if (tipoInstitucion === 'Mediana B') {
      monitorTecnico = 'Un técnico de seguridad e higiene del trabajo';
    } else if (tipoInstitucion === 'Grande') {
      if (nivelDeRiesgo.toLowerCase().includes('bajo') || nivelDeRiesgo.toLowerCase().includes('medio')) {
        monitorTecnico = `Un técnico de seguridad e higiene del trabajo y, por cada 200 trabajadores un técnico adicional`;
      } else {
        monitorTecnico = `Un técnico de seguridad e higiene del trabajo y, por cada 100 trabajadores un técnico adicional`;
      }
    }

    return monitorTecnico;
  }

  actualizarCamposCalculados(formValue: any) {
    const totalTrabajadores = this.calcularNumeroTrabajadores(formValue.cantidadHombres, formValue.cantidadMujeres);
    const tipoInstitucion = this.setTipoEmpresa(totalTrabajadores);
    const nivelDeRiesgo = this.obtenerNivelDeRiesgo(tipoInstitucion, formValue.actividadEconomica);
    const horasMinimasGestion = this.obtenerHorasMinimasGestion(tipoInstitucion, nivelDeRiesgo);
    const personalSaludDetalles = this.obtenerPersonalSaludDetalles(tipoInstitucion, totalTrabajadores);
    let rangoTrabajadores = this.determinarRangoTrabajadores(totalTrabajadores);
    const monitorSeguridad = this.determinarMonitorTecnico(tipoInstitucion, nivelDeRiesgo, totalTrabajadores);

    this.form.patchValue({
      tipoInstitucion: tipoInstitucion,
      numeroTrabajadores: rangoTrabajadores,
      nivelDeRiesgo: nivelDeRiesgo,
      horasMinimasGestion: horasMinimasGestion,
      personalSaludDetalles: personalSaludDetalles,
      monitorSeguridad: monitorSeguridad
    }, { emitEvent: false });
  }
}