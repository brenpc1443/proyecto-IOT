// ============ Verificar Auth ============
(async () => {
  const usuario = await api.getUsuarioActual();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("nombreUsuario").textContent = usuario.nombre_usuario;
  cargarDatos();
})();

// ============ Cargar Datos ============
async function cargarDatos() {
  await Promise.all([cargarEspacios(), cargarSinPagar()]);
}

// ============ Espacios (Solo Visualización) ============
async function cargarEspacios() {
  try {
    const espacios = await api.getEspacios();
    const grid = document.getElementById("espaciosGrid");

    const disponibles = espacios.filter(
      (e) => e.estado === "disponible"
    ).length;
    const ocupados = espacios.filter((e) => e.estado === "ocupado").length;

    grid.innerHTML = `
      <div style="grid-column: 1 / -1; margin-bottom: 1rem; color: var(--gray-600);">
        <strong>${disponibles}</strong> disponibles · <strong>${ocupados}</strong> ocupados
      </div>
      ${espacios
        .map(
          (e) => `
        <div class="espacio ${e.estado}" style="cursor: default;">
          <span class="numero">${e.numero}</span>
          <span class="estado">${e.estado}</span>
        </div>
      `
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar espacios:", error);
  }
}

// ============ Sesiones Sin Pagar ============
async function cargarSinPagar() {
  try {
    const sesiones = await api.getSesionesSinPagar();
    const tbody = document.getElementById("sinPagarBody");

    if (sesiones.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">No hay sesiones pendientes de pago</td></tr>';
      return;
    }

    tbody.innerHTML = sesiones
      .map(
        (s) => `
      <tr>
        <td>Espacio ${s.numero}</td>
        <td style="text-transform: capitalize;">${s.nombre_turno}</td>
        <td>${formatearFecha(s.hora_entrada)}</td>
        <td>${formatearFecha(s.hora_salida)}</td>
        <td><strong>S/ ${s.total_tarifa.toFixed(2)}</strong></td>
        <td>
          <button class="btn btn-success btn-sm" onclick="marcarPagada(${
            s.id_sesion
          })">
            Confirmar Pago
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar sesiones:", error);
  }
}

// ============ Utilidades ============
function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============ Marcar Pagada ============
async function marcarPagada(idSesion) {
  if (!confirm("¿Confirmar que el cliente realizó el pago?")) return;

  try {
    const res = await api.marcarPagada(idSesion);
    if (res.error) {
      alert(res.error);
      return;
    }
    cargarSinPagar();
  } catch (error) {
    alert("Error al procesar pago");
  }
}

// ============ Logout ============
document.getElementById("btnLogout").addEventListener("click", async () => {
  try {
    await api.logout();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error en logout:", error);
  }
});

// ============ Auto-refresh cada 10 segundos ============
setInterval(cargarDatos, 10000);
