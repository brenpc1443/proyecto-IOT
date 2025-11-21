const { db } = require("../config/database");

const login = (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?",
    [nombre_usuario, contraseña],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row)
        return res.status(401).json({ error: "Credenciales inválidas" });

      req.session.usuario = {
        id_usuario: row.id_usuario,
        nombre_usuario: row.nombre_usuario,
        rol: row.rol,
      };

      res.json({
        mensaje: "Login exitoso",
        usuario: req.session.usuario,
      });
    }
  );
};

const logout = (req, res) => {
  req.session.destroy();
  res.json({ mensaje: "Logout exitoso" });
};

const usuarioActual = (req, res) => {
  res.json(req.session.usuario);
};

module.exports = { login, logout, usuarioActual };
