class Metrica {
  final int totalSesiones;
  final int pagadas;
  final int pendientes;
  final double ingresosTotales;

  Metrica({
    required this.totalSesiones,
    required this.pagadas,
    required this.pendientes,
    required this.ingresosTotales,
  });

  factory Metrica.fromJson(Map<String, dynamic> json) {
    return Metrica(
      totalSesiones: json['total_sesiones'] ?? 0,
      pagadas: json['pagadas'] ?? 0,
      pendientes: json['pendientes'] ?? 0,
      ingresosTotales: json['ingresos_totales'] != null
          ? (json['ingresos_totales'] is int
              ? json['ingresos_totales'].toDouble()
              : json['ingresos_totales'])
          : 0.0,
    );
  }
}

class MetricaTurno {
  final String nombreTurno;
  final int sesiones;
  final double ingresos;

  MetricaTurno({
    required this.nombreTurno,
    required this.sesiones,
    required this.ingresos,
  });

  factory MetricaTurno.fromJson(Map<String, dynamic> json) {
    return MetricaTurno(
      nombreTurno: json['nombre_turno'] ?? '',
      sesiones: json['sesiones'] ?? 0,
      ingresos: json['ingresos'] != null
          ? (json['ingresos'] is int
              ? json['ingresos'].toDouble()
              : json['ingresos'])
          : 0.0,
    );
  }
}

