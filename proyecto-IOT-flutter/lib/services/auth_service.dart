import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  Usuario? _usuario;
  bool _isLoading = false;

  Usuario? get usuario => _usuario;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _usuario != null;

  AuthService() {
    _loadUsuario();
  }

  Future<void> _loadUsuario() async {
    final prefs = await SharedPreferences.getInstance();
    final usuarioJson = prefs.getString('usuario');
    if (usuarioJson != null) {
      // Intentar obtener usuario actual del servidor
      _usuario = await _apiService.getUsuarioActual();
      notifyListeners();
    }
  }

  Future<bool> login(String nombreUsuario, String contrasena) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.login(nombreUsuario, contrasena);

      if (response['error'] != null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      if (response['usuario'] != null) {
        _usuario = Usuario.fromJson(response['usuario']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('usuario', nombreUsuario);
        await prefs.setString('rol', _usuario!.rol);
        await prefs.setInt('id_usuario', _usuario!.idUsuario);
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.logout();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('usuario');
    await prefs.remove('rol');
    await prefs.remove('id_usuario');
    _usuario = null;
    notifyListeners();
  }
}

