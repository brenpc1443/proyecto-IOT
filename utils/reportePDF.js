const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportePDF {
  constructor() {
    this.doc = null;
    this.pageNumber = 1;
    this.margenIzq = 40;
    this.margenDer = 555;
    this.altoUltilmo = 730;
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
        });

        const stream = fs.createWriteStream(rutaArchivo);
        this.doc.pipe(stream);

        // Determinar tipo de reporte
        const esHistorial =
          datos.detalles &&
          datos.detalles[0] &&
          datos.detalles[0].id_sesion &&
          datos.detalles[0].numero;

        if (esHistorial) {
          this.crearReporteHistorial(datos);
        } else {
          this.crearReporteGeneral(datos);
        }

        this.doc.end();

        stream.on("finish", () => resolve(nombreArchivo));
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // ========== REPORTE HISTORIAL ==========
  crearReporteHistorial(datos) {
    this.encabezadoPrincipal();
    this.tituloReporte(datos.titulo);
    this.seccionFechas(datos.fechas);
    this.seccionResumenHistorial(datos.resumen);
    this.doc.moveDown(0.5);
    this.tablaHistorial(datos.detalles);
    this.piePagina();
  }

  // ========== REPORTE GENERAL ==========
  crearReporteGeneral(datos) {
    this.encabezadoPrincipal();
    this.tituloReporte(datos.titulo);
    this.seccionFechas(datos.fechas);
    this.seccionResumenGeneral(datos.resumen);
    this.doc.moveDown(0.5);
    this.tablaReporte(datos.detalles);
    this.piePagina();
  }

  // ========== ENCABEZADO PRINCIPAL ==========
  encabezadoPrincipal() {
    // Fondo azul
    this.doc.rect(30, 30, 540, 80).fill("#3b82f6");

    // Ícono y título
    this.doc
      .fontSize(32)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("🅿️", 50, 45);

    this.doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("ESTACIONAMIENTO", 100, 50);

    this.doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#e0e7ff")
      .text("Sistema Inteligente de Reportes", 100, 78);

    this.doc.moveDown(4.5);
  }

  // ========== TITULO REPORTE ==========
  tituloReporte(titulo) {
    this.doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text(titulo, 40);

    this.doc
      .strokeColor("#3b82f6")
      .lineWidth(2)
      .moveTo(40, this.doc.y)
      .lineTo(555, this.doc.y)
      .stroke();
    this.doc.moveDown(0.8);
  }

  // ========== SECCIÓN FECHAS ==========
  seccionFechas(fechas) {
    const y = this.doc.y;

    // Info box
    this.doc.rect(40, y, 515, 50).fillAndStroke("#f0f9ff", "#3b82f6");

    this.doc.fontSize(10).font("Helvetica").fillColor("#075985");

    this.doc.text(`Período: ${fechas.inicio} hasta ${fechas.fin}`, 50, y + 10);
    this.doc.text(`Generado: ${fechas.generado}`, 50, y + 28);
    this.doc.text(`Página 1`, 480, y + 10, { width: 65, align: "right" });

    this.doc.moveDown(3.5);
  }

  // ========== RESUMEN HISTORIAL ==========
  seccionResumenHistorial(resumen) {
    const datos = [
      {
        label: "Total Sesiones",
        valor: resumen.total_sesiones,
        color: "#3b82f6",
        icon: "📊",
      },
      { label: "Pagadas", valor: resumen.pagadas, color: "#22c55e", icon: "✓" },
      {
        label: "Pendientes",
        valor: resumen.pendientes,
        color: "#f59e0b",
        icon: "⏳",
      },
      { label: "Activas", valor: resumen.activas, color: "#ef4444", icon: "▶" },
    ];

    const y = this.doc.y;
    const anchoCaja = 120;
    let posX = 40;

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN", 40);

    this.doc.moveDown(0.6);

    datos.forEach((d, idx) => {
      if (idx > 0 && idx % 3 === 0) {
        posX = 40;
      } else if (idx > 0) {
        posX += anchoCaja + 12;
      }

      const cajaY = this.doc.y;
      this.doc
        .rect(posX, cajaY, anchoCaja, 70)
        .fill(d.color + "15")
        .strokeColor(d.color)
        .lineWidth(1.5)
        .stroke();

      this.doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(d.color)
        .text(d.valor.toString(), posX + 5, cajaY + 10, {
          width: anchoCaja - 10,
          align: "center",
        });

      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(d.label, posX + 5, cajaY + 45, {
          width: anchoCaja - 10,
          align: "center",
        });

      if (idx % 3 === 0) {
        this.doc.moveDown(4.2);
      }
    });

    this.doc.moveDown(1);
  }

  // ========== RESUMEN GENERAL ==========
  seccionResumenGeneral(resumen) {
    const datos = [
      { label: "Total", valor: resumen.total_sesiones, color: "#3b82f6" },
      { label: "Pagadas", valor: resumen.pagadas, color: "#22c55e" },
      { label: "Pendientes", valor: resumen.pendientes, color: "#f59e0b" },
      { label: "Activas", valor: resumen.activas, color: "#ef4444" },
    ];

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN EJECUTIVO", 40);

    this.doc.moveDown(0.6);

    const anchoCaja = 110;
    let posX = 40;

    datos.forEach((d, idx) => {
      if (idx > 0 && idx % 4 === 0) {
        posX = 40;
        this.doc.moveDown(3.8);
      } else if (idx > 0) {
        posX += anchoCaja + 10;
      }

      const cajaY = this.doc.y;
      this.doc
        .rect(posX, cajaY, anchoCaja, 60)
        .fill(d.color + "15")
        .strokeColor(d.color)
        .lineWidth(1.5)
        .stroke();

      this.doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(d.color)
        .text(d.valor.toString(), posX + 5, cajaY + 8, {
          width: anchoCaja - 10,
          align: "center",
        });

      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(d.label, posX + 5, cajaY + 38, {
          width: anchoCaja - 10,
          align: "center",
        });

      if (idx % 4 === 3 || idx === datos.length - 1) {
        this.doc.moveDown(3.8);
      }
    });

    this.doc.moveDown(0.5);
  }

  // ========== TABLA HISTORIAL ==========
  tablaHistorial(datos) {
    if (!datos || datos.length === 0) {
      this.doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#999")
        .text("No hay datos disponibles");
      return;
    }

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("DETALLE DE SESIONES", 40);

    this.doc.moveDown(0.6);

    const columnas = [
      { key: "id_sesion", titulo: "ID", ancho: 35 },
      { key: "numero", titulo: "Espacio", ancho: 50 },
      { key: "nombre_turno", titulo: "Turno", ancho: 50 },
      { key: "hora_entrada", titulo: "Entrada", ancho: 70 },
      { key: "hora_salida", titulo: "Salida", ancho: 70 },
      { key: "total_tarifa", titulo: "Tarifa", ancho: 50 },
      { key: "pago", titulo: "Estado", ancho: 45 },
    ];

    this.dibujarTabla(columnas, datos, "historial");
  }

  // ========== TABLA REPORTE ==========
  tablaReporte(datos) {
    if (!datos || datos.length === 0) {
      this.doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#999")
        .text("No hay datos disponibles");
      return;
    }

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("RESUMEN POR PERÍODO", 40);

    this.doc.moveDown(0.6);

    const columnas = [
      { key: "fecha", titulo: "Fecha", ancho: 55 },
      { key: "nombre_turno", titulo: "Turno", ancho: 50 },
      { key: "total_sesiones", titulo: "Total", ancho: 40 },
      { key: "pagadas", titulo: "Pagadas", ancho: 40 },
      { key: "pendientes", titulo: "Pend.", ancho: 40 },
      { key: "activas", titulo: "Activas", ancho: 40 },
      { key: "ingresos_pagados", titulo: "Ingresos", ancho: 60 },
      { key: "tiempo_promedio", titulo: "Tiempo", ancho: 40 },
    ];

    this.dibujarTabla(columnas, datos, "reporte");
  }

  // ========== DIBUJAR TABLA (GENÉRICA) ==========
  dibujarTabla(columnas, datos, tipo) {
    const anchoTotal = columnas.reduce((sum, c) => sum + c.ancho, 0);
    const escala = (555 - 40) / anchoTotal;

    let posY = this.doc.y;
    let posX = 40;

    // ENCABEZADO
    this.doc.fontSize(9).font("Helvetica-Bold").fillColor("white");

    columnas.forEach((col) => {
      const anchoAjustado = col.ancho * escala;
      this.doc.rect(posX, posY, anchoAjustado, 25).fill("#3b82f6");

      this.doc.fontSize(8).text(col.titulo, posX + 3, posY + 8, {
        width: anchoAjustado - 6,
        align: "center",
        height: 25,
      });

      posX += anchoAjustado;
    });

    this.doc.moveDown(1.8);
    posY = this.doc.y;

    // FILAS
    const altoFila = 18;
    let numFila = 0;

    for (let i = 0; i < Math.min(datos.length, 25); i++) {
      const fila = datos[i];

      // Verificar si cabe en página
      if (posY + altoFila > this.altoUltilmo) {
        this.doc.addPage();
        posY = 40;
        numFila = 0;
      }

      posX = 40;
      const colorFondo = numFila % 2 === 0 ? "#f9fafb" : "white";

      columnas.forEach((col) => {
        const anchoAjustado = col.ancho * escala;
        this.doc.rect(posX, posY, anchoAjustado, altoFila).fill(colorFondo);

        let valor = this.obtenerValor(fila, col.key, tipo);

        this.doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor("#1f2937")
          .text(valor, posX + 3, posY + 4, {
            width: anchoAjustado - 6,
            align: "center",
            height: altoFila,
          });

        posX += anchoAjustado;
      });

      posY += altoFila;
      numFila++;
      this.doc.y = posY;
    }

    if (datos.length > 25) {
      this.doc.moveDown(0.5);
      this.doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor("#999")
        .text(`... y ${datos.length - 25} registros más`, 40);
    }

    this.doc.moveDown(1);
  }

  // ========== OBTENER VALOR CELDA ==========
  obtenerValor(fila, key, tipo) {
    let valor = fila[key];

    if (valor === null || valor === undefined || valor === "") return "-";

    // Moneda
    if (key.includes("ingresos") || key === "total_tarifa") {
      return `S/ ${parseFloat(valor).toFixed(2)}`;
    }

    // Fechas
    if (key === "hora_entrada" || key === "hora_salida") {
      return new Date(valor).toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
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
      const minutos = Math.round(parseFloat(valor));
      return `${minutos}m`;
    }

    // Turno
    if (key === "nombre_turno") {
      return valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    return valor.toString();
  }

  // ========== PIE DE PÁGINA ==========
  piePagina() {
    const y = 750;

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
