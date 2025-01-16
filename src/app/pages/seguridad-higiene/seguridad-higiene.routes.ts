import { Routes } from '@angular/router';
import { SeguridadHigieneComponent } from './seguridad-higiene.component';
import { FormInfoSHComponent } from './form-info-s-h/form-info-s-h.component';
import { FormIndicadoresSHComponent } from './form-indicadores-s-h/form-indicadores-s-h.component';

export const SEGURIDAD_HIGIENE_ROUTES: Routes = [
  {
    path: '',
    component: SeguridadHigieneComponent
  },
  {
    path: 'form-info-s-h',
    component: FormInfoSHComponent
  },
  {
    path: 'form-indicadores-s-h',
    component: FormIndicadoresSHComponent
  }
];