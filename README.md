# KonradCheck

KonradCheck es una aplicación móvil institucional para registrar la asistencia a clases y reuniones de la Fundación Universitaria Konrad Lorenz. El sistema combina una app React Native con Expo, un backend Kotlin/Ktor y Cloud Firestore.

Cada estudiante dispone de un ticket temporal asociado a una reunión. La app genera un código QR rotativo y el personal docente o administrativo lo valida con la cámara. Las reglas de horario, vigencia y registro se verifican en el backend.

## Estado del proyecto

- Desarrollo académico para entorno local o de pruebas.
- Roles de estudiante y personal.
- Datos demo idempotentes en Firestore.
- Recuperación de contraseña por correo electrónico.
- Lectura de QR, reportes e historial de asistencia.
- Cambio de contraseña desde una sesión activa pendiente en la interfaz.

## Equipo

- Juan David Valero Vanegas
- Stiven Adolfo Rodriguez Martinez
- Juan Kamilo Chacon Arias

**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Proyecto:** KonradCheck — Grupo 8

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Aplicación móvil | React Native, Expo SDK 58, React Navigation |
| Cámara y almacenamiento | `expo-camera`, `expo-screen-capture`, `expo-secure-store`, `expo-sharing` |
| Backend | Kotlin 2.0, Ktor 3.0, Netty |
| Datos | Firebase Admin SDK y Cloud Firestore |
| Código QR | `qrcode-generator`, `js-sha256` |
| Recuperación por correo | API transaccional de Brevo |
| Pruebas backend | Kotlin Test y JUnit 5 |

## Funcionalidades

### Estudiante

- Inicio y cierre de sesión.
- Consulta de reuniones disponibles.
- Visualización de un ticket QR rotativo.
- Consulta del historial de asistencias.
- Recuperación de contraseña por correo.
- Consulta de perfil.

### Personal docente o administrativo

- Escaneo de tickets de asistencia.
- Vista de reportes por reunión.
- Consulta de estudiantes.
- Programación de reuniones y asignación de asistentes.
- Consulta de reuniones y perfil.

## Arquitectura

```text
KonradCheckApp  ->  API REST Kotlin/Ktor  ->  Cloud Firestore
     |                                            |
     |-- Expo/React Native                       |-- usuarios
     |-- Sesión segura con token                 |-- estudiantes/personal
     |-- QR firmado por la app                   |-- reuniones/inscripciones
     +-- Cámara en dispositivos compatibles      +-- sesiones/passwordResets
```

El teléfono conserva el token de sesión mediante almacenamiento seguro. El backend valida el token y los permisos para cada operación. Firestore es la fuente de verdad de perfiles, reuniones e asistencias.

## Requisitos previos

- Node.js compatible con Expo SDK 58: 22.13+, 24.3+ o 26+. No usar versiones impares como 23 o 25.
- npm.
- JDK 21.
- Cuenta de Firebase con una cuenta de servicio que tenga acceso a Firestore.
- Para ejecutar en iPhone: Expo Go y una cuenta de Expo.

## Configuración inicial

```powershell
git clone <URL_DEL_REPOSITORIO>
cd KonradCheck
```

### 1. Configurar el backend

Copia el JSON de la cuenta de servicio localmente:

```powershell
cd KonradCheckBackend
Copy-Item <RUTA_JSON> .\serviceAccountKey.json
.\gradlew.bat run
```

El archivo `serviceAccountKey.json` está ignorado por Git y no debe compartirse. El servidor queda disponible en `http://localhost:8080`.

Para usar una ruta distinta:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = "C:\ruta\serviceAccountKey.json"
```

Consulta [KonradCheckBackend/README.md](KonradCheckBackend/README.md) para las variables opcionales de correo, la API y el modelo de datos.

### 2. Configurar la aplicación

En otra terminal:

```powershell
cd KonradCheckApp
Copy-Item .env.example .env
npm install
npm start
```

El valor predeterminado de `KonradCheckApp/.env` es:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8080
```

En un dispositivo físico, reemplaza `localhost` por la dirección IPv4 del computador en la misma red Wi-Fi:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.25:8080
```

## Ejecutar en plataformas

```powershell
npm start          # Expo Developer Tools
npm run web        # Navegador
```

### iPhone con Expo Go

1. Instala Expo Go desde la App Store e inicia sesión en Expo.
2. Ejecuta `npx expo login` y `npm start` en el computador.
3. Conecta el iPhone a la misma Wi-Fi.
4. Escanea el QR de Expo con la cámara de iOS.
5. Permite el acceso a la red local si iOS lo solicita.

La cuenta de Expo debe coincidir con la sesión iniciada en Expo Go.

En Safari también puede abrirse `http://IP_DEL_COMPUTADOR:8081`, pero el navegador no habilita el escáner nativo ni el bloqueo de capturas de la aplicación.

## Cuentas demo

La contraseña predeterminada es `Konrad123`. Los botones **Estudiante** y **Docente** preparan los datos necesarios antes de iniciar sesión.

| Rol | Correo |
| --- | --- |
| Estudiante | `david.gomez@konradlorenz.edu.co` |
| Docente | `armando.casas@konradlorenz.edu.co` |

Los datos demo usan IDs y nombres deterministas. Al repetir la inicialización no se duplican reuniones o inscripciones y no se eliminan asistencias existentes.

## Prueba rápida

### Dos dispositivos

1. Inicia el backend y la app en dos dispositivos.
2. Abre sesión como estudiante y entra a **Mi QR**.
3. Abre sesión como personal y entra a **Escanear QR**.
4. Escanea el código vigente.
5. Consulta el reporte o el historial para verificar el registro.

### Un iPhone

1. Inicia sesión como docente.
2. Abre **Escanear QR** y activa el modo demostración.
3. Usa **Ticket** para enviar un código vigente o **Captura** para enviar uno vencido.
4. Cierra sesión y entra como estudiante para revisar el resultado.

### Dos pestañas del navegador

Es posible iniciar sesiones de estudiante y personal en pestañas separadas. El escáner web reconoce el ticket, aunque no ofrece todas las protecciones disponibles en Expo Go o una instalación nativa.

## Cómo funciona el ticket

1. Se crea una inscripción por estudiante y reunión.
2. El ticket se habilita 15 minutos antes del inicio y permanece asociado a la reunión.
3. La app genera un código cada 5 segundos:

   ```text
   KC1.<ticket>.<paso>.<HMAC-SHA256>
   ```

4. El backend valida firma, reunión, vigencia máxima de 10 segundos, horario y uso previo.
5. Los primeros 15 minutos de la reunión registran **Presente** y luego **Tardanza**.
6. Al terminar el evento, quien no se registró pasa de **Pendiente** a **Ausente**.

## Protección contra capturas

| Medida | App móvil | Navegador |
| --- | --- | --- |
| Código con vigencia máxima de 10 s | Sí | Sí |
| Bloqueo de capturas y grabación del sistema | Sí, con `expo-screen-capture` | No disponible |
| Código oculto al salir o perder el foco | Sí | Sí |
| Ocultamiento ante atajos de captura e impresión | No aplica | Sí, como disuasión |
| Franja animada y reloj para detectar imágenes estáticas | Sí | Sí |

Estas medidas reducen el riesgo de reutilización visual, pero no reemplazan controles de identidad o antifraude propios de una implementación de producción.

## Datos y estructura del proyecto

```text
.
├── KonradCheckApp/
│   ├── App.js
│   ├── context/             # Sesión y usuario autenticado
│   ├── hooks/               # Datos en vivo y protección de capturas
│   ├── services/            # API, QR, CSV, fechas y almacenamiento
│   ├── screens/
│   │   ├── noSesion/        # Login y recuperación
│   │   ├── conSesion/       # Estudiante, personal y perfil
│   │   └── components/      # Navegación e indicadores
│   └── docs/                # Plantilla CSV de asistentes
└── KonradCheckBackend/
    ├── src/main/kotlin/com/konradcheck/
    │   ├── routes/          # Endpoints REST
    │   ├── data/            # Acceso y reglas de Firestore
    │   ├── services/        # Entrega de correo
    │   ├── security/        # Hash de contraseñas
    │   └── domain/          # Reglas de asistencia
    └── src/test/            # Pruebas unitarias
```

## Pruebas

Ejecuta las pruebas del backend desde `KonradCheckBackend`:

```powershell
.\gradlew.bat test
```

Las pruebas actuales cubren las reglas de asistencia y el hash y migración de contraseñas.

## Problemas comunes

- **Expo Go solicita iniciar sesión:** ejecuta `npx expo whoami` y usa la misma cuenta en Expo Go.
- **El proyecto no es compatible:** actualiza Expo Go y ejecuta `npx expo install expo@latest --fix`.
- **El iPhone no conecta:** confirma que el teléfono y el computador estén en la misma Wi-Fi y permite **Red local**.
- **El backend no inicia:** verifica JDK 21 y que `serviceAccountKey.json` exista en `KonradCheckBackend` o se configure `FIREBASE_SERVICE_ACCOUNT_PATH`.
- **El dispositivo físico no alcanza la API:** reemplaza `localhost` por la IPv4 del computador y permite el puerto 8080 en el firewall.
- **El escáner web no lee:** permite acceso a la cámara y usa el navegador compatible; el modelo de cámara del dispositivo suele necesitar HTTPS o `localhost`.

## Limitaciones conocidas

- La pantalla de cambio de contraseña visible desde una sesión activa todavía no realiza la operación.
- El reinicio remoto de datos demo no está disponible.
- La configuración actual está orientada a pruebas locales y académicas, no a despliegue de producción.
- Los datos y secretos locales deben gestionarse fuera del repositorio.

## Licencia

Consulta [KonradCheckApp/LICENSE](KonradCheckApp/LICENSE) para conocer los términos de uso.
