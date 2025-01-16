import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiesgosService } from 'src/app/core/services/form.service';

@Component({
  selector: 'app-form-info-s-h',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-info-s-h.component.html',
  styleUrl: './form-info-s-h.component.css'
})
export class FormInfoSHComponent {
  form!: FormGroup;
  private readonly _formSvc = inject(RiesgosService);
  
  constructor(private fb: FormBuilder,private router: Router) {
    this.form = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      actividadEconomica: ['', Validators.required],
      cantidadHombres: ['', [Validators.required, Validators.min(0)]],
      cantidadMujeres: ['', [Validators.required, Validators.min(0)]],
      empresaTipo: ['', Validators.required],
      provincia: ['', Validators.required],
      tipoInstitucion: ['', Validators.required],
      comiteParitario: ['', Validators.required],
      monitorSeguridad: ['', Validators.required],
      personalSalud: ['', Validators.required]
    });
  }

  regresar() {
    this.router.navigate(['/seguridad-higiene']);
  }

  continuar() {
    if (this.form.valid) {
      this._formSvc.setForm1(this.form.value);
      this.router.navigate(['/seguridad-higiene/form-indicadores-s-h']);
    }
  }
  
}