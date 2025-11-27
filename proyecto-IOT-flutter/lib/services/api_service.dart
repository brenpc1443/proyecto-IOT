import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/usuario.dart';
import '../models/espacio.dart';
import '../models/sesion.dart';
import '../models/metrica.dart';

class ApiService {
  static const String baseUrl = AppConfig.baseUrl;
  
  // Cliente HTTP con cookies persistentes
  static final http.Client _client = http.Client();
  
  // Almacenamiento manual de cookies
  static String? _sessionCookie;

  // Headers con cookies
  Map<String, String> get headers {
    final h = {
      'Content-Type': 'application/json',
    };
    
    if (_sessionCookie != null) {
      h['Cookie'] = _sessionCookie!;
    }
    
    return h;
  }

  // Guardar cookies de la respuesta
  void _saveCookies(http.Response response) {
    final rawCookie = response.headers['set-cookie'];
    if (rawCookie != null) {
      _sessionCookie = rawCookie.split(';')[0];
      print('[DEBUG] Cookie guardada: $_sessionCookie');
    }
  }

  // ============ Auth ============
  Future<Map<String, dynamic>> login(String nombreUsuario, String contrasena) async {
    try {
      print('[DEBUG] Intentando login...');
      final response = await _client.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nombre_usuario': nombreUsuario,
          'contraseña': contrasena,
        }),
      );

      print('[DEBUG] Status login: ${response.statusCode}');
      print('[DEBUG] Response: ${response.body}');
      
      // Guardar cookies de sesión
      _saveCookies(response);

      return jsonDecode(response.body);
    } catch (e) {
      print('[ERROR] Login error: $e');
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> logout() async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: headers,
      );
      
      // Limpiar cookies
      _sessionCookie = null;
      
      return jsonDecode(response.body);
    } catch (e) {
      return {'error': 'Error de conexión: $e'};
    }
  }

  Future<Usuario?> getUsuarioActual() async {
    try {
      print('[DEBUG] Verificando usuario actual...');
      print('[DEBUG] Cookie actual: $_sessionCookie');
      
      final response = await _client.get(
        Uri.parse('$baseUrl/auth/usuario-actual'),
        headers: headers,
      );

      print('[DEBUG] Status usuario-actual: ${response.statusCode}');
      print('[DEBUG] Response: ${response.body}');

      if (response.statusCode == 200) {
        return Usuario.fromJson(jsonDecode(response.body));
      }
      return null;
    } catch (e) {
      print('[ERROR] getUsuarioActual error: $e');
      return null;
    }
  }

  // ============ Espacios ============
  Future<List<Espacio>> getEspacios() async {
    try {
      print('[DEBUG] Obteniendo espacios...');
      final response = await _client.get(
        Uri.parse('$baseUrl/espacios'),
        headers: headers,
      );

      print('[DEBUG] Status espacios: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Espacio.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        print('[ERROR] No autenticado - espacios');
      }
      return [];
    } catch (e) {
      print('[ERROR] getEspacios error: $e');
      return [];
    }
  }

  // ============ Sesiones ============
  Future<Map<String, dynamic>> registrarEntrada(int idEspacio) async {
    try {
      final response = await _client.post(
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
      final response = await _client.put(
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
      print('[DEBUG] Obteniendo sesiones sin pagar...');
      final response = await _client.get(
        Uri.parse('$baseUrl/sesiones/sin-pagar'),
        headers: headers,
      );

      print('[DEBUG] Status sin-pagar: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Sesion.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        print('[ERROR] No autenticado - sin-pagar');
      }
      return [];
    } catch (e) {
      print('[ERROR] getSesionesSinPagar error: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> marcarPagada(int idSesion) async {
    try {
      final response = await _client.put(
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
      print('[DEBUG] Obteniendo métricas...');
      final response = await _client.get(
        Uri.parse('$baseUrl/metricas'),
        headers: headers,
      );

      print('[DEBUG] Status métricas: ${response.statusCode}');

      if (response.statusCode == 200) {
        return Metrica.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 401) {
        print('[ERROR] No autenticado - métricas');
      }
      return null;
    } catch (e) {
      print('[ERROR] getMetricas error: $e');
      return null;
    }
  }

  Future<List<MetricaTurno>> getMetricasPorTurno() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/metricas/turno'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => MetricaTurno.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        print('[ERROR] No autenticado - métricas turno');
      }
      return [];
    } catch (e) {
      print('[ERROR] getMetricasPorTurno error: $e');
      return [];
    }
  }
  
  // Limpiar cliente
  void dispose() {
    _client.close();
  }
}