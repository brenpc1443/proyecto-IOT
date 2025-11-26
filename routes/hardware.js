const express = require("express");
const router = express.Router();
const {
  crearSesion,
  registrarSalida,
  obtenerSinPagar,
} = require("../controllers/sesionesController");

// Endpoints sin autenticación para el ESP32
router.post("/entrada", crearSesion);
router.put("/:id_sesion/salida", registrarSalida);
router.get("/sin-pagar", obtenerSinPagar);

module.exports = router;
