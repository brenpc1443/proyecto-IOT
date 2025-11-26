import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../config/app_config.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../models/espacio.dart';
import '../models/sesion.dart';
import 'login_screen.dart';

class EncargadoDashboard extends StatefulWidget {
  const EncargadoDashboard({super.key});

  @override
  State<EncargadoDashboard> createState() => _EncargadoDashboardState();
}

class _EncargadoDashboardState extends State<EncargadoDashboard> {
  final ApiService _apiService = ApiService();
  List<Espacio> _espacios = [];
  List<Sesion> _sesionesSinPagar = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
    // Auto-refresh según configuración
    _setupAutoRefresh();
  }

  void _setupAutoRefresh() {
    Future.delayed(Duration(seconds: AppConfig.refreshIntervalEncargado), () {
      if (mounted) {
        _cargarDatos();
        _setupAutoRefresh(); // Programar siguiente refresh
      }
    });
  }

  Future<void> _cargarDatos() async {
    setState(() {
      _isLoading = true;
    });

    final espacios = await _apiService.getEspacios();
    final sesiones = await _apiService.getSesionesSinPagar();

    if (mounted) {
      setState(() {
        _espacios = espacios;
        _sesionesSinPagar = sesiones;
        _isLoading = false;
      });
    }
  }

  Future<void> _marcarPagada(int idSesion) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Pago'),
        content: const Text('¿Confirmar que el cliente realizó el pago?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final result = await _apiService.marcarPagada(idSesion);
      if (result['error'] == null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago registrado exitosamente')),
        );
        _cargarDatos();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${result['error'] ?? 'Error desconocido'}')),
        );
      }
    }
  }

  Future<void> _handleLogout() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    await authService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  String _formatearFecha(String? fecha) {
    if (fecha == null) return '-';
    try {
      final date = DateTime.parse(fecha);
      return DateFormat('dd/MM/yyyy HH:mm', 'es_PE').format(date);
    } catch (e) {
      return fecha;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final usuario = authService.usuario;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Encargado'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(
              child: Text(
                usuario?.nombreUsuario ?? '',
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Cerrar Sesión',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _cargarDatos,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Espacios
                    _buildEspacios(),
                    const SizedBox(height: 16),
                    // Sesiones pendientes
                    _buildSesionesSinPagar(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildEspacios() {
    final disponibles = _espacios.where((e) => e.isDisponible).length;
    final ocupados = _espacios.where((e) => e.isOcupado).length;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estado de Espacios',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Actualización automática desde sensores',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$disponibles disponibles · $ocupados ocupados',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _espacios.length,
              itemBuilder: (context, index) {
                final espacio = _espacios[index];
                return _buildEspacioCard(espacio);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEspacioCard(Espacio espacio) {
    final isDisponible = espacio.isDisponible;
    return Container(
      decoration: BoxDecoration(
        color: isDisponible ? Colors.green[50] : Colors.red[50],
        border: Border.all(
          color: isDisponible ? Colors.green : Colors.red,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '${espacio.numero}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDisponible ? Colors.green[700] : Colors.red[700],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            isDisponible ? 'Libre' : 'Ocupado',
            style: TextStyle(
              fontSize: 10,
              color: isDisponible ? Colors.green[700] : Colors.red[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSesionesSinPagar() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Sesiones Pendientes de Pago',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Vehículos que ya salieron y esperan confirmación de pago',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 16),
            if (_sesionesSinPagar.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16),
                child: Center(
                  child: Text(
                    'No hay sesiones pendientes de pago',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ..._sesionesSinPagar.map((sesion) => _buildSesionCard(sesion)),
          ],
        ),
      ),
    );
  }

  Widget _buildSesionCard(Sesion sesion) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: Colors.orange[50],
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Espacio ${sesion.numero ?? sesion.idEspacio}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    sesion.nombreTurno?.toUpperCase() ?? 'N/A',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.arrow_downward, size: 16, color: Colors.green),
                const SizedBox(width: 4),
                Text('Entrada: ${_formatearFecha(sesion.horaEntrada)}'),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.arrow_upward, size: 16, color: Colors.red),
                const SizedBox(width: 4),
                Text('Salida: ${_formatearFecha(sesion.horaSalida)}'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total: S/ ${(sesion.totalTarifa ?? 0).toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => _marcarPagada(sesion.idSesion),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Confirmar Pago'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

