// ============ Verificar Auth ============
(async () => {
    const usuario = await api.getUsuarioActual();
    if (!usuario) {
      window.location.href = 'index.html';
      return;
    }
    if (usuario.rol !== 'administrador') {
      window.location.href = 'dashboard-encargado.html';
      return;
    }
    document.getElementById('nombreUsuario').textContent = usuario.nombre_usuario;
    cargarDatos();
  })();
  
  // ============ Cargar Datos ============
  async function cargarDatos() {
    await Promise.all([
      cargarMetricas(),
      cargarMetricasTurno(),
      cargarEspacios()
    ]);
  }
  
  // ============ Métricas Generales ============
  async function cargarMetricas() {
    try {
      const m = await api.getMetricas();
      
      document.getElementById('totalSesiones').textContent = m.total_sesiones || 0;
      document.getElementById('pagadas').textContent = m.pagadas || 0;
      document.getElementById('pendientes').textContent = m.pendientes || 0;
      document.getElementById('ingresos').textContent = `S/ ${(m.ingresos_totales || 0).toFixed(2)}`;
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  }
  
  // ============ Métricas por Turno ============
  async function cargarMetricasTurno() {
    try {
      const turnos = await api.getMetricasPorTurno();
      const tbody = document.getElementById('turnosBody');
  
      if (turnos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Sin datos</td></tr>';
        return;
      }
  
      tbody.innerHTML = turnos.map(t => `
        <tr>
          <td style="text-transform: capitalize;">${t.nombre_turno}</td>
          <td>${t.sesiones || 0}</td>
          <td><strong>S/ ${(t.ingresos || 0).toFixed(2)}</strong></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }
  
  // ============ Espacios (Solo Vista) ============
  async function cargarEspacios() {
    try {
      const espacios = await api.getEspacios();
      const grid = document.getElementById('espaciosGrid');
      
      const disponibles = espacios.filter(e => e.estado === 'disponible').length;
      const ocupados = espacios.filter(e => e.estado === 'ocupado').length;
  
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; margin-bottom: 1rem; color: var(--gray-600);">
          <strong>${disponibles}</strong> disponibles · <strong>${ocupados}</strong> ocupados
        </div>
        ${espacios.map(e => `
          <div class="espacio ${e.estado}" style="cursor: default;">
            <span class="numero">${e.numero}</span>
            <span class="estado">${e.estado}</span>
          </div>
        `).join('')}
      `;
    } catch (error) {
      console.error('Error al cargar espacios:', error);
    }
  }
  
  // ============ Logout ============
  document.getElementById('btnLogout').addEventListener('click', async () => {
    await api.logout();
    window.location.href = 'index.html';
  });
  
  // ============ Auto-refresh cada 30 segundos ============
  setInterval(cargarDatos, 30000);