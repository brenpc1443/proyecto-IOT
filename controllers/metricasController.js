const { db } = require("../config/database");

const obtenerMetricas = (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total_sesiones,
      COUNT(CASE WHEN pago = 1 THEN 1 END) as pagadas,
      COUNT(CASE WHEN pago = 0 AND hora_salida IS NOT NULL THEN 1 END) as pendientes,
      SUM(CASE WHEN pago = 1 THEN total_tarifa ELSE 0 END) as ingresos_totales
     FROM sesion`,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
};

const obtenerMetricasPorTurno = (req, res) => {
  db.all(
    `SELECT 
      t.nombre_turno,
      COUNT(s.id_sesion) as sesiones,
      SUM(CASE WHEN s.pago = 1 THEN s.total_tarifa ELSE 0 END) as ingresos
     FROM turno t
     LEFT JOIN sesion s ON t.id_turno = s.id_turno
     GROUP BY t.id_turno`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

module.exports = { obtenerMetricas, obtenerMetricasPorTurno };
