import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { RiesgosService } from '../core/services/form.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const formService = inject(RiesgosService);
  const router = inject(Router);

  // Verificar si los datos del formulario están completos
  const formInfoData = formService.getFormInfoData();
    // const formIndicadoresData = formService.getForm2();

  // Si el usuario intenta acceder al formulario de indicadores sin completar el de información
     if (state.url.includes('form-indicadores-s-h') && !formInfoData) {
      router.navigate(['/seguridad-higiene/form-info-s-h']);
       return false; // Bloquear acceso
     }

  // Si el usuario intenta acceder al PDF sin completar los indicadores
    // if (state.url.includes('form-pdf') && !formIndicadoresData) {
    //   router.navigate(['/seguridad-higiene/form-indicadores-s-h']);
    //   return false; // Bloquear acceso
    // }

  return true; // Permitir acceso
};
