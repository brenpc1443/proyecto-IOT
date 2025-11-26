const express = require("express");
const session = require("express-session");
require("dotenv").config();
const { inicializarBD } = require("./config/database");

const authRoutes = require("./routes/auth");
const espaciosRoutes = require("./routes/espacios");
const sesionesRoutes = require("./routes/sesiones");
const metricasRoutes = require("./routes/metricas");
const hardwareRoutes = require("./routes/hardware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "parking-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

// Inicializar BD
inicializarBD();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/espacios", espaciosRoutes);
app.use("/api/sesiones", sesionesRoutes);
app.use("/api/metricas", metricasRoutes);
app.use("/api/hardware", hardwareRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
