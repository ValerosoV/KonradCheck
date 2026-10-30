# KonradCheck

Aplicación móvil institucional para registrar la asistencia a clases y reuniones de la Fundación Universitaria Konrad Lorenz. Funciona como la boleta digital de un concierto: cada estudiante tiene un ticket por clase, su QR cambia cada 5 segundos y solo se registra quien lo muestra en vivo desde la app ante el escáner del salón.

> **Estado del proyecto:** frontend funcional con datos de prueba. Aún no hay backend: todos los datos son ficticios y se guardan en cada dispositivo.

## Equipo

- Juan David Valero Vanegas
- Stiven Adolfo Rodriguez Martinez
- Juan Kamilo Chacon Arias

**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Proyecto:** KonradCheck — Grupo 8

## Requisitos previos

- Node.js 22.13+, 24.3+ o 26+, según lo exige Expo SDK 58. Las versiones impares, como 23 y 25, no son compatibles.
- npm, incluido con Node.js.
- Para el iPhone: Expo Go de la App Store y una cuenta gratuita de Expo.

## Instalar y ejecutar

```bash
git clone <URL_DEL_REPOSITORIO>
cd KonradCheck/KonradCheckApp
npm install
npm start
```

Para abrirla en el navegador usa `npm run web` y el modo responsive para verla como celular.

## Ver la app en un iPhone

1. Instala **Expo Go** desde la App Store y crea una cuenta gratuita en [expo.dev/signup](https://expo.dev/signup).
2. En el computador, dentro de `KonradCheckApp`, inicia sesión y arranca el proyecto:

   ```bash
   npx expo login
   npm start
   ```

3. En el iPhone, abre Expo Go, toca el ícono de cuenta (arriba a la derecha) e inicia sesión **con la misma cuenta**. Expo Go lo exige en iPhones físicos.
4. Conecta el iPhone a la misma Wi-Fi del computador y escanea con la app **Cámara** el QR de la terminal. Si pregunta por la red local, permite el acceso.

**Sin instalar nada:** abre en Safari `http://IP_DEL_COMPUTADOR:8081` mientras corre `npm run web`. Sirve para ver todas las pantallas, pero no el escáner con cámara (Safari solo la permite en `https`) ni el bloqueo de capturas.

## Cuentas de prueba

La contraseña de todas es `Konrad123`. En la pantalla de inicio hay botones que llenan las dos primeras.

| Rol | Correo |
| --- | --- |
| Estudiante | `david.gomez@konradlorenz.edu.co` |
| Docente | `armando.casas@konradlorenz.edu.co` |
| Estudiante (segundo) | `maria.restrepo@konradlorenz.edu.co` |
| Administrativo (ve todas las reuniones) | `paula.medina@konradlorenz.edu.co` |

## Cómo probar el flujo

**En un solo iPhone:** entra como docente, ve a **Escanear QR** y despliega **Modo demostración**. «Ticket» envía un código vigente y «Captura» uno vencido, que se rechaza. Al cerrar sesión y entrar como ese estudiante, ya aparece registrado.

**Con dos dispositivos:** uno muestra el ticket como estudiante y el otro lo escanea como docente. El escáner valida el QR y registra la asistencia, pero **solo en el dispositivo que escanea**: sin backend, el celular del estudiante no se entera y sigue mostrando su ticket.

**En un mismo navegador:** abre dos pestañas, una como estudiante y otra como docente. Comparten los datos, así que el ticket cambia solo a «¡Asistencia registrada!».

### Datos de prueba

- Se crean alrededor de la hora actual para que siempre haya una clase en curso.
- Para empezar de cero: **Perfil → Reiniciar datos de prueba**.
- Si al abrir la app ya no hay ninguna clase en curso, se regeneran solos y se pierde lo que hayas creado.
- El código para recuperar la contraseña aparece en pantalla, porque no se envían correos.

## Cómo funciona el ticket

1. Cada estudiante tiene un secreto por reunión. El ticket se activa 15 minutos antes de la clase y deja de estar disponible una vez usado.
2. La app firma un código nuevo cada 5 segundos: `KC1.<ticket>.<paso>.<HMAC-SHA256>`.
3. El escáner comprueba la firma, la reunión, la vigencia (máximo 10 s), el horario y que no se haya usado.
4. En los primeros 15 minutos queda **Presente** y después **Tardanza**. Quien no se registra queda **Pendiente** y pasa a **Ausente** al terminar la reunión.

Las validaciones corren hoy en el dispositivo, en `services/apiSimulada.js`, y los secretos de prueba se derivan de los ids. Es suficiente para probar la interfaz, no para evitar fraudes reales: esa decisión debe pasar al backend.

### Protección contra capturas

| Medida | App (Expo Go o nativa) | Navegador |
| --- | --- | --- |
| El código vence en máximo 10 s | Sí | Sí |
| Bloqueo de capturas y grabación del sistema | Sí (`expo-screen-capture`) | **No es posible** |
| Código oculto al salir de la app o perder el foco | Sí | Sí |
| Código oculto con atajos de captura e impresión | No aplica | Sí, como disuasión |
| Franja animada y reloj para reconocer una imagen estática | Sí | Sí |

## Conectar el backend más adelante

Las pantallas solo usan `authService`, `reunionesService` y `asistenciaService`. Para conectar la API real hay que cambiar esos servicios y eliminar `services/apiSimulada.js`, `services/almacenLocal*.js` y `data/datosDemo.js`, sin tocar las pantallas.

## Tecnologías

JavaScript, React Native, Expo SDK 58, React Navigation, `expo-camera`, `expo-screen-capture` y `expo-secure-store`.

## Estructura del proyecto

```text
KonradCheckApp/
├── App.js                # Navegación según el rol de la sesión
├── context/              # Sesión del usuario
├── data/                 # Datos de prueba
├── hooks/                # Datos en vivo y protección de capturas
├── services/             # API simulada, generación del QR, CSV y fechas
├── screens/
│   ├── components/       # Íconos, barra inferior y etiquetas de estado
│   ├── noSesion/         # Inicio y recuperación de contraseña
│   └── conSesion/
│       ├── Estudiante/   # Clases, Mi QR e historial
│       └── Personal/     # Reuniones, programación, escáner y reportes
└── docs/                 # Plantilla CSV de asistentes
```

## Problemas comunes

- **Expo Go dice que hay que iniciar sesión o que las cuentas no coinciden:** revisa la cuenta con `npx expo whoami`, usa la misma en Expo Go y toca **Try Again**.
- **Expo Go dice que el proyecto no es compatible:** Expo Go solo abre la SDK más reciente. Actualiza Expo Go y el proyecto con `npx expo install expo@latest --fix`.
- **El iPhone no conecta:** verifica que esté en la misma Wi-Fi y que tenga activado el permiso de **Red local** para Expo Go en Ajustes.
- **El escáner web no lee ningún código:** el lector se descarga de internet la primera vez, así que el computador necesita conexión.

## Licencia

Consulta el archivo [LICENSE](KonradCheckApp/LICENSE) para conocer los términos de uso del proyecto.
