class Espacio {
  final int idEspacio;
  final int numero;
  final String estado;

  Espacio({
    required this.idEspacio,
    required this.numero,
    required this.estado,
  });

  factory Espacio.fromJson(Map<String, dynamic> json) {
    return Espacio(
      idEspacio: json['id_espacio'] ?? json['idEspacio'],
      numero: json['numero'],
      estado: json['estado'],
    );
  }

  bool get isDisponible => estado == 'disponible';
  bool get isOcupado => estado == 'ocupado';
}

