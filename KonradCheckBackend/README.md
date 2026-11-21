# KonradCheck Backend

API REST construida con Kotlin y Ktor. Usa Firebase Admin SDK para conectarse a Cloud Firestore con una cuenta de servicio.

## Requisitos

- JDK 21.
- Cuenta de servicio de Firebase con permisos sobre Firestore.
- JSON de cuenta de servicio disponible localmente.

## Ejecutar en Windows

Coloca el JSON en `KonradCheckBackend/serviceAccountKey.json`:

```powershell
Copy-Item <RUTA_JSON> .\serviceAccountKey.json
.\gradlew.bat run
```

El servidor escucha en `0.0.0.0:8080`. El archivo de credenciales está ignorado por Git y no debe compartirse.

También puede configurarse otra ruta:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = "C:\ruta\serviceAccountKey.json"
.\gradlew.bat run
```

El proyecto de Firebase se toma de las credenciales de la cuenta de servicio.

## Configuración de correo

La recuperación de contraseña usa la API transaccional de Brevo. Sin configuración, una solicitud válida no podrá entregar el código.

```powershell
$env:BREVO_API_KEY = "<clave API>"
$env:BREVO_SENDER_EMAIL = "<remitente verificado>"
$env:BREVO_SENDER_NAME = "KonradCheck"
.\gradlew.bat run
```

`BREVO_SENDER_NAME` es opcional. Nunca guardes claves o credenciales en el repositorio.

## Colecciones de Firestore

| Colección | Contenido |
| --- | --- |
| `usuarios` | Nombre, correo, rol, área y hash de contraseña. |
| `estudiantes` | Perfil asociado a `usuarios`; contiene código y programa. |
| `personal` | Perfil asociado a `usuarios`; contiene tipo y área laboral. |
| `programas` | Carreras o programas académicos. |
| `asignaturas` | Materias pertenecientes a un programa. |
| `reuniones` | Clases o reuniones con docente, horario y ubicación. |
| `inscripciones` | Relación estudiante-reunión, ticket y estado de asistencia. |
| `sesiones` | Token activo y usuario asociado. |
| `passwordResets` | Solicitudes de recuperación: correo hasheado, hash del código, vencimiento e intentos. |

Las operaciones importantes validan las referencias, roles y estados antes de modificar los datos.

## API principal

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Comprobación de disponibilidad. |
| `POST` | `/demo/cuentas/{estudiante\|docente}` | Prepara datos demo y devuelve credenciales. |
| `POST` | `/auth/login` | Inicia sesión y crea un token. |
| `GET` | `/auth/me` | Devuelve el usuario asociado al token. |
| `POST` | `/auth/logout` | Invalida el token actual. |
| `POST` | `/auth/password-reset/request` | Solicita un código de recuperación. |
| `POST` | `/auth/password-reset/confirm` | Valida el código y cambia la contraseña. |
| `GET` | `/reuniones` | Lista reuniones según el rol. |
| `POST` | `/reuniones` | Programa una reunión. |
| `GET` | `/reuniones/{id}/reporte` | Devuelve asistencia y resumen de una reunión. |
| `GET` | `/reuniones/{id}/ticket` | Obtiene el secreto y estado del ticket del estudiante. |
| `POST` | `/reuniones/{id}/asistencias/escanear` | Valida y registra un código QR. |
| `GET` | `/reuniones/{id}/tickets-pendientes` | Lista tickets disponibles para demostración. |
| `GET` | `/estudiantes` | Lista estudiantes disponibles para personal. |
| `GET` | `/estudiantes/me/historial` | Devuelve el historial del estudiante autenticado. |

Todas las rutas privadas esperan `Authorization: Bearer <token>`. Los errores de entrada, autenticación, permisos y registros inexistentes usan respuestas JSON y códigos HTTP adecuados.

## Datos demo

La inicialización usa IDs deterministas y prepara perfiles, docentes, estudiantes y reuniones. Ejecutarla varias veces no duplica inscripciones ni elimina asistencias existentes.

- La reunión activa se desplaza a la hora local actual y dura dos horas.
- Su ventana de ticket abre 15 minutos antes del inicio.
- La contraseña demo es `Konrad123`.
- La ruta demo restablece la contraseña de la cuenta solicitada. Después de usarla, no debe volver a ejecutarse si ya se cambió la contraseña por recuperación.

## Recuperación de contraseña

El flujo envía un código numérico de un solo uso:

- Vencimiento: 10 minutos.
- Intentos máximos: 5.
- Reenvío limitado a una solicitud por minuto y correo.
- Al restablecer la contraseña se eliminan las sesiones existentes.
- Las solicitudes usan una respuesta uniforme para cuentas existentes y no existentes.

Las contraseñas nuevas se almacenan con PBKDF2-HMAC-SHA256. Los hashes legacy SHA-256 siguen funcionando en el inicio de sesión y se migran automáticamente al autenticarse correctamente.

## Validación de asistencia

El ticket tiene este formato:

```text
KC1.<ticket>.<paso>.<HMAC-SHA256>
```

El escaneo verifica:

1. Token de sesión y permisos del usuario.
2. Existencia de reunión e inscripción.
3. Validez de la firma HMAC.
4. Pasos dentro de la ventana temporal máxima de 10 segundos.
5. Apertura y cierre de la ventana de escaneo.
6. Uso previo del ticket.

Las reglas clasifican la asistencia como presente durante los primeros 15 minutos, tardanza después y ausente al finalizar si no existe registro.

## Pruebas

Desde esta carpeta:

```powershell
.\gradlew.bat test
```

Las pruebas cubren:

- Ventana actual de reuniones.
- Apertura y cierre de la ventana de tickets.
- Generación determinista de IDs de inscripción.
- Derivación de estados de asistencia.
- Hash, verificación y migración de contraseñas.

## Limitaciones conocidas

- No existe un endpoint activo para cambiar contraseña desde una sesión iniciada; la pantalla de la app muestra un aviso pendiente.
- No existe reinicio remoto de datos demo.
- CORS está habilitado para cualquier origen.
- La configuración está orientada a demostraciones locales y académicas, no a producción.
