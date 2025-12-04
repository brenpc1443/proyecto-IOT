// ============ Login ============
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const alertDiv = document.getElementById('alert');
    
    // Ocultar alerta previa
    alertDiv.style.display = 'none';
    
    try {
      const data = await api.login(usuario, password);
      
      if (data.error) {
        alertDiv.textContent = data.error;
        alertDiv.style.display = 'block';
        return;
      }
      
      // Redirigir según rol
      if (data.usuario.rol === 'administrador') {
        window.location.href = 'dashboard-admin.html';
      } else {
        window.location.href = 'dashboard-encargado.html';
      }
      
    } catch (error) {
      alertDiv.textContent = 'Error de conexión. Intente nuevamente.';
      alertDiv.style.display = 'block';
    }
  });
  
  // Verificar si ya está logueado
  (async () => {
    const usuario = await api.getUsuarioActual();
    if (usuario) {
      if (usuario.rol === 'administrador') {
        window.location.href = 'dashboard-admin.html';
      } else {
        window.location.href = 'dashboard-encargado.html';
      }
    }
  })();