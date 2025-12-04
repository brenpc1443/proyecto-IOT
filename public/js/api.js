const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportePDF {
  constructor() {
    this.doc = null;
    this.pageNumber = 1;
  }

  crearReporteGeneral(datos, nombreArchivo = "reporte.pdf") {
    this.doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    const dirReportes = path.join(__dirname, "../public/reportes");
    if (!fs.existsSync(dirReportes)) {
      fs.mkdirSync(dirReportes, { recursive: true });
    }

    const rutaArchivo = path.join(dirReportes, nombreArchivo);
    const stream = fs.createWriteStream(rutaArchivo);
    this.doc.pipe(stream);

    this.encabezadoGeneral(datos.fechas);
    this.resumenGeneralStats(datos.resumen);
    this.tablaReporteGeneral(datos.detalles);
    this.piePagina();

    this.doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(nombreArchivo));
      stream.on("error", reject);
    });
  }

  crearReporteHistorial(datos, nombreArchivo = "historial.pdf") {
    this.doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
    });

    const dirReportes = path.join(__dirname, "../public/reportes");
    if (!fs.existsSync(dirReportes)) {
      fs.mkdirSync(dirReportes, { recursive: true });
    }

    const rutaArchivo = path.join(dirReportes, nombreArchivo);
    const stream = fs.createWriteStream(rutaArchivo);
    this.doc.pipe(stream);

    this.encabezadoHistorial(datos.fechas);
    this.filtrosHistorial(datos.filtros);
    this.resumenHistorial(datos.resumen);
    this.tablaHistorial(datos.detalles);
    this.piePaginaCompleta();

    this.doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(nombreArchivo));
      stream.on("error", reject);
    });
  }

  // ========== REPORTE GENERAL ==========
  encabezadoGeneral(fechas) {
    this.doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("REPORTE GENERAL");

    this.doc.moveDown(0.3);
    this.doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Sistema de Estacionamiento Inteligente");

    this.doc.moveDown(1);

    // Información de fechas
    this.doc.fontSize(10).fillColor("#374151").font("Helvetica");

    const y = this.doc.y;

    this.doc.text(`Período: ${fechas.inicio} a ${fechas.fin}`, 40, y);
    this.doc.text(`Generado: ${fechas.generado}`, 40, this.doc.y + 15);

    this.doc
      .fontSize(9)
      .fillColor("#9ca3af")
      .text(`Página ${this.pageNumber}`, 480, y, { align: "right" });

    this.doc.moveDown(2);

    // Línea separadora
    this.doc
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(1.5);
  }

  resumenGeneralStats(resumen) {
    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Resumen General", 40, this.doc.y);

    this.doc.moveDown(1);

    const stats = [
      {
        label: "Total Sesiones",
        valor: resumen.total_sesiones,
        color: "#3b82f6",
      },
      { label: "Sesiones Pagadas", valor: resumen.pagadas, color: "#10b981" },
      {
        label: "Sesiones Pendientes",
        valor: resumen.pendientes,
        color: "#f59e0b",
      },
      { label: "Sesiones Activas", valor: resumen.activas, color: "#ef4444" },
    ];

    const boxWidth = 100;
    const boxHeight = 60;
    const spacing = 15;
    let x = 40;

    stats.forEach((stat, idx) => {
      if (idx === 2) {
        x = 40;
        this.doc.moveDown(4);
      }

      const boxY = this.doc.y;

      // Caja de fondo
      this.doc.rect(x, boxY, boxWidth, boxHeight).stroke(stat.color);
      this.doc
        .rect(x + 1, boxY + 1, boxWidth - 2, boxHeight - 2)
        .fill(stat.color + "08");

      // Valor grande
      this.doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(stat.color)
        .text(stat.valor.toString(), x, boxY + 15, {
          width: boxWidth,
          align: "center",
        });

      // Label
      this.doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(stat.label, x, boxY + 40, { width: boxWidth, align: "center" });

      x += boxWidth + spacing;
    });

    this.doc.moveDown(5);
  }

  tablaReporteGeneral(datos) {
    if (!datos || datos.length === 0) {
      this.doc
        .fontSize(12)
        .fillColor("#ef4444")
        .text("⚠ No hay datos disponibles para este período");
      return;
    }

    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Detalles por Fecha y Turno", 40, this.doc.y);

    this.doc.moveDown(1);

    const columnas = [
      { key: "fecha", titulo: "Fecha", ancho: 80 },
      { key: "nombre_turno", titulo: "Turno", ancho: 70 },
      { key: "total_sesiones", titulo: "Total", ancho: 50 },
      { key: "pagadas", titulo: "Pagadas", ancho: 50 },
      { key: "pendientes", titulo: "Pendientes", ancho: 60 },
      { key: "activas", titulo: "Activas", ancho: 50 },
      { key: "ingresos_pagados", titulo: "Ingresos", ancho: 75 },
    ];

    let x = 40;
    const y = this.doc.y;
    const headerHeight = 28;

    // Encabezado
    this.doc.fillColor("#3b82f6").rect(40, y, 435, headerHeight).fill();

    columnas.forEach((col) => {
      this.doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text(col.titulo, x + 5, y + 8, {
          width: col.ancho - 10,
          align: "center",
        });
      x += col.ancho;
    });

    this.doc.moveDown(2.2);

    // Filas
    let rowY = this.doc.y;
    datos.forEach((fila, idx) => {
      if (rowY > 700) {
        this.doc.addPage();
        rowY = 40;
      }

      const rowHeight = 30;
      const bgColor = idx % 2 === 0 ? "#f9fafb" : "white";

      // Fondo de fila
      this.doc.fillColor(bgColor).rect(40, rowY, 435, rowHeight).fill();
      this.doc.strokeColor("#e5e7eb").lineWidth(0.5);
      this.doc.rect(40, rowY, 435, rowHeight).stroke();

      // Contenido
      x = 40;
      columnas.forEach((col) => {
        let valor = fila[col.key];

        if (col.key === "ingresos_pagados") {
          valor = `S/ ${parseFloat(valor || 0).toFixed(2)}`;
        } else if (col.key === "nombre_turno") {
          valor = valor.charAt(0).toUpperCase() + valor.slice(1);
        }

        this.doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#374151")
          .text(valor.toString(), x + 5, rowY + 8, {
            width: col.ancho - 10,
            align: "center",
          });

        x += col.ancho;
      });

      rowY += rowHeight;
    });

    this.doc.moveDown(2);
  }

  // ========== REPORTE HISTORIAL ==========
  encabezadoHistorial(fechas) {
    this.doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("HISTORIAL DE SESIONES");

    this.doc.moveDown(0.3);
    this.doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Sistema de Estacionamiento Inteligente");

    this.doc.moveDown(1);

    // Información de fechas
    this.doc.fontSize(10).fillColor("#374151").font("Helvetica");

    const y = this.doc.y;

    this.doc.text(`Período: ${fechas.inicio} a ${fechas.fin}`, 40, y);
    this.doc.text(`Generado: ${fechas.generado}`, 40, this.doc.y + 15);

    this.doc.moveDown(2);

    // Línea separadora
    this.doc
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(1.5);
  }

  filtrosHistorial(filtros) {
    this.doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Filtros Aplicados:", 40);

    this.doc.moveDown(0.3);

    this.doc.fontSize(9).font("Helvetica").fillColor("#6b7280");

    let filtroTexto = [];
    if (filtros.fecha) filtroTexto.push(`Fecha: ${filtros.fecha}`);
    if (filtros.estado) {
      const estadoMap = {
        pagadas: "Pagadas",
        pendientes: "Pendientes",
        activas: "Activas",
      };
      filtroTexto.push(`Estado: ${estadoMap[filtros.estado] || "Todos"}`);
    }
    if (filtroTexto.length === 0)
      filtroTexto.push("Ninguno (se muestran todas las sesiones)");

    this.doc.text(filtroTexto.join(" • "), 40);
    this.doc.moveDown(1);
  }

  resumenHistorial(resumen) {
    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Resumen", 40, this.doc.y);

    this.doc.moveDown(1);

    const stats = [
      { label: "Total Sesiones", valor: resumen.total, color: "#3b82f6" },
      { label: "Pagadas", valor: resumen.pagadas, color: "#10b981" },
      { label: "Pendientes", valor: resumen.pendientes, color: "#f59e0b" },
      { label: "Activas", valor: resumen.activas, color: "#ef4444" },
    ];

    const boxWidth = 105;
    const boxHeight = 65;
    const spacing = 12;
    let x = 40;

    stats.forEach((stat, idx) => {
      if (idx === 2) {
        x = 40;
        this.doc.moveDown(4.5);
      }

      const boxY = this.doc.y;

      this.doc.rect(x, boxY, boxWidth, boxHeight).stroke(stat.color);
      this.doc
        .rect(x + 1, boxY + 1, boxWidth - 2, boxHeight - 2)
        .fill(stat.color + "08");

      this.doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(stat.color)
        .text(stat.valor.toString(), x, boxY + 18, {
          width: boxWidth,
          align: "center",
        });

      this.doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(stat.label, x, boxY + 44, { width: boxWidth, align: "center" });

      x += boxWidth + spacing;
    });

    this.doc.moveDown(5);
  }

  tablaHistorial(datos) {
    if (!datos || datos.length === 0) {
      this.doc
        .fontSize(12)
        .fillColor("#ef4444")
        .text("⚠ No hay sesiones con los filtros especificados");
      return;
    }

    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text(`Detalle de ${datos.length} Sesiones`, 40, this.doc.y);

    this.doc.moveDown(1);

    const columnas = [
      { key: "id_sesion", titulo: "ID", ancho: 45 },
      { key: "numero", titulo: "Espacio", ancho: 50 },
      { key: "nombre_turno", titulo: "Turno", ancho: 60 },
      { key: "hora_entrada", titulo: "Entrada", ancho: 75 },
      { key: "hora_salida", titulo: "Salida", ancho: 75 },
      { key: "total_tarifa", titulo: "Tarifa", ancho: 50 },
      { key: "pago", titulo: "Estado", ancho: 60 },
    ];

    let x = 40;
    let y = this.doc.y;
    const headerHeight = 25;

    // Encabezado
    this.doc.fillColor("#3b82f6").rect(40, y, 415, headerHeight).fill();

    columnas.forEach((col) => {
      this.doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text(col.titulo, x + 3, y + 7, {
          width: col.ancho - 6,
          align: "center",
        });
      x += col.ancho;
    });

    this.doc.moveDown(2);
    let rowY = this.doc.y;

    // Filas
    datos.forEach((fila, idx) => {
      if (rowY > 720) {
        this.doc.addPage();
        rowY = 40;

        // Repetir encabezado
        x = 40;
        this.doc.fillColor("#3b82f6").rect(40, rowY, 415, headerHeight).fill();
        columnas.forEach((col) => {
          this.doc
            .fontSize(8)
            .font("Helvetica-Bold")
            .fillColor("white")
            .text(col.titulo, x + 3, rowY + 7, {
              width: col.ancho - 6,
              align: "center",
            });
          x += col.ancho;
        });
        rowY += headerHeight + 5;
      }

      const rowHeight = 25;
      const bgColor = idx % 2 === 0 ? "#f9fafb" : "white";

      // Fondo
      this.doc.fillColor(bgColor).rect(40, rowY, 415, rowHeight).fill();
      this.doc
        .strokeColor("#e5e7eb")
        .lineWidth(0.5)
        .rect(40, rowY, 415, rowHeight)
        .stroke();

      // Contenido
      x = 40;
      columnas.forEach((col) => {
        let valor = fila[col.key];

        if (col.key === "total_tarifa") {
          valor = `S/ ${parseFloat(valor || 0).toFixed(2)}`;
        } else if (col.key === "hora_entrada" || col.key === "hora_salida") {
          valor = valor
            ? new Date(valor).toLocaleString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-";
        } else if (col.key === "pago") {
          valor =
            fila.pago === 1
              ? "✓ Pagada"
              : fila.hora_salida
              ? "Pendiente"
              : "Activa";
        } else if (col.key === "nombre_turno") {
          valor = valor.charAt(0).toUpperCase() + valor.slice(1);
        }

        this.doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#374151")
          .text(valor.toString(), x + 3, rowY + 5, {
            width: col.ancho - 6,
            align: "center",
          });

        x += col.ancho;
      });

      rowY += rowHeight;
    });
  }

  // ========== UTILIDADES ==========
  piePagina() {
    this.doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#9ca3af")
      .text(
        "Sistema de Estacionamiento Inteligente • Reporte Oficial",
        40,
        750,
        { align: "center" }
      );
  }

  piePaginaCompleta() {
    const pages = this.doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      this.doc.switchToPage(i);
      this.doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#9ca3af")
        .text(`Página ${i + 1} de ${pages}`, 40, 750, {
          align: "center",
          width: 515,
        });
    }
  }
}

module.exports = ReportePDF;
