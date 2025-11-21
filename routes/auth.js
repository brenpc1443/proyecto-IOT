const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  usuarioActual,
} = require("../controllers/authController");
const { verificarAuth } = require("../middleware/auth");

router.post("/login", login);
router.post("/logout", logout);
router.get("/usuario-actual", verificarAuth, usuarioActual);

module.exports = router;
