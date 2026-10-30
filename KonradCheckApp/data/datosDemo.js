import { sha256 } from 'js-sha256';

// Datos ficticios para probar el frontend mientras no exista un backend.

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const CLAVE_DEMO = 'Konrad123';

const USUARIOS_DEMO = [
    { codigo: '22019483', nombre: 'David Gómez', correo: 'david.gomez', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22014389', nombre: 'María Camila Restrepo', correo: 'maria.restrepo', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22011207', nombre: 'Andrés Felipe Rojas', correo: 'andres.rojas', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '21908432', nombre: 'Diana Carolina Martínez', correo: 'diana.martinez', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '21982499', nombre: 'Guillermo León Vélez', correo: 'guillermo.velez', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22019401', nombre: 'Santiago Silva Ochoa', correo: 'santiago.silva', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '21934820', nombre: 'Juan Carlos Guerrero', correo: 'juan.guerrero', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22027715', nombre: 'Santiago Rincón', correo: 'santiago.rincon', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22031950', nombre: 'Laura Sofía Pineda', correo: 'laura.pineda', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '21975566', nombre: 'Natalia Herrera Cruz', correo: 'natalia.herrera', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22040218', nombre: 'Felipe Andrade Mora', correo: 'felipe.andrade', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: '22008843', nombre: 'Valentina Ortiz Duarte', correo: 'valentina.ortiz', rol: 'estudiante', detalle: 'Estudiante Pregrado' },
    { codigo: 'D1045', nombre: 'Dr. Armando Casas', correo: 'armando.casas', rol: 'docente', detalle: 'Facultad de Matemáticas e Ingeniería' },
    { codigo: 'A2071', nombre: 'Paula Medina', correo: 'paula.medina', rol: 'administrativo', detalle: 'Bienestar Universitario' },
];

const MATERIAS = [
    { titulo: 'Arquitectura de Software - G3', descripcion: 'Revisión de patrones de diseño', ubicacion: 'Salón 402, Edificio Central' },
    { titulo: 'Sistemas Operativos - G1', descripcion: 'Administración de procesos y memoria', ubicacion: 'Salón 103, Laboratorio' },
    { titulo: 'Cálculo Multivariable - G2', descripcion: 'Integrales múltiples', ubicacion: 'Salón 301, Edificio Central' },
    { titulo: 'Bases de Datos - G2', descripcion: 'Consultas y modelado relacional', ubicacion: 'Laboratorio 2' },
];

export function hashClave(clave) {
    return sha256(clave);
}

// El secreto se deriva de los ids: asi dos dispositivos generan los mismos tickets de
// prueba y el escaner de uno puede validar el QR que muestra el otro.
export function secretoDeTicket(reunionId, estudianteId) {
    return sha256(`konradcheck-demo:${reunionId}:${estudianteId}`).slice(0, 32);
}

// Estado reproducible para el historico: mismas personas, mismos resultados.
function estadoHistorico(estudianteId, reunionId) {
    const valor = parseInt(sha256(`${estudianteId}-${reunionId}`).slice(0, 2), 16) % 12;
    if (valor === 0) return null;
    return valor === 1 ? 'Tardanza' : 'Presente';
}

// Las reuniones se crean alrededor de "ahora" para que siempre haya una clase
// en curso con la que probar el flujo, sin importar la hora de la prueba.
export function crearDatosDemo(ahora = Date.now()) {
    const datos = { usuarios: [], sesiones: [], reuniones: [], tickets: [] };

    const claveHash = hashClave(CLAVE_DEMO);
    USUARIOS_DEMO.forEach((usuario, indice) => {
        datos.usuarios.push({
            ...usuario,
            id: indice + 1,
            correo: `${usuario.correo}@konradlorenz.edu.co`,
            claveHash,
        });
    });

    const docenteId = datos.usuarios.find((usuario) => usuario.rol === 'docente').id;
    const estudiantes = datos.usuarios
        .filter((usuario) => usuario.rol === 'estudiante')
        .map((usuario) => usuario.id);

    const agregarReunion = (reunion) => {
        const id = datos.reuniones.length + 1;
        datos.reuniones.push({ ...reunion, id, docenteId });
        return id;
    };
    const agregarTicket = (reunionId, estudianteId, estado = null, registradoEn = null) => {
        datos.tickets.push({
            id: datos.tickets.length + 1,
            reunionId,
            estudianteId,
            secreto: secretoDeTicket(reunionId, estudianteId),
            estado,
            registradoEn,
        });
    };

    // Historico: una sesion semanal por materia durante las ultimas seis semanas.
    MATERIAS.forEach((materia, indice) => {
        for (let semana = 1; semana <= 6; semana++) {
            const inicio = ahora - semana * 7 * DIA - indice * DIA - 3 * HORA;
            const reunionId = agregarReunion({ ...materia, tipo: 'CLASE', inicio, fin: inicio + 2 * HORA });
            estudiantes.forEach((estudianteId) => {
                const estado = estadoHistorico(estudianteId, reunionId);
                const minutos = estado === 'Tardanza' ? 22 : 4;
                agregarTicket(reunionId, estudianteId, estado, estado ? inicio + minutos * MINUTO : null);
            });
        }
    });

    // Hoy: una clase terminada, una en curso y las siguientes.
    const hoy = [
        { ...MATERIAS[0], tipo: 'CLASE', inicio: ahora - 3 * HORA, fin: ahora - HORA },
        { ...MATERIAS[1], tipo: 'CLASE', inicio: ahora - 10 * MINUTO, fin: ahora + 110 * MINUTO },
        { ...MATERIAS[2], tipo: 'CLASE', inicio: ahora + 2 * HORA, fin: ahora + 4 * HORA },
        {
            titulo: 'Reunión informativa de Facultad',
            tipo: 'REUNION',
            descripcion: 'Calendario de cierre del semestre',
            ubicacion: 'Auditorio Principal',
            inicio: ahora + 5 * HORA,
            fin: ahora + 6 * HORA,
        },
        { ...MATERIAS[3], tipo: 'CLASE', inicio: ahora + DIA, fin: ahora + DIA + 2 * HORA },
    ];
    hoy.forEach((reunion, indice) => {
        const reunionId = agregarReunion(reunion);
        estudiantes.forEach((estudianteId, posicion) => {
            if (indice === 0) {
                agregarTicket(reunionId, estudianteId, 'Presente', reunion.inicio + 5 * MINUTO);
            } else if (indice === 1 && posicion >= 8) {
                // En la clase en curso ya entraron algunos; las cuentas demo quedan pendientes.
                agregarTicket(reunionId, estudianteId, 'Presente', reunion.inicio + 3 * MINUTO);
            } else {
                agregarTicket(reunionId, estudianteId);
            }
        });
    });

    return datos;
}
