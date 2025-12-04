const ReportePDF = require('../utils/reportePDF');
const { db } = require('../config/database');

const generarReportePDF = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;
    
    // Obtener datos del reporte
    let datos = [];
    if (tipo === 'historial') {
      datos = await obtenerHistorialDB(fecha_inicio, fecha_fin);
    } else {
      datos = await obtenerReporteBD(fecha_inicio, fecha_fin);
    }

    // Crear PDF
    const reporte = new ReportePDF();
    const nombreArchivo = `reporte_${Date.now()}.pdf`;
    
    const resumenData = {
      titulo: tipo === 'historial' ? 'Historial de Sesiones' : 'Reporte General',
      fechas: {
        inicio: fecha_inicio || 'Sin especificar',
        fin: fecha_fin || 'Sin especificar',
        generado: new Date().toLocaleString('es-PE')
      },
      resumen: calcularResumen(datos),
      detalles: datos,
      ...(tipo === 'historial' && { historial: datos })
    };

    await reporte.crearReporte(resumenData, nombreArchivo);
    
    res.download(`public/reportes/${nombreArchivo}`, nombreArchivo, (err) => {
      if (err) console.error(err);
      // Opcional: eliminar archivo después de descargar
      // fs.unlink(`public/reportes/${nombreArchivo}`, () => {});
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
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
                   SUM(CASE WHEN s.pago = 0 AND s.hora_salida IS NOT NULL THEN s.total_tarifa ELSE 0 END) as ingresos_pendientes
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
               ORDER BY DATE(s.hora_entrada) DESC`;

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function calcularResumen(datos) {
  const resumen = {
    total_sesiones: datos.length,
    pagadas: datos.filter(d => d.pago === 1).length,
    pendientes: datos.filter(d => d.pago === 0 && d.hora_salida).length,
    activas: datos.filter(d => !d.hora_salida).length
  };
  return resumen;
}

module.exports = { generarReportePDF };
