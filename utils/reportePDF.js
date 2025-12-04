const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportePDF {
  constructor() {
    this.doc = null;
    this.pageNumber = 1;
    this.margenIzq = 40;
    this.margenDer = 555;
    this.altoPagina = 760;
  }

  async crearReporte(datos, nombreArchivo = "reporte.pdf") {
    return new Promise((resolve, reject) => {
      try {
        const dirReportes = path.join(__dirname, "../public/reportes");
        if (!fs.existsSync(dirReportes)) {
          fs.mkdirSync(dirReportes, { recursive: true });
        }

        const rutaArchivo = path.join(dirReportes, nombreArchivo);

        this.doc = new PDFDocument({
          margin: 30,
          size: "A4",
          bufferPages: true,
        });

        const stream = fs.createWriteStream(rutaArchivo);
        this.doc.pipe(stream);

        // Determinar tipo de reporte
        const esHistorial =
          datos.detalles &&
          datos.detalles.length > 0 &&
          datos.detalles[0].id_sesion &&
          datos.detalles[0].numero;

        if (esHistorial) {
          this.generarReporteHistorial(datos);
        } else {
          this.generarReporteGeneral(datos);
        }

        this.doc.end();

        stream.on("finish", () => resolve(nombreArchivo));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // ========================================
  // REPORTE HISTORIAL - ESTRUCTURA PROFESIONAL
  // ========================================
  generarReporteHistorial(datos) {
    // Encabezado
    this.headerPrincipal();
    this.doc.moveDown(1);

    // Título
    this.doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("HISTORIAL DE SESIONES", { align: "center" });

    this.doc.moveDown(0.3);
    this.doc
      .strokeColor("#3b82f6")
      .lineWidth(2)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(0.8);

    // Info período
    this.cajaInfo(datos.fechas);
    this.doc.moveDown(1);

    // Resumen ejecutivo
    this.resumenHistorial(datos.resumen);
    this.doc.moveDown(1);

    // Tabla detallada
    if (datos.detalles && datos.detalles.length > 0) {
      this.tablaHistorialDetallada(datos.detalles);
    } else {
      this.doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#999")
        .text("Sin datos disponibles para este período");
    }

    // Pie
    this.piePaginaConNumero();
  }

  // ========================================
  // REPORTE GENERAL - ESTRUCTURA PROFESIONAL
  // ========================================
  generarReporteGeneral(datos) {
    // Encabezado
    this.headerPrincipal();
    this.doc.moveDown(1);

    // Título
    this.doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("REPORTE GENERAL DE ESTACIONAMIENTO", { align: "center" });

    this.doc.moveDown(0.3);
    this.doc
      .strokeColor("#3b82f6")
      .lineWidth(2)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(0.8);

    // Info período
    this.cajaInfo(datos.fechas);
    this.doc.moveDown(1);

    // Resumen ejecutivo
    this.resumenGeneral(datos.resumen);
    this.doc.moveDown(1);

    // Tabla resumen por período
    if (datos.detalles && datos.detalles.length > 0) {
      this.tablaReportePeriodo(datos.detalles);
    } else {
      this.doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#999")
        .text("Sin datos disponibles para este período");
    }

    // Pie
    this.piePaginaConNumero();
  }

  // ========================================
  // COMPONENTES COMUNES
  // ========================================

  headerPrincipal() {
    // Fondo azul
    this.doc.rect(30, 30, 540, 70).fill("#3b82f6");

    // Contenido
    this.doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("🅿️ ESTACIONAMIENTO", 45, 40);

    this.doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#e0e7ff")
      .text("Sistema Inteligente de Reportes", 45, 70);
  }

  cajaInfo(fechas) {
    const y = this.doc.y;

    // Box info
    this.doc.rect(40, y, 515, 55).fillAndStroke("#f0f9ff", "#3b82f6");

    this.doc.fontSize(10).font("Helvetica").fillColor("#075985");

    this.doc.text(
      `Período reportado: ${fechas.inicio} hasta ${fechas.fin}`,
      50,
      y + 10
    );
    this.doc.text(`Fecha generación: ${fechas.generado}`, 50, y + 28);

    this.doc.moveDown(3.5);
  }

  resumenHistorial(resumen) {
    this.doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN EJECUTIVO", 40);

    this.doc.moveDown(0.8);

    const items = [
      {
        label: "Total Sesiones",
        valor: resumen.total_sesiones,
        color: "#3b82f6",
        icon: "📊",
      },
      {
        label: "Sesiones Pagadas",
        valor: resumen.pagadas,
        color: "#22c55e",
        icon: "✓",
      },
      {
        label: "Sesiones Pendientes",
        valor: resumen.pendientes,
        color: "#f59e0b",
        icon: "⏳",
      },
      {
        label: "Sesiones Activas",
        valor: resumen.activas,
        color: "#ef4444",
        icon: "▶",
      },
    ];

    let posX = 40;
    const anchoCaja = 117;
    const espaciado = 8;

    items.forEach((item, idx) => {
      if (idx > 0 && idx % 4 === 0) {
        posX = 40;
        this.doc.moveDown(3.5);
      }

      const y = this.doc.y;

      // Caja
      this.doc
        .rect(posX, y, anchoCaja, 65)
        .fillAndStroke(item.color + "15", item.color)
        .lineWidth(1.5);

      // Valor grande
      this.doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(item.color)
        .text(item.valor.toString(), posX, y + 10, {
          width: anchoCaja,
          align: "center",
        });

      // Etiqueta
      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(item.label, posX + 5, y + 42, {
          width: anchoCaja - 10,
          align: "center",
        });

      posX += anchoCaja + espaciado;

      if (idx % 4 === 3 || idx === items.length - 1) {
        this.doc.moveDown(3.8);
      }
    });
  }

  resumenGeneral(resumen) {
    this.doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("MÉTRICAS PRINCIPALES", 40);

    this.doc.moveDown(0.8);

    const items = [
      { label: "Total", valor: resumen.total_sesiones, color: "#3b82f6" },
      { label: "Pagadas", valor: resumen.pagadas, color: "#22c55e" },
      { label: "Pendientes", valor: resumen.pendientes, color: "#f59e0b" },
      { label: "Activas", valor: resumen.activas, color: "#ef4444" },
    ];

    let posX = 40;
    const anchoCaja = 110;

    items.forEach((item, idx) => {
      if (idx > 0 && idx % 4 === 0) {
        posX = 40;
        this.doc.moveDown(3.2);
      }

      const y = this.doc.y;

      this.doc
        .rect(posX, y, anchoCaja, 55)
        .fillAndStroke(item.color + "15", item.color)
        .lineWidth(1.5);

      this.doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(item.color)
        .text(item.valor.toString(), posX, y + 8, {
          width: anchoCaja,
          align: "center",
        });

      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(item.label, posX + 5, y + 32, {
          width: anchoCaja - 10,
          align: "center",
        });

      posX += anchoCaja + 8;

      if (idx % 4 === 3 || idx === items.length - 1) {
        this.doc.moveDown(3.2);
      }
    });
  }

  // ========================================
  // TABLA HISTORIAL DETALLADA
  // ========================================
  tablaHistorialDetallada(datos) {
    this.doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("DETALLE COMPLETO DE SESIONES", 40);

    this.doc.moveDown(0.6);

    const columnas = [
      { key: "id_sesion", titulo: "ID", ancho: 30 },
      { key: "numero", titulo: "Espacio", ancho: 45 },
      { key: "nombre_turno", titulo: "Turno", ancho: 50 },
      { key: "hora_entrada", titulo: "Entrada", ancho: 65 },
      { key: "hora_salida", titulo: "Salida", ancho: 65 },
      { key: "total_tarifa", titulo: "Tarifa", ancho: 50 },
      { key: "pago", titulo: "Estado", ancho: 55 },
    ];

    this.dibujarTablaProfesional(columnas, datos);
  }

  // ========================================
  // TABLA REPORTE POR PERÍODO
  // ========================================
  tablaReportePeriodo(datos) {
    this.doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN DIARIO Y POR TURNO", 40);

    this.doc.moveDown(0.6);

    const columnas = [
      { key: "fecha", titulo: "Fecha", ancho: 50 },
      { key: "nombre_turno", titulo: "Turno", ancho: 45 },
      { key: "total_sesiones", titulo: "Total", ancho: 35 },
      { key: "pagadas", titulo: "Pagadas", ancho: 40 },
      { key: "pendientes", titulo: "Pend.", ancho: 35 },
      { key: "activas", titulo: "Activas", ancho: 35 },
      { key: "ingresos_pagados", titulo: "Ingresos", ancho: 50 },
      { key: "tiempo_promedio", titulo: "Promedio", ancho: 40 },
    ];

    this.dibujarTablaProfesional(columnas, datos);
  }

  // ========================================
  // DIBUJAR TABLA - GENÉRICA Y PROFESIONAL
  // ========================================
  dibujarTablaProfesional(columnas, datos) {
    const anchoTotal = columnas.reduce((sum, c) => sum + c.ancho, 0);
    const escala = 515 / anchoTotal;

    let posY = this.doc.y;
    let posX = 40;
    const altoEncabezado = 22;

    // ===== ENCABEZADO =====
    this.doc.fontSize(8).font("Helvetica-Bold").fillColor("white");

    columnas.forEach((col) => {
      const anchoAjustado = col.ancho * escala;
      this.doc.rect(posX, posY, anchoAjustado, altoEncabezado).fill("#3b82f6");

      this.doc.fontSize(7).text(col.titulo, posX + 2, posY + 6, {
        width: anchoAjustado - 4,
        align: "center",
      });

      posX += anchoAjustado;
    });

    this.doc.moveDown(1.6);
    posY = this.doc.y;

    // ===== FILAS =====
    const altoFila = 16;
    let numFila = 0;

    for (let i = 0; i < Math.min(datos.length, 30); i++) {
      const fila = datos[i];

      // Verificar espacio en página
      if (posY + altoFila > this.altoPagina - 40) {
        this.doc.addPage();
        this.headerPrincipal();
        this.doc.moveDown(0.8);
        posY = 120;
        numFila = 0;

        // Redibujar encabezado en nueva página
        posX = 40;
        this.doc.fontSize(8).font("Helvetica-Bold").fillColor("white");

        columnas.forEach((col) => {
          const anchoAjustado = col.ancho * escala;
          this.doc
            .rect(posX, posY, anchoAjustado, altoEncabezado)
            .fill("#3b82f6");

          this.doc.fontSize(7).text(col.titulo, posX + 2, posY + 6, {
            width: anchoAjustado - 4,
            align: "center",
          });

          posX += anchoAjustado;
        });

        this.doc.moveDown(1.6);
        posY = this.doc.y;
      }

      // Dibujar fila
      posX = 40;
      const colorFondo = numFila % 2 === 0 ? "#f9fafb" : "white";

      columnas.forEach((col) => {
        const anchoAjustado = col.ancho * escala;
        this.doc
          .rect(posX, posY, anchoAjustado, altoFila)
          .fill(colorFondo)
          .stroke();

        let valor = this.formatearValor(fila, col.key);

        this.doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor("#1f2937")
          .text(valor, posX + 2, posY + 3, {
            width: anchoAjustado - 4,
            align: "center",
            height: altoFila,
          });

        posX += anchoAjustado;
      });

      posY += altoFila;
      numFila++;
      this.doc.y = posY;
    }

    if (datos.length > 30) {
      this.doc.moveDown(0.5);
      this.doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor("#999")
        .text(`... y ${datos.length - 30} registros más`, 40);
    }

    this.doc.moveDown(1);
  }

  // ========================================
  // FORMATEAR VALORES
  // ========================================
  formatearValor(fila, key) {
    let valor = fila[key];

    if (valor === null || valor === undefined || valor === "") {
      return "-";
    }

    // Moneda
    if (key.includes("ingresos") || key === "total_tarifa") {
      return `S/ ${parseFloat(valor).toFixed(2)}`;
    }

    // Fechas
    if (key === "hora_entrada" || key === "hora_salida") {
      try {
        return new Date(valor).toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return valor.toString();
      }
    }

    // Estado de pago
    if (key === "pago") {
      return fila.pago === 1
        ? "✓ Pagada"
        : fila.hora_salida
        ? "Pendiente"
        : "Activa";
    }

    // Tiempo promedio
    if (key === "tiempo_promedio") {
      if (!valor) return "-";
      const minutos = Math.round(parseFloat(valor));
      return `${minutos}m`;
    }

    // Turno
    if (key === "nombre_turno") {
      return valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    return valor.toString();
  }

  // ========================================
  // PIE DE PÁGINA
  // ========================================
  piePaginaConNumero() {
    const y = 745;

    this.doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999")
      .text(
        "Sistema de Estacionamiento Inteligente | Reporte Confidencial",
        40,
        y,
        { align: "center" }
      );

    this.doc
      .fontSize(8)
      .fillColor("#ccc")
      .text(`Página ${this.pageNumber}`, 500, y, { align: "right" });
  }
}

module.exports = ReportePDF;
