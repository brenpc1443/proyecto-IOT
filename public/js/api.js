// ============ API Base ============
const API_URL = '/api';

// ============ Auth ============
const api = {
  // Login
  async login(nombre_usuario, contraseña) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_usuario, contraseña })
    });
    return res.json();
  },

  // Logout
  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST'
    });
    return res.json();
  },

  // Usuario actual
  async getUsuarioActual() {
    const res = await fetch(`${API_URL}/auth/usuario-actual`);
    if (!res.ok) return null;
    return res.json();
  },

  // ============ Espacios ============
  async getEspacios() {
    const res = await fetch(`${API_URL}/espacios`);
    if (!res.ok) throw new Error('Error al obtener espacios');
    return res.json();
  },

  // ============ Sesiones ============
  async registrarEntrada(id_espacio) {
    const res = await fetch(`${API_URL}/sesiones/entrada`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_espacio })
    });
    return res.json();
  },

  async registrarSalida(id_sesion) {
    const res = await fetch(`${API_URL}/sesiones/${id_sesion}/salida`, {
      method: 'PUT'
    });
    return res.json();
  },

  async getSesionesSinPagar() {
    const res = await fetch(`${API_URL}/sesiones/sin-pagar`);
    if (!res.ok) throw new Error('Error al obtener sesiones');
    return res.json();
  },

  async marcarPagada(id_sesion) {
    const res = await fetch(`${API_URL}/sesiones/${id_sesion}/pagar`, {
      method: 'PUT'
    });
    return res.json();
  },

  // ============ Métricas ============
  async getMetricas() {
    const res = await fetch(`${API_URL}/metricas`);
    if (!res.ok) throw new Error('Error al obtener métricas');
    return res.json();
  },

  async getMetricasPorTurno() {
    const res = await fetch(`${API_URL}/metricas/turno`);
    if (!res.ok) throw new Error('Error al obtener métricas por turno');
    return res.json();
  }
};