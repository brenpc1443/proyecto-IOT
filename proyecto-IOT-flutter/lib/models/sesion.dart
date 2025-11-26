class Sesion {
  final int idSesion;
  final int idEspacio;
  final int idTurno;
  final String horaEntrada;
  final String? horaSalida;
  final double? totalTarifa;
  final bool pago;
  final int? numero; // Número del espacio (de JOIN)
  final String? nombreTurno; // Nombre del turno (de JOIN)

  Sesion({
    required this.idSesion,
    required this.idEspacio,
    required this.idTurno,
    required this.horaEntrada,
    this.horaSalida,
    this.totalTarifa,
    required this.pago,
    this.numero,
    this.nombreTurno,
  });

  factory Sesion.fromJson(Map<String, dynamic> json) {
    return Sesion(
      idSesion: json['id_sesion'] ?? json['idSesion'],
      idEspacio: json['id_espacio'] ?? json['idEspacio'],
      idTurno: json['id_turno'] ?? json['idTurno'],
      horaEntrada: json['hora_entrada'] ?? json['horaEntrada'],
      horaSalida: json['hora_salida'] ?? json['horaSalida'],
      totalTarifa: json['total_tarifa'] != null
          ? (json['total_tarifa'] is int
              ? json['total_tarifa'].toDouble()
              : json['total_tarifa'])
          : null,
      pago: json['pago'] == 1 || json['pago'] == true,
      numero: json['numero'],
      nombreTurno: json['nombre_turno'] ?? json['nombreTurno'],
    );
  }
}

