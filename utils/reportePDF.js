const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportePDF {
  constructor() {
    this.doc = null;
    this.pageNumber = 1;
  }

  crearReporte(datos, nombreArchivo = 'reporte.pdf') {
    this.doc = new PDFDocument({
      margin: 40,
      size: 'A4'
    });

    // Crear directorio si no existe
    const dirReportes = path.join(__dirname, '../public/reportes');
    if (!fs.existsSync(dirReportes)) {
      fs.mkdirSync(dirReportes, { recursive: true });
    }

    const rutaArchivo = path.join(dirReportes, nombreArchivo);
    const stream = fs.createWriteStream(rutaArchivo);
    this.doc.pipe(stream);

    // Encabezado
    this.agregarEncabezado(datos.titulo);
    
    // Info general
    if (datos.fechas) {
      this.agregarInfoGeneral(datos.fechas);
    }

    // Resumen
    if (datos.resumen) {
      this.agregarResumen(datos.resumen);
    }

    // Tabla de reportes
    if (datos.detalles && datos.detalles.length > 0) {
      this.agregarTablaReportes(datos.detalles);
    }

    // Tabla de historial (si existe)
    if (datos.historial && datos.historial.length > 0) {
      this.agregarTablaHistorial(datos.historial);
    }

    // Pie de página
    this.agregarPiePagina();

    this.doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(nombreArchivo));
      stream.on('error', reject);
    });
  }

  agregarEncabezado(titulo) {
    // Logo/Titulo
    this.doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('🅿️ SISTEMA DE ESTACIONAMIENTO', { align: 'center' });

    this.doc.moveDown(0.3);
    this.doc
      .fontSize(16)
      .font('Helvetica')
      .text(titulo, { align: 'center' });

    // Línea separadora
    this.doc.moveDown(0.5);
    this.doc.strokeColor('#3b82f6').lineWidth(2).moveTo(40, this.doc.y).lineTo(555, this.doc.y).stroke();
    this.doc.moveDown(0.8);
  }

  agregarInfoGeneral(fechas) {
    const { inicio, fin, generado } = fechas;
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666');

    const y = this.doc.y;
    
    // Columna izquierda
    this.doc
      .text(`Período: ${inicio} a ${fin}`, 40, y)
      .text(`Generado: ${generado}`, 40, this.doc.y + 5);

    // Columna derecha
    this.doc
      .text(`Página: 1`, 450, y, { align: 'right' });

    this.doc.moveDown(1.5);
    this.doc.fillColor('#000000');
  }

  agregarResumen(resumen) {
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('RESUMEN GENERAL', { underline: true });

    this.doc.moveDown(0.5);

    // Cajas de resumen
    const anchoCaja = 110;
    const espaciado = 8;
    const x = 40;
    let posX = x;

    const datos = [
      { label: 'Total Sesiones', valor: resumen.total_sesiones, color: '#3b82f6' },
      { label: 'Pagadas', valor: resumen.pagadas, color: '#22c55e' },
      { label: 'Pendientes', valor: resumen.pendientes, color: '#f59e0b' },
      { label: 'Activas', valor: resumen.activas, color: '#ef4444' }
    ];

    datos.forEach((d, idx) => {
      if (idx > 0 && idx % 2 === 0) {
        posX = x;
        this.doc.moveDown(3.5);
      }

      this.dibujarCajaResumen(posX, this.doc.y, anchoCaja, d.label, d.valor, d.color);
      posX += anchoCaja + espaciado;
    });

    this.doc.moveDown(4);
  }

  dibujarCajaResumen(x, y, ancho, label, valor, color) {
    // Fondo
    this.doc.rect(x, y, ancho, 70).fillAndStroke(color + '15', color);

    // Texto
    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text(label, x + 8, y + 10, { width: ancho - 16, align: 'center' });

    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(color)
      .text(valor.toString(), x + 8, y + 30, { width: ancho - 16, align: 'center' });
  }

  agregarTablaReportes(datos) {
    this.verificarEspacioPagina(80);

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('REPORTE DETALLADO', { underline: true });

    this.doc.moveDown(0.8);

    const columnas = [
      { key: 'fecha', titulo: 'Fecha', ancho: 70 },
      { key: 'nombre_turno', titulo: 'Turno', ancho: 60 },
      { key: 'total_sesiones', titulo: 'Total', ancho: 45 },
      { key: 'pagadas', titulo: 'Pagadas', ancho: 45 },
      { key: 'pendientes', titulo: 'Pendientes', ancho: 50 },
      { key: 'activas', titulo: 'Activas', ancho: 45 },
      { key: 'ingresos_pagados', titulo: 'Ingresos', ancho: 70 }
    ];

    const y = this.doc.y;
    let posX = 40;

    // Encabezado tabla
    this.doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('white');

    columnas.forEach(col => {
      this.doc.rect(posX, y, col.ancho, 25).fill('#3b82f6');
      this.doc
        .fillColor('white')
        .text(col.titulo, posX + 5, y + 7, { width: col.ancho - 10, align: 'center' });
      posX += col.ancho;
    });

    this.doc.moveDown(1.8);

    // Filas
    let alturaFila = 20;
    datos.forEach((fila, idx) => {
      if (this.doc.y + alturaFila > 750) {
        this.agregarPaginaNueva();
      }

      posX = 40;
      const yFila = this.doc.y;
      const colorFondo = idx % 2 === 0 ? '#f9fafb' : 'white';

      columnas.forEach(col => {
        this.doc.rect(posX, yFila, col.ancho, alturaFila).fill(colorFondo);
        
        let valor = fila[col.key];
        if (col.key.includes('ingresos') || col.key === 'total_tarifa') {
          valor = `S/ ${parseFloat(valor || 0).toFixed(2)}`;
        }

        this.doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#1f2937')
          .text(valor.toString(), posX + 5, yFila + 6, { 
            width: col.ancho - 10, 
            align: 'center' 
          });

        posX += col.ancho;
      });

      this.doc.moveDown(1.3);
    });

    this.doc.moveDown(1);
  }

  agregarTablaHistorial(datos) {
    this.verificarEspacioPagina(80);

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text('HISTORIAL DE SESIONES', { underline: true });

    this.doc.moveDown(0.8);

    const columnas = [
      { key: 'id_sesion', titulo: 'ID', ancho: 40 },
      { key: 'numero', titulo: 'Espacio', ancho: 50 },
      { key: 'nombre_turno', titulo: 'Turno', ancho: 55 },
      { key: 'hora_entrada', titulo: 'Entrada', ancho: 80 },
      { key: 'hora_salida', titulo: 'Salida', ancho: 80 },
      { key: 'total_tarifa', titulo: 'Tarifa', ancho: 50 },
      { key: 'pago', titulo: 'Estado', ancho: 60 }
    ];

    const y = this.doc.y;
    let posX = 40;

    // Encabezado
    this.doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('white');

    columnas.forEach(col => {
      this.doc.rect(posX, y, col.ancho, 22).fill('#3b82f6');
      this.doc
        .fillColor('white')
        .text(col.titulo, posX + 3, y + 6, { width: col.ancho - 6, align: 'center' });
      posX += col.ancho;
    });

    this.doc.moveDown(1.7);

    // Filas (límite de 20 para no saturar)
    const datosLimitados = datos.slice(0, 20);
    let alturaFila = 18;

    datosLimitados.forEach((fila, idx) => {
      if (this.doc.y + alturaFila > 750) {
        this.agregarPaginaNueva();
      }

      posX = 40;
      const yFila = this.doc.y;
      const colorFondo = idx % 2 === 0 ? '#f9fafb' : 'white';

      columnas.forEach(col => {
        this.doc.rect(posX, yFila, col.ancho, alturaFila).fill(colorFondo);

        let valor = fila[col.key];
        
        if (col.key === 'total_tarifa') {
          valor = `S/ ${parseFloat(valor || 0).toFixed(2)}`;
        } else if (col.key === 'hora_entrada' || col.key === 'hora_salida') {
          valor = valor ? new Date(valor).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-';
        } else if (col.key === 'pago') {
          valor = fila.pago === 1 ? '✓ Pagada' : (fila.hora_salida ? 'Pendiente' : 'Activa');
        }

        this.doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor('#1f2937')
          .text(valor.toString(), posX + 3, yFila + 5, { 
            width: col.ancho - 6, 
            align: 'center',
            height: alturaFila
          });

        posX += col.ancho;
      });

      this.doc.moveDown(1.2);
    });

    if (datos.length > 20) {
      this.doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#999999')
        .text(`... y ${datos.length - 20} sesiones más`, 40);
    }
  }

  agregarPiePagina() {
    const y = 750;
    
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#999999')
      .text('Reporte generado automáticamente por el Sistema de Estacionamiento Inteligente', 
            40, y, { align: 'center' });
  }

  verificarEspacioPagina(espacioRequerido) {
    if (this.doc.y + espacioRequerido > 750) {
      this.agregarPaginaNueva();
    }
  }

  agregarPaginaNueva() {
    this.doc.addPage();
    this.pageNumber++;
  }
}

module.exports = ReportePDF;
