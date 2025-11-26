# 🅿️ Estacionamiento Inteligente - App Flutter

Aplicación móvil Flutter para el sistema de estacionamiento inteligente.

## 📋 Requisitos Previos

- Flutter 3.38.3 o superior
- Dart 3.10.1 o superior
- Android Studio / VS Code con extensiones de Flutter
- El servidor Node.js debe estar corriendo (ver proyecto-IOT)

## 🚀 Instalación

1. **Navegar al directorio del proyecto Flutter:**
   ```bash
   cd proyecto-IOT-flutter
   ```

2. **Instalar dependencias:**
   ```bash
   flutter pub get
   ```

3. **Configurar la URL del servidor:**
   - Abre `lib/config/app_config.dart`
   - Cambia `baseUrl` según tu entorno:
     - **Emulador Android**: `http://10.0.2.2:3000/api`
     - **Emulador iOS**: `http://localhost:3000/api`
     - **Dispositivo físico**: `http://TU_IP_LOCAL:3000/api`

## 🔧 Configuración de Red

### Para Dispositivo Físico:

1. **Obtener tu IP local:**
   - **Windows**: Abre CMD y ejecuta `ipconfig`, busca "Dirección IPv4"
   - **Mac/Linux**: Ejecuta `ifconfig` o `ip addr` en Terminal

2. **Asegúrate de que:**
   - Tu dispositivo móvil y tu computadora estén en la misma red WiFi
   - El firewall permita conexiones en el puerto 3000
   - El servidor Node.js esté corriendo

3. **Actualizar la URL en `app_config.dart`:**
   ```dart
   static const String baseUrl = 'http://192.168.1.100:3000/api';
   ```

## 📱 Ejecutar la Aplicación

### Android:
```bash
flutter run
```

### iOS (solo en Mac):
```bash
flutter run
```

### Generar APK para Android:
```bash
flutter build apk --release
```

El APK se generará en: `build/app/outputs/flutter-apk/app-release.apk`

### Generar APK dividido (más pequeño):
```bash
flutter build apk --split-per-abi
```

### Generar App Bundle para Google Play:
```bash
flutter build appbundle --release
```

## 🏗️ Estructura del Proyecto

```
lib/
├── main.dart                 # Punto de entrada
├── config/
│   └── app_config.dart      # Configuración (URL del servidor)
├── models/                   # Modelos de datos
│   ├── usuario.dart
│   ├── espacio.dart
│   ├── sesion.dart
│   └── metrica.dart
├── services/                 # Servicios
│   ├── api_service.dart     # Comunicación con el backend
│   └── auth_service.dart    # Gestión de autenticación
└── screens/                  # Pantallas
    ├── login_screen.dart
    ├── admin_dashboard.dart
    └── encargado_dashboard.dart
```

## 🔐 Credenciales por Defecto

- **Encargado**: 
  - Usuario: `encargado`
  - Contraseña: `1234`

- **Administrador**: 
  - Usuario: `admin`
  - Contraseña: `1234`

## 📝 Características

### Pantalla de Login
- Autenticación de usuarios
- Validación de formularios
- Manejo de errores

### Dashboard de Administrador
- Métricas generales (sesiones, pagos, ingresos)
- Métricas por turno
- Vista de estado de espacios
- Auto-refresh cada 30 segundos

### Dashboard de Encargado
- Vista de estado de espacios
- Lista de sesiones pendientes de pago
- Confirmación de pagos
- Auto-refresh cada 10 segundos

## 🐛 Solución de Problemas

### Error de conexión al servidor:
1. Verifica que el servidor Node.js esté corriendo
2. Verifica la URL en `app_config.dart`
3. Para dispositivo físico, asegúrate de estar en la misma red WiFi
4. Verifica el firewall

### Error al generar APK:
```bash
flutter clean
flutter pub get
flutter build apk --release
```

### Problemas con permisos de red (Android):
El archivo `android/app/src/main/AndroidManifest.xml` ya incluye los permisos necesarios.

## 📦 Dependencias Principales

- `http`: Para peticiones HTTP al backend
- `shared_preferences`: Para almacenar sesión local
- `provider`: Para gestión de estado
- `intl`: Para formateo de fechas

## 🔄 Actualizaciones Futuras

- Notificaciones push
- Modo offline
- Sincronización automática
- Mejoras de UI/UX

## 📄 Licencia

Este proyecto es parte del sistema de estacionamiento inteligente para IoT.

