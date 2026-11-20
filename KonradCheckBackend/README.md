# KonradCheck Backend

Backend Kotlin/Ktor para la app, conectado a Cloud Firestore por Firebase Admin SDK.

## Requisitos

- JDK 21
- Una cuenta de servicio local con acceso a Firestore

## Preparar y ejecutar en Windows

1. Copia el JSON de cuenta de servicio a `KonradCheckBackend/serviceAccountKey.json`. El archivo se ignora en Git y no debe compartirse.
2. Desde esta carpeta, ejecuta:

   ```powershell
   .\gradlew.bat run
   ```

El servidor escucha en `0.0.0.0:8080` para aceptar conexiones de la máquina local y de la red Wi-Fi. Para probarlo desde un dispositivo físico, permite el puerto en la red local y usa la IP del computador en la configuración de la app.

El único ajuste opcional del backend es `FIREBASE_SERVICE_ACCOUNT_PATH`, si el JSON está en una ubicación distinta. El proyecto de Firebase se obtiene de las credenciales.

## Colecciones y relaciones

Firestore guarda referencias por ID y el backend valida los documentos enlazados:

| Colección | Contenido y relación |
| --- | --- |
| `usuarios` | Perfil común, correo, rol y hash de contraseña para las cuentas con acceso. |
| `estudiantes` | Perfil 1:1 con `usuarios` (`usuarioId`); guarda `codigo` y `programaId`. Un estudiante puede no tener inscripciones. |
| `personal` | Perfil 1:1 con `usuarios`; especifica tipo docente/administrativo y área. |
| `programas` | Carrera/programa con varias asignaturas y estudiantes (1:N). |
| `asignaturas` | Pertenece a un programa (N:1); una reunión tipo clase la referencia. |
| `reuniones` | Cada evento tiene un `docenteId`; una clase referencia asignatura/programa. Una reunión general no exige asignatura. |
| `inscripciones` | Une estudiantes y reuniones (N:M); incluye ticket, estado y hora de asistencia. La clave determinista evita duplicar la pareja. |
| `sesiones` | Token de la sesión emitida al iniciar sesión y `usuarioId`. |
| `passwordResets` | Retos temporales de recuperación, identificados por correo hasheado; almacena el hash del código, intentos y vencimiento, nunca el código en claro. |

Así, una clase siempre tiene docente, una asistencia siempre apunta a una reunión y estudiante existentes, y las filas de la plantilla CSV se resuelven a perfiles existentes antes de crear inscripciones.

## API principal

- `POST /demo/cuentas/estudiante` o `POST /demo/cuentas/docente`: asegura los datos demo y devuelve las credenciales de la cuenta pedida.
- `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- `POST /auth/password-reset/request`: solicita el envío de un código de recuperación al correo asociado.
- `POST /auth/password-reset/confirm`: valida el código y establece una nueva contraseña.
- `GET /reuniones`, `POST /reuniones`, `GET /reuniones/{id}/reporte`
- `GET /reuniones/{id}/ticket`, `POST /reuniones/{id}/asistencias/escanear`
- `GET /reuniones/{id}/tickets-pendientes`
- `GET /estudiantes`, `GET /estudiantes/me/historial`

La inicialización demo usa IDs fijos: repetirla no duplica personas, reuniones ni inscripciones y conserva las asistencias ya escaneadas. Al pedir una cuenta demo, su contraseña se restablece a `Konrad123`; para probar recuperación, no vuelvas a pulsar el botón de cuenta demo antes de iniciar sesión con la nueva contraseña. La hora de la reunión activa se actualiza al inicio de la hora local vigente y termina dos horas después.

## Recuperación de contraseña

El flujo envía por correo un código numérico de un solo uso. Vence en 10 minutos, permite hasta cinco intentos y limita los reenvíos por correo a uno por minuto. Al cambiar la contraseña se invalidan las sesiones existentes. La API devuelve el mismo mensaje para cuentas que existen y que no existen.

El envío usa la API de correo transaccional de Brevo. Su plan gratuito se anuncia sin tarjeta de crédito, sujeto a las condiciones y límites vigentes del proveedor. Crea una cuenta, verifica una dirección de remitente y configura estas variables **solo en el entorno del backend**:

```powershell
$env:BREVO_API_KEY = "<clave API>"
$env:BREVO_SENDER_EMAIL = "<remitente verificado>"
$env:BREVO_SENDER_NAME = "KonradCheck"
.\gradlew.bat run
```

La app no necesita ni recibe la clave de Brevo. No guardes las credenciales en el repositorio ni las compartas. El hash de las contraseñas nuevas usa PBKDF2-HMAC-SHA256; los hashes SHA-256 existentes se aceptan durante el inicio de sesión y se actualizan al formato nuevo después de autenticar correctamente.

Esta versión es para pruebas académicas locales, no para producción. El cambio de contraseña desde una sesión activa y el reinicio remoto de datos demo siguen pendientes.
