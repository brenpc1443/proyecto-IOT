class Usuario {
  final int idUsuario;
  final String nombreUsuario;
  final String rol;

  Usuario({
    required this.idUsuario,
    required this.nombreUsuario,
    required this.rol,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      idUsuario: json['id_usuario'] ?? json['idUsuario'],
      nombreUsuario: json['nombre_usuario'] ?? json['nombreUsuario'],
      rol: json['rol'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_usuario': idUsuario,
      'nombre_usuario': nombreUsuario,
      'rol': rol,
    };
  }
}

