import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RiesgosService } from '../../../core/services/form.service';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { variable64 } from './../../../../assets/empresa';


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

async generarPDF(download: boolean = true) {
    const formData = this.form.getRawValue();
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Definir colores corporativos
    const colorPrimario = '#003F72';
    const colorSecundario = '#EAAB00';
    const colorTexto = '#333333';
    const colorSubtitulo = '#555555';

    // Función para añadir texto con formato
    const addFormattedText = (text: string, y: number, options: any = {}) => {
      const defaultOptions = {
        fontSize: 11,
        fontStyle: 'normal',
        color: colorTexto,
        align: 'left'
      };
      const finalOptions = { ...defaultOptions, ...options };

      doc.setFontSize(finalOptions.fontSize);
      doc.setFont('helvetica', finalOptions.fontStyle);
      doc.setTextColor(finalOptions.color);

      if (finalOptions.align === 'center') {
        doc.text(text, pageWidth / 2, y, { align: 'center' });
      } else if (finalOptions.align === 'right') {
        doc.text(text, pageWidth - margin, y, { align: 'right' });
      } else {
        doc.text(text, margin, y);
      }
    };

    // Función para añadir líneas divisorias
    const addDivider = (y: number, color = colorSecundario) => {
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      return y + 10; // Retorna la nueva posición Y después de la línea
    };

    // Función para añadir cabecera a cada página
    const addHeader = async () => {
      // Rectángulo de color en la parte superior
      doc.setFillColor(colorPrimario);
      doc.rect(0, 0, pageWidth, 15, 'F');

      // Agregar el logo izquierdo
      const logoLeftBase64 = variable64.empresa; // Base64 del logo izquierdo
      const logoLeftWidth = 90; // Ancho del logo izquierdo
      const logoLeftHeight = 45; // Alto del logo izquierdo
      const logoLeftX = margin; // Posición X del logo izquierdo
      const logoLeftY = 20; // Posición Y del logo izquierdo
      doc.addImage(logoLeftBase64, 'PNG', logoLeftX, logoLeftY, logoLeftWidth, logoLeftHeight);

      // Agregar el logo derecho
      const logoRightBase64 = variable64.empresa; // Base64 del logo derecho
      const logoRightWidth = 90; // Ancho del logo derecho
      const logoRightHeight = 45; // Alto del logo derecho
      const logoRightX = pageWidth - margin - logoRightWidth; // Posición X del logo derecho
      const logoRightY = 20; // Posición Y del logo derecho
      doc.addImage(logoRightBase64, 'PNG', logoRightX, logoRightY, logoRightWidth, logoRightHeight);

      // Calcular la posición del título principal entre los dos logos
      const titleY = 60; // Posición Y del título
      const titleX = (logoLeftX + logoLeftWidth + logoRightX) / 2; // Centro entre los dos logos

      // Título principal centrado
      addFormattedText('SEGURIDAD INDUSTRIAL', titleY, {
        fontSize: 24,
        fontStyle: 'bold',
        align: 'center',
        color: colorPrimario
      });

      // Título con fondo amarillo
      doc.setFillColor(colorSecundario);
      doc.setDrawColor(colorSecundario);
      doc.roundedRect(margin, 70, contentWidth, 30, 2, 2, 'FD');

      addFormattedText('Informe de Resultados', 90, {
        fontSize: 20,
        fontStyle: 'italic',
        align: 'center',
        color: '#FFFFFF'
      });

      // Añadir fecha actual
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      addFormattedText(`Fecha de emisión: ${formattedDate}`, 115, {
        fontSize: 10,
        align: 'right',
        color: colorSubtitulo
      });

      return 140; // Retorna la posición Y después del encabezado
    };

    // Función para añadir pie de página a cada página
    const addFooter = (pageNum: number) => {
      const footerY = pageHeight - 20;

      // Línea divisoria para el footer
      doc.setDrawColor(colorPrimario);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

      // Texto del pie de página
      addFormattedText(`Universidad Técnica Particular de Loja - Informe de Seguridad Industrial`, footerY, {
        fontSize: 8,
        color: colorSubtitulo,
        align: 'left'
      });
       // Nueva línea de texto
      addFormattedText(`Términos y Condiciones, Esta herramienta es para uso educativo. Los datos ingresados no se almacenan y se eliminan tras\ngenerar el PDF. El usuario asume responsabilidad por la interpretación y aplicación de los resultados. © 2025.`, footerY+8, { //Estaba en +2
        fontSize: 8,
        color: colorSubtitulo,
        align: 'left'
      });

      // Número de página
      addFormattedText(`Página ${pageNum}`, footerY, {
        fontSize: 8,
        color: colorSubtitulo,
        align: 'right'
      });
    };

    const addSection = (title: string, yPos: number) => {
      // Título de sección sin fondo de color (solo texto)
      addFormattedText(title, yPos, {
        fontSize: 14,
        fontStyle: 'bold',
        color: colorPrimario, // Cambiado a color primario
        align: 'left'
      });

      // Añadir línea divisoria debajo del título
      doc.setDrawColor(colorSecundario);
      doc.setLineWidth(1);
      doc.line(margin, yPos + 10, margin + contentWidth, yPos + 10);

      return yPos + 25; // Retorna la nueva posición Y después del título
    };

    // Función mejorada para añadir campos con estilo
    const addFormField = async (label: string, value: any, labelWidth: number = 200, yPos: number) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = await addHeader();
        const currentPage = doc.getNumberOfPages();
        addFooter(currentPage);
      }

      let stringValue = '';
      if (typeof value === 'object' && value !== null) {
        if (value.descripcion) {
          stringValue = `${value.descripcion}`;
        } else {
          stringValue = JSON.stringify(value);
        }
      } else {
        stringValue = value?.toString() || 'No disponible';
      }

      // Estilo para la etiqueta
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorPrimario);
      const labelLines = doc.splitTextToSize(label + ':', labelWidth);
      doc.text(labelLines, margin, yPos);

      // Estilo para el valor
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorTexto);
      const valueX = margin + labelWidth;
      const valueWidth = contentWidth - labelWidth;
      const valueLines = doc.splitTextToSize(stringValue, valueWidth);

      valueLines.forEach((line: string, index: number) => {
        doc.text(line, valueX, yPos + (index * 15));
      });

      const totalLines = Math.max(labelLines.length, valueLines.length);

      // Línea sutil debajo de cada campo
      if (totalLines > 0) {
        const lineY = yPos + (totalLines * 15) + 5;
        doc.setDrawColor('#EEEEEE');
        doc.setLineWidth(0.2);
        doc.line(margin, lineY, margin + contentWidth, lineY);
      }

      return yPos + (totalLines * 15) + 15; // Retorna la nueva posición Y
    };

    // Función para añadir indicadores con medidores gráficos
    const addIndicadorConGrafico = async (label: string, message: string, yPos: number) => {
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = await addHeader();
        const currentPage = doc.getNumberOfPages();
        addFooter(currentPage);
      }

      // Etiqueta del indicador
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorPrimario);
      doc.text(label + ':', margin, yPos);

      // Mensaje del indicador
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorTexto);
      const messageX = margin + 250; // Ajustar la posición X del mensaje
      const messageWidth = contentWidth - 250;
      const messageLines = doc.splitTextToSize(message, messageWidth);

      messageLines.forEach((line: string, index: number) => {
        doc.text(line, messageX, yPos + (index * 15));
      });

      return yPos + (messageLines.length * 15) + 15; // Retorna la nueva posición Y
    };

    // Iniciar el documento
    let yPos = await addHeader();
    let currentPage = 1;
    addFooter(currentPage);

    // Sección de información de la empresa
    yPos = addSection('INFORMACIÓN DE LA EMPRESA', yPos);
    yPos += 10;

    yPos = await  addFormField('Nombre de la empresa', formData.nombreEmpresa, 200, yPos);
    // yPos = addFormField('Actividad económica', formData.actividadEconomica, 200, yPos);
    yPos = await addFormField('Actividad económica', `${formData.actividadEconomica.id || ''} - ${formData.actividadEconomica.descripcion || ''}`, 200, yPos);
    yPos = await addFormField('Tipo de empresa', formData.empresaTipo, 200, yPos);
    yPos = await addFormField('Provincia', formData.provincia, 200, yPos);
    yPos = await addFormField('Ciudad', formData.ciudad, 200, yPos);
    yPos = await addFormField('Correo electrónico', formData.correoElectronico, 200, yPos);

    const trabajadores = `Hombres: ${formData.cantidadHombres || 0} - Mujeres: ${formData.cantidadMujeres || 0}`;
    yPos = await addFormField('Cantidad de trabajadores', trabajadores, 200, yPos);
    yPos = await addFormField('Clasificación de Empresa', formData.tipoInstitucion, 200, yPos);
    yPos = await addFormField('Número total de trabajadores', formData.numeroTrabajadores, 200, yPos);
    yPos = await addFormField('Nivel de riesgo laboral', formData.nivelDeRiesgo, 200, yPos);
    yPos = await addFormField('Comité Paritario', formData.comiteParitario, 200, yPos);
    yPos = await addFormField('Monitor o Técnico de SHT', formData.monitorSeguridad, 200, yPos);
    yPos = await addFormField('Horas mínimas de gestión', formData.horasMinimasGestion, 200, yPos);
    yPos = await addFormField('Personal de salud', formData.personalSaludDetalles, 200, yPos);

    // Nueva página para indicadores
    doc.addPage();
    currentPage++;
    yPos = await addHeader();
    addFooter(currentPage);

    // Sección de indicadores de gestión
    yPos = addSection('INDICADORES DE GESTIÓN', yPos);
    yPos += 20;

    // Indicadores con gráficos
    yPos = await addIndicadorConGrafico('Índice de Frecuencia',formData.indiceFrecuencia?.mensaje || 'No disponible',yPos);
    yPos = await addIndicadorConGrafico('Índice de Gravedad', formData.indiceGravedad?.mensaje || 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Tasa de Riesgo', formData.tasaRiesgo?.mensaje || 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Capacitaciones en Seguridad', formData.capacitacionesSeguridad?.resultado ? `${formData.capacitacionesSeguridad.resultado}%`: 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Inspecciones de Seguridad', formData.inspeccionesSeguridad?.resultado ? `${formData.inspeccionesSeguridad.resultado}%`: 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Observaciones de Condiciones Seguras', formData.observacionesCSeguros?.resultado ? `${formData.observacionesCSeguros.resultado}%`: 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Corrección de Condiciones Inseguras', formData.correcionConInseguras?.resultado ? `${formData.correcionConInseguras.resultado}%`: 'No disponible', yPos);
    yPos = await addIndicadorConGrafico('Cumplimiento del Uso de EPP', formData.cumplimientoUsoEPP?.resultado ? `${formData.cumplimientoUsoEPP.resultado}%`: 'No disponible', yPos);

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
  pdfLoaded: boolean = false;
  previewPDF() {
    this.pdfLoaded = false;

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
            this.pdfLoaded = true;
          }).catch(error => {
            console.error('Error rendering PDF:', error);
            this.pdfLoaded = true; // Establecer como verdadero incluso en caso de error para no mostrar el spinner infinitamente
          });
        }).catch(error => {
          console.error('Error getting page:', error);
          this.pdfLoaded = true;
        });
      }).catch(error => {
        console.error('Error loading PDF:', error);
        this.pdfLoaded = true;
      });
    } else {
      console.error('PDF source or preview element not available');
      this.pdfLoaded = true;
    }
  }

  regresar() {
    this.router.navigate(['/seguridad-higiene/form-info-s-h']);
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
