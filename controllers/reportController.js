const ReportePDF = require("../utils/reportePDF");
const { db } = require("../config/database");
const fs = require("fs");
const path = require("path");

const generarReportePDF = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;

    console.log("=== GENERANDO REPORTE ===");
    console.log("Tipo:", tipo);
    console.log("Fecha inicio:", fecha_inicio);
    console.log("Fecha fin:", fecha_fin);

    if (!fecha_inicio && !fecha_fin) {
      return res.status(400).json({
        error: "Debe especificar fecha_inicio o fecha_fin",
      });
    }

    let datos = [];
    let resumenData;

    if (tipo === "historial") {
      // Obtener historial completo
      datos = await obtenerHistorialDB(fecha_inicio, fecha_fin);

      console.log("Datos historial obtenidos:", datos.length, "registros");
      if (datos.length > 0) {
        console.log("Primer registro:", JSON.stringify(datos[0]));
      }

      const pagadas = datos.filter((s) => s.pago === 1).length;
      const pendientes = datos.filter(
        (s) => s.pago === 0 && s.hora_salida
      ).length;
      const activas = datos.filter((s) => !s.hora_salida).length;

      resumenData = {
        titulo: "Historial de Sesiones",
        tipo: "historial",
        esHistorial: true,
        fechas: {
          inicio: fecha_inicio || "Inicio",
          fin: fecha_fin || "Hoy",
          generado: new Date().toLocaleString("es-PE"),
        },
        resumen: {
          total_sesiones: datos.length,
          pagadas,
          pendientes,
          activas,
        },
        detalles: datos,
      };

      console.log("✓ Reporte HISTORIAL preparado");
      console.log("  - esHistorial enviado:", true);
      console.log(
        "  - Datos preparados:",
        JSON.stringify(resumenData).substring(0, 200)
      );
    } else {
      // Obtener reporte por período (agrupado)
      datos = await obtenerReporteBD(fecha_inicio, fecha_fin);

      console.log("Datos reporte obtenidos:", datos.length, "registros");

      if (datos.length === 0) {
        console.log("Advertencia: No hay datos para el período especificado");
      }

      const resumen = calcularResumen(datos);

      resumenData = {
        titulo: "Reporte General por Período",
        tipo: "reporte",
        esHistorial: false,
        fechas: {
          inicio: fecha_inicio || "Inicio",
          fin: fecha_fin || "Hoy",
          generado: new Date().toLocaleString("es-PE"),
        },
        resumen,
        detalles: datos,
      };

      console.log("✓ Reporte GENERAL preparado");
    }

    console.log("Resumen:", resumenData.resumen);

    // Generar PDF
    const reporte = new ReportePDF();
    const nombreArchivo = `reporte_${tipo}_${Date.now()}.pdf`;

    await reporte.crearReporte(resumenData, nombreArchivo);

    console.log("PDF generado:", nombreArchivo);

    // Descargar archivo
    const rutaArchivo = path.join(
      __dirname,
      `../public/reportes/${nombreArchivo}`
    );

    res.download(rutaArchivo, nombreArchivo, (err) => {
      if (err) {
        console.error("Error descargando archivo:", err);
      }
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: error.message });
  }
};

function obtenerHistorialDB(inicio, fin) {
  return new Promise((resolve, reject) => {
    let query = `SELECT s.*, e.numero, t.nombre_turno 
                 FROM sesion s 
                 JOIN espacio e ON s.id_espacio = e.id_espacio 
                 JOIN turno t ON s.id_turno = t.id_turno 
                 WHERE 1=1`;
    const params = [];

    if (inicio) {
      query += ` AND DATE(s.hora_entrada) >= ?`;
      params.push(inicio);
    }
    if (fin) {
      query += ` AND DATE(s.hora_entrada) <= ?`;
      params.push(fin);
    }

    query += ` ORDER BY s.hora_entrada DESC`;

    console.log("Query historial:", query);
    console.log("Params:", params);

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Error en obtenerHistorialDB:", err);
        reject(err);
      } else {
        console.log("Filas retornadas:", rows ? rows.length : 0);
        resolve(rows || []);
      }
    });
  });
}

function obtenerReporteBD(inicio, fin) {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                   DATE(s.hora_entrada) as fecha,
                   t.nombre_turno,
                   COUNT(s.id_sesion) as total_sesiones,
                   COUNT(CASE WHEN s.pago = 1 THEN 1 END) as pagadas,
                   COUNT(CASE WHEN s.pago = 0 AND s.hora_salida IS NOT NULL THEN 1 END) as pendientes,
                   COUNT(CASE WHEN s.hora_salida IS NULL THEN 1 END) as activas,
                   SUM(CASE WHEN s.pago = 1 THEN s.total_tarifa ELSE 0 END) as ingresos_pagados,
                   SUM(CASE WHEN s.pago = 0 AND s.hora_salida IS NOT NULL THEN s.total_tarifa ELSE 0 END) as ingresos_pendientes,
                   AVG(CAST((julianday(s.hora_salida) - julianday(s.hora_entrada)) * 1440 AS REAL)) as tiempo_promedio
                 FROM sesion s
                 JOIN turno t ON s.id_turno = t.id_turno
                 WHERE 1=1`;
    const params = [];

    if (inicio) {
      query += ` AND DATE(s.hora_entrada) >= ?`;
      params.push(inicio);
    }
    if (fin) {
      query += ` AND DATE(s.hora_entrada) <= ?`;
      params.push(fin);
    }

    query += ` GROUP BY DATE(s.hora_entrada), t.nombre_turno
               ORDER BY DATE(s.hora_entrada) DESC, t.nombre_turno`;

    console.log("Query reporte:", query);
    console.log("Params:", params);

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Error en obtenerReporteBD:", err);
        reject(err);
      } else {
        console.log("Filas retornadas:", rows ? rows.length : 0);
        resolve(rows || []);
      }
    });
  });
}

function calcularResumen(datos) {
  let totalSesiones = 0;
  let totalPagadas = 0;
  let totalPendientes = 0;
  let totalActivas = 0;

  datos.forEach((d) => {
    totalSesiones += d.total_sesiones || 0;
    totalPagadas += d.pagadas || 0;
    totalPendientes += d.pendientes || 0;
    totalActivas += d.activas || 0;
  });

  return {
    total_sesiones: totalSesiones,
    pagadas: totalPagadas,
    pendientes: totalPendientes,
    activas: totalActivas,
  };
}

module.exports = { generarReportePDF };
