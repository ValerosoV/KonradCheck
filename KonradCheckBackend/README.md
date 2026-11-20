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

Así, una clase siempre tiene docente, una asistencia siempre apunta a una reunión y estudiante existentes, y las filas de la plantilla CSV se resuelven a perfiles existentes antes de crear inscripciones.

## API principal

- `POST /demo/cuentas/estudiante` o `POST /demo/cuentas/docente`: asegura los datos demo y devuelve las credenciales de la cuenta pedida.
- `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- `GET /reuniones`, `POST /reuniones`, `GET /reuniones/{id}/reporte`
- `GET /reuniones/{id}/ticket`, `POST /reuniones/{id}/asistencias/escanear`
- `GET /reuniones/{id}/tickets-pendientes`
- `GET /estudiantes`, `GET /estudiantes/me/historial`

La inicialización demo usa IDs fijos: repetirla no duplica personas, reuniones ni inscripciones y conserva las asistencias ya escaneadas. La hora de la reunión activa se actualiza al inicio de la hora local vigente y termina dos horas después.

Esta versión es para pruebas académicas locales, no para producción. La recuperación/cambio de contraseña y el reinicio remoto de datos demo quedan pendientes.
