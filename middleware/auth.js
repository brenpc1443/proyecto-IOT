const verificarAuth = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
};

const verificarRol = (rol) => {
  return (req, res, next) => {
    if (
      req.session.usuario.rol !== rol &&
      req.session.usuario.rol !== "administrador"
    ) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
};

module.exports = { verificarAuth, verificarRol };
