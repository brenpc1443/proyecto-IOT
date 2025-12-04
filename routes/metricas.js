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
const { generarReportePDF } = require("../controllers/reportController");
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

// Nuevo endpoint para PDF
router.get(
  "/pdf",
  verificarAuth,
  verificarRol("administrador"),
  generarReportePDF
);

module.exports = router;
