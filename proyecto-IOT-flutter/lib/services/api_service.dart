import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/usuario.dart';
import '../models/espacio.dart';
import '../models/sesion.dart';
import '../models/metrica.dart';

class ApiService {
  static const String baseUrl = AppConfig.baseUrl;

  // Headers comunes
  Map<String, String> get headers => {
        'Content-Type': 'application/json',
      };

  // ============ Auth ============
  Future<Map<String, dynamic>> login(String nombreUsuario, String contrasena) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: headers,
        body: jsonEncode({
          'nombre_usuario': nombreUsuario,
          'contraseña': contrasena,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> logout() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: headers,
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<Usuario?> getUsuarioActual() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/usuario-actual'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return Usuario.fromJson(jsonDecode(response.body));
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ============ Espacios ============
  Future<List<Espacio>> getEspacios() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/espacios'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Espacio.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // ============ Sesiones ============
  Future<Map<String, dynamic>> registrarEntrada(int idEspacio) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sesiones/entrada'),
        headers: headers,
        body: jsonEncode({'id_espacio': idEspacio}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> registrarSalida(int idSesion) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/sesiones/$idSesion/salida'),
        headers: headers,
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<List<Sesion>> getSesionesSinPagar() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sesiones/sin-pagar'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Sesion.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>> marcarPagada(int idSesion) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/sesiones/$idSesion/pagar'),
        headers: headers,
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  // ============ Métricas ============
  Future<Metrica?> getMetricas() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/metricas'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return Metrica.fromJson(jsonDecode(response.body));
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<List<MetricaTurno>> getMetricasPorTurno() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/metricas/turno'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => MetricaTurno.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}

