const { db } = require("../config/database");

const obtenerEspacios = (req, res) => {
  db.all("SELECT * FROM espacio", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = { obtenerEspacios };
