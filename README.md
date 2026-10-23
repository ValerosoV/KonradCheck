# KonradCheck

## Alcance de esta entrega

El repositorio incluye el código fuente y la navegación básica entre las pantallas. Los formularios de inicio de sesión, recuperación de contraseña y programación son prototipos visuales: no validan datos ni envían solicitudes. El inicio de sesión conduce a pantallas de demostración, el escaneo QR no activa la cámara y las reuniones no se guardan de forma persistente.

Este repositorio no contiene el documento PDF de entrega, wireframes, mockups, diagramas ni capturas de ejecución. Esos materiales deben agregarse al documento del proyecto y las capturas deben obtenerse ejecutando la app en un emulador o dispositivo.

Aplicación móvil institucional para apoyar el registro y la consulta de asistencia a clases y reuniones de la Fundación Universitaria Konrad Lorenz. La propuesta contempla códigos QR para el registro de asistencia y vistas diferenciadas para estudiantes y personal docente.

> **Estado del proyecto:** esta entrega contiene el frontend desarrollado con Expo y React Native. Varias pantallas usan datos de demostración; la autenticación, la persistencia y la conexión con un backend aún deben integrarse para ofrecer un flujo completo de producción.

## Equipo

- Juan David Valero Vanegas
- Stiven Adolfo Rodriguez Martinez
- Juan Kamilo Chacon Arias

**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Proyecto:** KonradCheck — Grupo 8

## Funcionalidades incluidas

- Inicio de sesión y recuperación de contraseña como pantallas de la aplicación.
- Interfaces de inicio para estudiante y docente.
- Consulta de clases, reuniones y estados de asistencia con datos de ejemplo.
- Vista del código QR del estudiante.
- Historial de asistencias y perfil.
- Programación de reuniones y consulta de reportes de asistencia.
- Navegación entre pantallas mediante React Navigation.
- Botones en los inicios para desplegar registros adicionales de ejemplo.

La disponibilidad de algunas acciones puede estar limitada a la interfaz y no implica que exista conexión con un servicio remoto o almacenamiento persistente.

## Tecnologías

- JavaScript
- React Native
- Expo SDK 57
- React Navigation (Native Stack)
- Expo Web y React Native Web

## Requisitos previos

- Node.js **22.13 o superior**.
- npm, incluido con Node.js.
- Git, para clonar el repositorio.
- Un editor de código, por ejemplo Visual Studio Code.
- Para ejecutar en teléfono: Expo Go compatible con la versión de Expo del proyecto, instalado en el dispositivo.
- Para emuladores: Android Studio y un emulador Android configurado. En macOS, Xcode para el simulador de iOS.

> iOS Simulator requiere macOS. También se puede abrir la aplicación en un dispositivo físico compatible escaneando el QR de Expo.

## Instalación

Abre una terminal en la carpeta donde quieras guardar el proyecto y ejecuta:

```bash
git clone <URL_DEL_REPOSITORIO>
cd KonradCheck/KonradCheckApp
npm install
```

Reemplaza `<URL_DEL_REPOSITORIO>` con la dirección Git del repositorio. Si ya descargaste el proyecto, abre una terminal directamente en `KonradCheckApp` y ejecuta `npm install`.

## Ejecutar la aplicación

Inicia el servidor de desarrollo de Expo:

```bash
npm start
```

Expo mostrará un código QR y opciones para abrir la aplicación. Según el destino, también puedes usar estos comandos:

```bash
npm run android
npm run ios
npm run web
```

- **Android:** abre el proyecto en un emulador Android configurado o usa Expo Go en un dispositivo.
- **iOS:** abre el simulador de iOS en macOS o usa Expo Go en un dispositivo.
- **Web:** inicia la versión web en el navegador.

Para detener el servidor, vuelve a la terminal y pulsa `Ctrl + C`.

### Problemas comunes

- Confirma que la terminal esté ubicada dentro de `KonradCheckApp`, donde se encuentra `package.json`.
- Si el teléfono no logra conectarse, verifica que el teléfono y el computador estén en la misma red Wi-Fi. La terminal de Expo también ofrece opciones de conexión alternativas.
- Si las dependencias presentan conflictos después de cambiar de rama o actualizar archivos, ejecuta `npm install` nuevamente.

## Estructura del proyecto

```text
KonradCheck/
├── README.md
└── KonradCheckApp/
    ├── App.js                         # Navegación y registro de pantallas
    ├── index.js                       # Punto de entrada de Expo
    ├── app.json                       # Configuración de Expo
    ├── package.json                   # Dependencias y comandos
    ├── assets/                         # Iconos e imágenes
    ├── data/
    │   └── reunionesMock.js           # Reuniones de demostración
    ├── screens/
    │   ├── components/                # Componentes visuales reutilizables
    │   ├── noSesion/                   # Inicio y recuperación de contraseña
    │   └── conSesion/
    │       ├── Estudiante/             # Reuniones, QR e historial
    │       └── Personal/               # Reuniones, programación y reportes
    └── services/
        └── authService.js              # Servicio de autenticación
```

## Notas de desarrollo

- Los registros de reuniones y clases son datos de demostración mantenidos en el frontend.
- `npm start` permite usar las herramientas de desarrollo de Expo, como recarga y selección de plataforma.
- La estructura está preparada para continuar integrando servicios y datos reales; antes de un despliegue se deben conectar las pantallas a un backend y revisar los flujos de autenticación y asistencia.

## Licencia

Consulta el archivo [LICENSE](LICENSE) para conocer los términos de uso del proyecto.
