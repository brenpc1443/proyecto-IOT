const express = require("express");
const router = express.Router();
const {
  crearSesion,
  registrarSalida,
  obtenerSinPagar,
  marcarPagada,
} = require("../controllers/sesionesController");
const { verificarAuth, verificarRol } = require("../middleware/auth");

router.post("/entrada", verificarAuth, crearSesion);
router.put("/:id_sesion/salida", verificarAuth, registrarSalida);
router.get(
  "/sin-pagar",
  verificarAuth,
  verificarRol("encargado"),
  obtenerSinPagar
);
router.put(
  "/:id_sesion/pagar",
  verificarAuth,
  verificarRol("encargado"),
  marcarPagada
);

module.exports = router;
