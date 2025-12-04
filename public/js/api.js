const API_URL = "/api";

const api = {
  // ========== Auth ==========
  async login(nombre_usuario, contraseña) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, contraseña }),
    });
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
    });
    return res.json();
  },

  async getUsuarioActual() {
    const res = await fetch(`${API_URL}/auth/usuario-actual`);
    if (!res.ok) return null;
    return res.json();
  },

  // ========== Espacios ==========
  async getEspacios() {
    const res = await fetch(`${API_URL}/espacios`);
    if (!res.ok) throw new Error("Error al obtener espacios");
    return res.json();
  },

  // ========== Sesiones ==========
  async registrarEntrada(id_espacio) {
    const res = await fetch(`${API_URL}/sesiones/entrada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_espacio }),
    });
    return res.json();
  },

  async registrarSalida(id_sesion) {
    const res = await fetch(`${API_URL}/sesiones/${id_sesion}/salida`, {
      method: "PUT",
    });
    return res.json();
  },

  async getSesionesSinPagar() {
    const res = await fetch(`${API_URL}/sesiones/sin-pagar`);
    if (!res.ok) throw new Error("Error al obtener sesiones");
    return res.json();
  },

  async marcarPagada(id_sesion) {
    const res = await fetch(`${API_URL}/sesiones/${id_sesion}/pagar`, {
      method: "PUT",
    });
    return res.json();
  },

  // ========== Metricas ==========
  async getMetricas() {
    const res = await fetch(`${API_URL}/metricas`);
    if (!res.ok) throw new Error("Error al obtener métricas");
    return res.json();
  },

  async getMetricasPorTurno() {
    const res = await fetch(`${API_URL}/metricas/turno`);
    if (!res.ok) throw new Error("Error al obtener métricas por turno");
    return res.json();
  },

  // ========== Historial de sesiones ==========
  async getHistorial(filtro = "", fecha = "") {
    let url = `${API_URL}/metricas/historial`;
    const params = new URLSearchParams();
    if (filtro) params.append("filtro", filtro);
    if (fecha) params.append("fecha", fecha);

    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener historial");
    return res.json();
  },

  // ========== Reporte ==========
  async getReporte(fechaInicio = "", fechaFin = "") {
    let url = `${API_URL}/metricas/reporte`;
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fecha_inicio", fechaInicio);
    if (fechaFin) params.append("fecha_fin", fechaFin);

    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener reporte");
    return res.json();
  },

  // ========== Reporte PDF ==========
  async getReportePDF(fechaInicio = "", fechaFin = "", tipo = "reporte") {
    let url = `${API_URL}/metricas/pdf`;
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fecha_inicio", fechaInicio);
    if (fechaFin) params.append("fecha_fin", fechaFin);
    if (tipo) params.append("tipo", tipo);

    if (params.toString()) url += "?" + params.toString();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al generar PDF");

      const blob = await res.blob();
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `reporte_${new Date().getTime()}.pdf`;
      a.click();
      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      throw error;
    }
  },
};
