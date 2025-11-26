# 📱 Guía para Generar el APK

## Pasos para Generar el APK de la Aplicación

### 1. Preparación del Entorno

Asegúrate de tener instalado:
- Flutter 3.38.3 o superior
- Android SDK (a través de Android Studio)
- Java JDK 8 o superior

Verifica la instalación:
```bash
flutter doctor
```

### 2. Configurar la URL del Servidor

**IMPORTANTE**: Antes de generar el APK, configura la URL del servidor en:
```
lib/config/app_config.dart
```

Para dispositivo físico, usa tu IP local:
```dart
static const String baseUrl = 'http://192.168.1.100:3000/api';
```

### 3. Instalar Dependencias

```bash
cd proyecto-IOT-flutter
flutter pub get
```

### 4. Verificar que el Proyecto Compila

```bash
flutter analyze
```

### 5. Generar el APK

#### Opción A: APK Único (Recomendado para pruebas)
```bash
flutter build apk --release
```

El APK se generará en:
```
build/app/outputs/flutter-apk/app-release.apk
```

#### Opción B: APK Dividido por Arquitectura (Más pequeño)
```bash
flutter build apk --split-per-abi --release
```

Esto generará 3 APKs más pequeños:
- `app-armeabi-v7a-release.apk` (32-bit)
- `app-arm64-v8a-release.apk` (64-bit, más común)
- `app-x86_64-release.apk` (emuladores)

### 6. Instalar el APK en tu Dispositivo

#### Método 1: USB (ADB)
```bash
flutter install
```

O manualmente:
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

#### Método 2: Transferir el archivo
1. Copia el APK a tu dispositivo Android
2. Abre el archivo en tu dispositivo
3. Permite la instalación de fuentes desconocidas si es necesario
4. Instala la aplicación

### 7. Generar App Bundle para Google Play Store

Si planeas publicar en Google Play:
```bash
flutter build appbundle --release
```

El archivo se generará en:
```
build/app/outputs/bundle/release/app-release.aab
```

## 🔧 Solución de Problemas

### Error: "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk --release
```

### Error: "SDK not found"
1. Abre Android Studio
2. Ve a Tools > SDK Manager
3. Instala Android SDK Platform-Tools
4. Configura la variable de entorno ANDROID_HOME

### Error: "Signing config not found"
El APK de release se firma automáticamente con una clave de debug para pruebas.
Para producción, necesitas configurar una keystore (ver documentación de Flutter).

### El APK no se conecta al servidor
1. Verifica que el servidor Node.js esté corriendo
2. Verifica la URL en `app_config.dart`
3. Asegúrate de que el dispositivo y la computadora estén en la misma red WiFi
4. Verifica el firewall de Windows

## 📋 Checklist Pre-APK

- [ ] URL del servidor configurada correctamente
- [ ] `flutter pub get` ejecutado sin errores
- [ ] `flutter analyze` sin errores críticos
- [ ] Servidor Node.js corriendo y accesible
- [ ] Dispositivo y servidor en la misma red (si es dispositivo físico)

## 🚀 Optimizaciones

### Reducir el tamaño del APK:
```bash
flutter build apk --release --split-per-abi
```

### Habilitar ProGuard (reduce más el tamaño):
Edita `android/app/build.gradle` y agrega:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

## 📝 Notas Importantes

1. **Para producción**: Necesitas configurar un keystore de firma
2. **URL del servidor**: Debe ser accesible desde el dispositivo
3. **Permisos de Internet**: Ya están configurados en AndroidManifest.xml
4. **HTTP Cleartext**: Habilitado para desarrollo (cambiar a HTTPS en producción)

## 🎯 Próximos Pasos

1. Probar el APK en diferentes dispositivos
2. Configurar un keystore para firma de producción
3. Considerar usar HTTPS en lugar de HTTP
4. Implementar actualizaciones OTA (Over-The-Air) si es necesario

