const express = require("express");
const router = express.Router();
const {
  obtenerMetricas,
  obtenerMetricasPorTurno,
} = require("../controllers/metricasController");
const { verificarAuth, verificarRol } = require("../middleware/auth");

router.get("/", verificarAuth, verificarRol("administrador"), obtenerMetricas);
router.get(
  "/turno",
  verificarAuth,
  verificarRol("administrador"),
  obtenerMetricasPorTurno
);

module.exports = router;
