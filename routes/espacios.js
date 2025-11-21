const express = require("express");
const router = express.Router();
const { obtenerEspacios } = require("../controllers/espaciosController");
const { verificarAuth } = require("../middleware/auth");

router.get("/", verificarAuth, obtenerEspacios);

module.exports = router;
