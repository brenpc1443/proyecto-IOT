const express = require("express");
const router = express.Router();
const {
  obtenerMetricas,
  obtenerMetricasPorTurno,
} = require("../controllers/metricasController");
const {
  obtenerHistorial,
  obtenerReporte,
} = require("../controllers/sesionesController");
const { verificarAuth, verificarRol } = require("../middleware/auth");

router.get("/", verificarAuth, verificarRol("administrador"), obtenerMetricas);

router.get(
  "/turno",
  verificarAuth,
  verificarRol("administrador"),
  obtenerMetricasPorTurno
);

router.get(
  "/historial",
  verificarAuth,
  verificarRol("administrador"),
  obtenerHistorial
);

router.get(
  "/reporte",
  verificarAuth,
  verificarRol("administrador"),
  obtenerReporte
);

module.exports = router;
