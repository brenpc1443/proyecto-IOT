# 🚀 Inicio Rápido - App Flutter

## ✅ Proyecto Creado Exitosamente

Tu aplicación Flutter está lista para compilar y generar el APK.

## 📁 Estructura Creada

```
proyecto-IOT-flutter/
├── lib/
│   ├── main.dart                    ✅ Punto de entrada
│   ├── config/
│   │   └── app_config.dart          ✅ Configuración (URL servidor)
│   ├── models/                      ✅ Modelos de datos
│   ├── services/                    ✅ Servicios API y Auth
│   └── screens/                     ✅ Pantallas (Login, Dashboards)
├── android/                         ✅ Configuración Android
├── pubspec.yaml                     ✅ Dependencias
├── README.md                        ✅ Documentación completa
└── GUIA_APK.md                      ✅ Guía para generar APK
```

## 🎯 Pasos Inmediatos

### 1. Instalar Dependencias
```bash
cd proyecto-IOT-flutter
flutter pub get
```

### 2. Configurar URL del Servidor
Edita `lib/config/app_config.dart`:

**Para emulador Android:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

**Para dispositivo físico:**
```dart
static const String baseUrl = 'http://TU_IP_LOCAL:3000/api';
```
*(Reemplaza TU_IP_LOCAL con tu IP, ejemplo: 192.168.1.100)*

### 3. Probar en Emulador/Dispositivo
```bash
flutter run
```

### 4. Generar APK
```bash
flutter build apk --release
```

El APK estará en: `build/app/outputs/flutter-apk/app-release.apk`

## 🔑 Credenciales

- **Encargado**: `encargado` / `1234`
- **Admin**: `admin` / `1234`

## ⚠️ Importante

1. **Asegúrate de que el servidor Node.js esté corriendo** antes de probar la app
2. **Para dispositivo físico**: Ambos (dispositivo y servidor) deben estar en la misma red WiFi
3. **Firewall**: Permite conexiones en el puerto 3000

## 📚 Documentación

- **README.md**: Documentación completa del proyecto
- **GUIA_APK.md**: Guía detallada para generar el APK

## 🐛 Problemas Comunes

### No se conecta al servidor
- Verifica la URL en `app_config.dart`
- Verifica que el servidor esté corriendo
- Verifica el firewall

### Error al compilar
```bash
flutter clean
flutter pub get
flutter build apk --release
```

## ✨ Características Implementadas

✅ Login con autenticación  
✅ Dashboard de Administrador con métricas  
✅ Dashboard de Encargado con gestión de pagos  
✅ Vista de espacios en tiempo real  
✅ Auto-refresh automático  
✅ Diseño moderno y responsive  
✅ Manejo de errores  
✅ Persistencia de sesión  

## 🎉 ¡Listo para Usar!

Tu aplicación está completa y lista para generar el APK. Sigue los pasos arriba y estarás listo para instalar la app en tu dispositivo Android.

