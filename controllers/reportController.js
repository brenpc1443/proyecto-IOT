const ReportePDF = require("../utils/reportePDF");
const { db } = require("../config/database");
const fs = require("fs");
const path = require("path");

const generarReportePDF = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;

    let datos = [];
    let resumenData;

    if (tipo === "historial") {
      // Obtener historial
      datos = await obtenerHistorialDB(fecha_inicio, fecha_fin);

      const pagadas = datos.filter((s) => s.pago === 1).length;
      const pendientes = datos.filter(
        (s) => s.pago === 0 && s.hora_salida
      ).length;
      const activas = datos.filter((s) => !s.hora_salida).length;

      resumenData = {
        titulo: "Historial de Sesiones",
        fechas: {
          inicio: fecha_inicio || "Sin especificar",
          fin: fecha_fin || "Sin especificar",
          generado: new Date().toLocaleString("es-PE"),
        },
        filtros: {
          fecha: fecha_inicio || "",
          estado: "",
        },
        resumen: {
          total: datos.length,
          pagadas,
          pendientes,
          activas,
        },
        detalles: datos,
      };

      const reporte = new ReportePDF();
      const nombreArchivo = `historial_${Date.now()}.pdf`;
      await reporte.crearReporteHistorial(resumenData, nombreArchivo);

      res.download(
        path.join(__dirname, `../public/reportes/${nombreArchivo}`),
        nombreArchivo,
        (err) => {
          if (err) console.error(err);
          // Opcional: limpiar archivo después de descargar
          // setTimeout(() => {
          //   fs.unlink(path.join(__dirname, `../public/reportes/${nombreArchivo}`), () => {});
          // }, 5000);
        }
      );
    } else {
      // Obtener reporte general
      datos = await obtenerReporteBD(fecha_inicio, fecha_fin);

      const resumen = calcularResumen(datos);

      resumenData = {
        titulo: "Reporte General",
        fechas: {
          inicio: fecha_inicio || "Sin especificar",
          fin: fecha_fin || "Sin especificar",
          generado: new Date().toLocaleString("es-PE"),
        },
        resumen,
        detalles: datos,
      };

      const reporte = new ReportePDF();
      const nombreArchivo = `reporte_${Date.now()}.pdf`;
      await reporte.crearReporteGeneral(resumenData, nombreArchivo);

      res.download(
        path.join(__dirname, `../public/reportes/${nombreArchivo}`),
        nombreArchivo,
        (err) => {
          if (err) console.error(err);
          // Opcional: limpiar archivo después de descargar
          // setTimeout(() => {
          //   fs.unlink(path.join(__dirname, `../public/reportes/${nombreArchivo}`), () => {});
          // }, 5000);
        }
      );
    }
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

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
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

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
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
