import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RiesgosService } from '../../../core/services/form.service';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-form-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-pdf.component.html',
  styleUrl: './form-pdf.component.css'
})
export class FormPdfComponent implements AfterViewInit {
  form: any;
  pdfSrc: ArrayBuffer | null = null;
  @ViewChild('pdfPreview') pdfPreview!: ElementRef;

  constructor(
    private router: Router,
    private _formSvc: RiesgosService
  ) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';
    this.form = this._formSvc.form;
  }

  ngAfterViewInit() {
    this.generarPDF(false);
    if (this.pdfSrc) {
      this.previewPDF();
    } else {
      console.error('PDF Source is null or undefined');
    }
  }

  generarPDF(download: boolean = true) {
    const formData = this.form.getRawValue();
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    const addFormattedText = (text: string, y: number, options: any = {}) => {
      const defaultOptions = {
        fontSize: 12,
        fontStyle: 'normal',
        color: '#000000',
        align: 'left'
      };
      const finalOptions = { ...defaultOptions, ...options };

      doc.setFontSize(finalOptions.fontSize);
      doc.setFont('helvetica', finalOptions.fontStyle);
      doc.setTextColor(finalOptions.color);
      
      if (finalOptions.align === 'center') {
        doc.text(text, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(text, margin, y);
      }
    };

    // Encabezado
    addFormattedText('SEGURIDAD E HIGIENE', 60, { 
      fontSize: 24, 
      fontStyle: 'bold', 
      align: 'center',
      color: '#004A7C' 
    });

    addFormattedText('Informe de Resultados', 90, { 
      fontSize: 18, 
      fontStyle: 'bold',
      align: 'center' 
    });

    let yPos = 130;
    const lineHeight = 25;

    const addFormField = (label: string, value: any, labelWidth: number = 200) => {
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = 40;
      }

      let stringValue = '';
      if (typeof value === 'object' && value !== null) {
        if (value.descripcion) {
          stringValue = `(${value.id}) ${value.descripcion} `;
        } else {
          stringValue = JSON.stringify(value);
        }
      } else {
        stringValue = value?.toString() || '...';
      }
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const labelLines = doc.splitTextToSize(label + ':', contentWidth - labelWidth);
      doc.text(labelLines, margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      const valueX = margin + labelWidth;
      const valueWidth = contentWidth - labelWidth;
      const valueLines = doc.splitTextToSize(stringValue, valueWidth);
      
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, valueX, yPos + (index * 15));
      });
      
      const totalLines = Math.max(labelLines.length, valueLines.length);
      yPos += (totalLines * 15) + 10;
    };

    addFormField('Nombre de la empresa', formData.nombreEmpresa);
    addFormField('Actividad económica', formData.actividadEconomica);
    addFormField('Tipo de empresa', formData.empresaTipo);
    addFormField('Provincia', formData.provincia);
    addFormField('Ciudad', formData.ciudad);
    addFormField('Correo electrónico', formData.correoElectronico);
    addFormField('Cantidad de trabajadores', 
      `Hombres: ${formData.cantidadHombres || 0} - Mujeres: ${formData.cantidadMujeres || 0}`);
    addFormField('Clasificación de Empresa', formData.tipoInstitucion);
    addFormField('Número total de trabajadores', formData.numeroTrabajadores);
    addFormField('Nivel de riesgo laboral', formData.nivelDeRiesgo);
    addFormField('Comité Paritario', formData.comiteParitario);
    addFormField('Monitor o Técnico de SHT', formData.monitorSeguridad);
    addFormField('Horas mínimas de gestión', formData.horasMinimasGestion);
    addFormField('Personal de salud', formData.personalSaludDetalles);

    // Nueva página para indicadores
    doc.addPage();
    yPos = 40;
    
    addFormattedText('INDICADORES DE GESTIÓN', yPos, {
      fontSize: 18,
      fontStyle: 'bold',
      align: 'center'
    });
    
    yPos += 40;

    // Función específica para los indicadores
    const addIndicador = (label: string, value: any) => {
      const formattedValue = value ?? 'ND';
      addFormField(label, formattedValue, 300);
    };

    // Indicadores con más espacio
    addIndicador('Índice de Frecuencia', formData.indiceFrecuencia?.resultado);
    addIndicador('Índice de Gravedad', formData.indiceGravedad?.resultado);
    addIndicador('Tasa de Riesgo', formData.tasaRiesgo?.resultado);
    addIndicador('Capacitaciones en Seguridad', formData.capacitacionesSeguridad?.resultado);
    addIndicador('Inspecciones de Seguridad', formData.inspeccionesSeguridad?.resultado);
    addIndicador('Observaciones de Condiciones Seguras', formData.observacionesCSeguros?.resultado);
    addIndicador('Corrección de Condiciones Inseguras', formData.correcionConInseguras?.resultado);
    addIndicador('Cumplimiento del Uso de EPP', formData.cumplimientoUsoEPP?.resultado);

    // Guardar el PDF
    this.pdfSrc = doc.output('arraybuffer');

    if (download) {
      const blob = new Blob([this.pdfSrc], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'seguridad_higiene_resultado.pdf';
      link.click();
    }

    this.previewPDF();
  }

  previewPDF() {
    if (this.pdfSrc && this.pdfPreview && this.pdfPreview.nativeElement) {
      // Crear una copia del ArrayBuffer para evitar el error DataCloneError
      const pdfSrcCopy = this.pdfSrc.slice(0);
      
      pdfjsLib.getDocument({ data: pdfSrcCopy }).promise.then(pdf => {
        pdf.getPage(1).then(page => {
          const canvas: HTMLCanvasElement = this.pdfPreview.nativeElement;
          const context = canvas.getContext('2d');
          
          const desiredWidth = 800;
          const viewport = page.getViewport({ scale: 1 });
          const scale = desiredWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          page.render({ canvasContext: context!, viewport: scaledViewport }).promise.then(() => {
            console.log('PDF rendered');
          }).catch(error => {
            console.error('Error rendering PDF:', error);
          });
        }).catch(error => {
          console.error('Error getting page:', error);
        });
      }).catch(error => {
        console.error('Error loading PDF:', error);
      });
    } else {
      console.error('PDF source or preview element not available');
    }
  }

  regresar() {
    this.router.navigate(['/seguridad-higiene/form-indicadores-s-h']);
  }

  async continuar() {
    if (this.form.valid) {
      this._formSvc.setForm2(this.form.value);
      try {
        await this._formSvc.newForm();
        this.router.navigate(['/seguridad-higiene']);
      } catch (error) {
        console.error('Error al guardar el formulario:', error);
      }
    }
  }
}