import { Routes } from '@angular/router';
import { SeguridadHigieneComponent } from './pages/seguridad-higiene/seguridad-higiene.component';
import { HomeComponent } from './pages/home/home.component';
import { FormInfoSHComponent } from './pages/seguridad-higiene/form-info-s-h/form-info-s-h.component';
import { FormIndicadoresSHComponent } from './pages/seguridad-higiene/form-indicadores-s-h/form-indicadores-s-h.component';
import { FormPdfComponent } from './pages/seguridad-higiene/form-pdf/form-pdf.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent
    },
    {
        path: "seguridad-higiene",
        component: SeguridadHigieneComponent,
        children: [
            {
                path: "form-info-s-h",
                component: FormInfoSHComponent
            },
            {
                path: "form-indicadores-s-h",
                component: FormIndicadoresSHComponent
            },
            {
                path: "form-pdf",
                component: FormPdfComponent
            }
        ]
    }
];