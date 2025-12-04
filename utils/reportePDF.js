const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportePDF {
  constructor() {
    this.doc = null;
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

        // Determinar tipo
        const esHistorial = datos.esHistorial === true;

        console.log("🔍 En crearReporte:");
        console.log("   esHistorial:", esHistorial);
        console.log("   titulo:", datos.titulo);
        console.log(
          "   detalles length:",
          datos.detalles ? datos.detalles.length : 0
        );

        // Generar reporte según tipo
        if (esHistorial) {
          console.log("✅ EJECUTANDO: generarReporteHistorial");
          this.generarReporteHistorial(datos);
        } else {
          console.log("✅ EJECUTANDO: generarReporteGeneral");
          this.generarReporteGeneral(datos);
        }

        this.doc.end();

        stream.on("finish", () => {
          console.log("✅ PDF guardado:", nombreArchivo);
          resolve(nombreArchivo);
        });
        stream.on("error", reject);
      } catch (error) {
        console.error("❌ Error en crearReporte:", error);
        reject(error);
      }
    });
  }

  // ========================================
  // REPORTE HISTORIAL
  // ========================================
  generarReporteHistorial(datos) {
    console.log("🏃 generarReporteHistorial iniciado");

    this.headerPrincipal();
    this.doc.moveDown(1);

    // Título HISTORIAL
    this.doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#ef4444")
      .text("HISTORIAL COMPLETO DE SESIONES", { align: "center" });

    this.doc.moveDown(0.5);
    this.doc
      .strokeColor("#ef4444")
      .lineWidth(2.5)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(1);

    // Info box
    this.infoBox(datos.fechas);
    this.doc.moveDown(1.5);

    // Resumen
    this.dibujarResumenHistorial(datos.resumen);
    this.doc.moveDown(1.5);

    // Tabla
    if (datos.detalles && datos.detalles.length > 0) {
      console.log("📋 Dibujando tabla con", datos.detalles.length, "registros");
      this.tablaHistorial(datos.detalles);
    } else {
      this.doc
        .fontSize(13)
        .font("Helvetica-Oblique")
        .fillColor("#999")
        .text("No hay sesiones registradas para este periodo", {
          align: "center",
        });
    }

    this.piePagina();
    console.log("✅ generarReporteHistorial completado");
  }

  // ========================================
  // REPORTE GENERAL
  // ========================================
  generarReporteGeneral(datos) {
    console.log("🏃 generarReporteGeneral iniciado");

    this.headerPrincipal();
    this.doc.moveDown(1);

    // Título GENERAL
    this.doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#3b82f6")
      .text("REPORTE GENERAL DE ESTACIONAMIENTO", { align: "center" });

    this.doc.moveDown(0.5);
    this.doc
      .strokeColor("#3b82f6")
      .lineWidth(2.5)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(1);

    // Info box
    this.infoBox(datos.fechas);
    this.doc.moveDown(1.5);

    // Resumen
    this.dibujarResumenGeneral(datos.resumen);
    this.doc.moveDown(1.5);

    // Tabla
    if (datos.detalles && datos.detalles.length > 0) {
      console.log(
        "📊 Dibujando tabla de reportes con",
        datos.detalles.length,
        "registros"
      );
      this.tablaReporte(datos.detalles);
    } else {
      this.doc
        .fontSize(13)
        .font("Helvetica-Oblique")
        .fillColor("#999")
        .text("No hay datos disponibles para este periodo", {
          align: "center",
        });
    }

    this.piePagina();
    console.log("✅ generarReporteGeneral completado");
  }

  // ========================================
  // COMPONENTES COMPARTIDOS
  // ========================================

  headerPrincipal() {
    this.doc.rect(30, 30, 540, 60).fill("#3b82f6");
    this.doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("ESTACIONAMIENTO", 45, 38);
    this.doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#e0e7ff")
      .text("Sistema Inteligente de Reportes", 45, 67);
  }

  infoBox(fechas) {
    const y = this.doc.y;
    this.doc
      .rect(40, y, 515, 50)
      .fillAndStroke("#f0f9ff", "#3b82f6")
      .lineWidth(1);

    this.doc.fontSize(10).font("Helvetica").fillColor("#075985");

    this.doc.text(
      "Periodo: " + fechas.inicio + " hasta " + fechas.fin,
      50,
      y + 10
    );
    this.doc.text("Generado: " + fechas.generado, 50, y + 28);

    this.doc.moveDown(3.5);
  }

  // ========================================
  // RESUMEN HISTORIAL
  // ========================================
  dibujarResumenHistorial(resumen) {
    this.doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN EJECUTIVO", 40);
    this.doc.moveDown(0.5);

    const y = this.doc.y;
    const col1 = 40;
    const col2 = 250;
    const col3 = 450;

    // Encabezado tabla
    this.doc
      .strokeColor("#ef4444")
      .lineWidth(1)
      .moveTo(col1, y)
      .lineTo(555, y)
      .stroke();

    this.doc.fontSize(10).font("Helvetica-Bold").fillColor("#1f2937");

    this.doc.text("Metrica", col1, y + 8);
    this.doc.text("Cantidad", col2, y + 8);
    this.doc.text("Porcentaje", col3, y + 8);

    let posY = y + 25;

    const items = [
      { label: "Total Sesiones", valor: resumen.total_sesiones || 0 },
      { label: "Pagadas", valor: resumen.pagadas || 0 },
      { label: "Pendientes", valor: resumen.pendientes || 0 },
      { label: "Activas", valor: resumen.activas || 0 },
    ];

    const total = resumen.total_sesiones || 1;

    items.forEach((item, i) => {
      const bg = i % 2 === 0 ? "#f9fafb" : "white";
      this.doc.rect(col1, posY - 5, 515, 18).fill(bg);
      this.doc
        .strokeColor("#e5e7eb")
        .lineWidth(0.5)
        .rect(col1, posY - 5, 515, 18)
        .stroke();

      const porcentaje = ((item.valor / total) * 100).toFixed(1);

      this.doc.fontSize(9).font("Helvetica").fillColor("#1f2937");

      this.doc.text(item.label, col1 + 5, posY);
      this.doc.text(item.valor.toString(), col2 + 5, posY, {
        width: 50,
        align: "right",
      });
      this.doc.text(porcentaje + "%", col3 + 5, posY, {
        width: 50,
        align: "right",
      });

      posY += 20;
    });

    this.doc.y = posY;
    this.doc.moveDown(1);
  }

  // ========================================
  // RESUMEN GENERAL
  // ========================================
  dibujarResumenGeneral(resumen) {
    this.doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("METRICAS PRINCIPALES", 40);
    this.doc.moveDown(0.5);

    const y = this.doc.y;
    const col1 = 40;
    const col2 = 250;
    const col3 = 450;

    // Encabezado tabla
    this.doc
      .strokeColor("#3b82f6")
      .lineWidth(1)
      .moveTo(col1, y)
      .lineTo(555, y)
      .stroke();

    this.doc.fontSize(10).font("Helvetica-Bold").fillColor("#1f2937");

    this.doc.text("Metrica", col1, y + 8);
    this.doc.text("Cantidad", col2, y + 8);
    this.doc.text("Porcentaje", col3, y + 8);

    let posY = y + 25;

    const items = [
      { label: "Total Sesiones", valor: resumen.total_sesiones || 0 },
      { label: "Pagadas", valor: resumen.pagadas || 0 },
      { label: "Pendientes", valor: resumen.pendientes || 0 },
      { label: "Activas", valor: resumen.activas || 0 },
    ];

    const total = resumen.total_sesiones || 1;

    items.forEach((item, i) => {
      const bg = i % 2 === 0 ? "#f9fafb" : "white";
      this.doc.rect(col1, posY - 5, 515, 18).fill(bg);
      this.doc
        .strokeColor("#e5e7eb")
        .lineWidth(0.5)
        .rect(col1, posY - 5, 515, 18)
        .stroke();

      const porcentaje = ((item.valor / total) * 100).toFixed(1);

      this.doc.fontSize(9).font("Helvetica").fillColor("#1f2937");

      this.doc.text(item.label, col1 + 5, posY);
      this.doc.text(item.valor.toString(), col2 + 5, posY, {
        width: 50,
        align: "right",
      });
      this.doc.text(porcentaje + "%", col3 + 5, posY, {
        width: 50,
        align: "right",
      });

      posY += 20;
    });

    this.doc.y = posY;
    this.doc.moveDown(1);
  }

  // ========================================
  // TABLA HISTORIAL
  // ========================================
  tablaHistorial(datos) {
    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("DETALLE DE SESIONES", 40);
    this.doc.moveDown(0.5);

    const cols = [
      { titulo: "ID", key: "id_sesion", ancho: 30 },
      { titulo: "Espacio", key: "numero", ancho: 45 },
      { titulo: "Turno", key: "nombre_turno", ancho: 45 },
      { titulo: "Entrada", key: "hora_entrada", ancho: 65 },
      { titulo: "Salida", key: "hora_salida", ancho: 65 },
      { titulo: "Tarifa", key: "total_tarifa", ancho: 50 },
      { titulo: "Estado", key: "pago", ancho: 50 },
    ];

    this.dibujarTabla(cols, datos);
  }

  // ========================================
  // TABLA REPORTE
  // ========================================
  tablaReporte(datos) {
    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN POR FECHA Y TURNO", 40);
    this.doc.moveDown(0.5);

    const cols = [
      { titulo: "Fecha", key: "fecha", ancho: 50 },
      { titulo: "Turno", key: "nombre_turno", ancho: 45 },
      { titulo: "Total", key: "total_sesiones", ancho: 35 },
      { titulo: "Pagadas", key: "pagadas", ancho: 40 },
      { titulo: "Pend.", key: "pendientes", ancho: 35 },
      { titulo: "Activas", key: "activas", ancho: 35 },
      { titulo: "Ingresos", key: "ingresos_pagados", ancho: 50 },
      { titulo: "Tiempo", key: "tiempo_promedio", ancho: 40 },
    ];

    this.dibujarTabla(cols, datos);
  }

  // ========================================
  // DIBUJAR TABLA GENÉRICA
  // ========================================
  dibujarTabla(cols, datos) {
    const totalAncho = cols.reduce((s, c) => s + c.ancho, 0);
    const escala = 515 / totalAncho;

    let y = this.doc.y;
    let x = 40;

    // ENCABEZADO
    this.doc.fontSize(8).font("Helvetica-Bold").fillColor("white");
    cols.forEach((col) => {
      const w = col.ancho * escala;
      this.doc.rect(x, y, w, 20).fill("#ffffffff");
      this.doc.text(col.titulo, x + 2, y + 5, {
        width: w - 4,
        align: "center",
        height: 20,
      });
      x += w;
    });

    this.doc.moveDown(1.5);
    y = this.doc.y;

    // FILAS
    datos.forEach((fila, i) => {
      if (y + 16 > 740) {
        this.doc.addPage();
        this.headerPrincipal();
        y = 130;
      }

      x = 40;
      const bgcolor = i % 2 === 0 ? "#f9fafb" : "white";

      cols.forEach((col) => {
        const w = col.ancho * escala;
        this.doc.rect(x, y, w, 16).fill(bgcolor).stroke();

        let valor = this.formato(fila[col.key], col.key);
        this.doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor("#222")
          .text(valor, x + 2, y + 3, {
            width: w - 4,
            align: "center",
            height: 16,
          });

        x += w;
      });

      y += 16;
      this.doc.y = y;
    });

    this.doc.moveDown(1);
  }

  // ========================================
  // FORMATO DE VALORES
  // ========================================
  formato(valor, clave) {
    if (!valor && valor !== 0) return "-";

    if (clave.includes("ingresos") || clave === "total_tarifa") {
      return "S/ " + parseFloat(valor).toFixed(2);
    }

    if (clave === "hora_entrada" || clave === "hora_salida") {
      try {
        return new Date(valor).toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return valor;
      }
    }

    if (clave === "pago") {
      return valor === 1 ? "Pagada" : "Pendiente";
    }

    if (clave === "tiempo_promedio") {
      return Math.round(parseFloat(valor)) + "m";
    }

    if (clave === "nombre_turno") {
      return valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    return String(valor);
  }

  // ========================================
  // PIE DE PÁGINA
  // ========================================
  piePagina() {
    this.doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999")
      .text("Sistema de Estacionamiento Inteligente", 40, 740, {
        align: "center",
      });
  }
}

module.exports = ReportePDF;
