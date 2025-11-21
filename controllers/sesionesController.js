const { db } = require('../config/database');

const crearSesion = (req, res) => {
  const { id_espacio } = req.body;
  const hora_actual = new Date().toISOString();

  db.get('SELECT * FROM espacio WHERE id_espacio = ?', [id_espacio], (err, espacio) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!espacio) return res.status(404).json({ error: 'Espacio no encontrado' });

    const hora = new Date().getHours();
    const id_turno = hora < 12 ? 1 : 2;

    db.run(
      'INSERT INTO sesion (id_espacio, id_turno, hora_entrada) VALUES (?, ?, ?)',
      [id_espacio, id_turno, hora_actual],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          'UPDATE espacio SET estado = ? WHERE id_espacio = ?',
          ['ocupado', id_espacio],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
              mensaje: 'Sesión creada',
              id_sesion: this.lastID
            });
          }
        );
      }
    );
  });
};

const registrarSalida = (req, res) => {
  const { id_sesion } = req.params;
  const hora_actual = new Date().toISOString();
  const tarifa_por_minuto = 2;

  db.get('SELECT * FROM sesion WHERE id_sesion = ?', [id_sesion], (err, sesion) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });

    const hora_entrada = new Date(sesion.hora_entrada);
    const hora_salida = new Date(hora_actual);
    const minutos = Math.ceil((hora_salida - hora_entrada) / 60000);
    const total_tarifa = minutos * tarifa_por_minuto;

    db.run(
      'UPDATE sesion SET hora_salida = ?, total_tarifa = ? WHERE id_sesion = ?',
      [hora_actual, total_tarifa, id_sesion],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          'UPDATE espacio SET estado = ? WHERE id_espacio = ?',
          ['disponible', sesion.id_espacio],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
              mensaje: 'Salida registrada',
              total_tarifa,
              minutos
            });
          }
        );
      }
    );
  });
};

const obtenerSinPagar = (req, res) => {
  db.all(
    `SELECT s.*, e.numero, t.nombre_turno 
     FROM sesion s 
     JOIN espacio e ON s.id_espacio = e.id_espacio 
     JOIN turno t ON s.id_turno = t.id_turno 
     WHERE s.pago = 0 AND s.hora_salida IS NOT NULL
     ORDER BY s.hora_entrada DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

const marcarPagada = (req, res) => {
  const { id_sesion } = req.params;

  db.run(
    'UPDATE sesion SET pago = 1 WHERE id_sesion = ?',
    [id_sesion],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Sesión no encontrada' });
      res.json({ mensaje: 'Pago registrado' });
    }
  );
};

module.exports = { crearSesion, registrarSalida, obtenerSinPagar, marcarPagada };