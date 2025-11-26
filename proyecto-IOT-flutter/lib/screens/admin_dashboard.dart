import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../config/app_config.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../models/espacio.dart';
import '../models/metrica.dart';
import 'login_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  final ApiService _apiService = ApiService();
  List<Espacio> _espacios = [];
  Metrica? _metricas;
  List<MetricaTurno> _metricasTurno = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
    // Auto-refresh según configuración
    _setupAutoRefresh();
  }

  void _setupAutoRefresh() {
    Future.delayed(Duration(seconds: AppConfig.refreshIntervalAdmin), () {
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
    final metricas = await _apiService.getMetricas();
    final metricasTurno = await _apiService.getMetricasPorTurno();

    if (mounted) {
      setState(() {
        _espacios = espacios;
        _metricas = metricas;
        _metricasTurno = metricasTurno;
        _isLoading = false;
      });
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

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final usuario = authService.usuario;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Administración'),
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
                    // Métricas generales
                    _buildMetricasGrid(),
                    const SizedBox(height: 16),
                    // Métricas por turno
                    _buildMetricasTurno(),
                    const SizedBox(height: 16),
                    // Espacios
                    _buildEspacios(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildMetricasGrid() {
    final m = _metricas;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Total Sesiones',
          '${m?.totalSesiones ?? 0}',
          Colors.blue,
          Icons.receipt_long,
        ),
        _buildStatCard(
          'Pagadas',
          '${m?.pagadas ?? 0}',
          Colors.green,
          Icons.check_circle,
        ),
        _buildStatCard(
          'Pendientes',
          '${m?.pendientes ?? 0}',
          Colors.orange,
          Icons.pending,
        ),
        _buildStatCard(
          'Ingresos Totales',
          'S/ ${(m?.ingresosTotales ?? 0).toStringAsFixed(2)}',
          Colors.purple,
          Icons.attach_money,
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Card(
      color: color.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricasTurno() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Métricas por Turno',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (_metricasTurno.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text('Sin datos'),
              )
            else
              Table(
                children: [
                  const TableRow(
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.grey, width: 1),
                      ),
                    ),
                    children: [
                      Padding(
                        padding: EdgeInsets.all(8),
                        child: Text('Turno', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      Padding(
                        padding: EdgeInsets.all(8),
                        child: Text('Sesiones', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      Padding(
                        padding: EdgeInsets.all(8),
                        child: Text('Ingresos', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  ..._metricasTurno.map((t) => TableRow(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Text(t.nombreTurno.toUpperCase()),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Text('${t.sesiones}'),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Text(
                              'S/ ${t.ingresos.toStringAsFixed(2)}',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      )),
                ],
              ),
          ],
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
              'Estado Actual de Espacios',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
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
}

