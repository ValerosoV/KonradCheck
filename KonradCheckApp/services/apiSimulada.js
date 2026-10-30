import { sha256 } from 'js-sha256';
import { crearDatosDemo, hashClave, secretoDeTicket } from '../data/datosDemo';
import { guardarDatos, leerDatos } from './almacenLocal';

// Simula en el dispositivo lo que hara el backend, para probar el frontend completo.
// Cuando exista el backend, los servicios llamaran a la API real en vez de este archivo.

const MINUTO = 60 * 1000;
const PASO_QR_MS = 5000;
const PASOS_DE_TOLERANCIA = 1; // Un codigo vive maximo 10 s: su paso y el siguiente.
const VENTANA_TICKET_MS = 15 * MINUTO; // El ticket se activa 15 min antes de la clase.
const LIMITE_PRESENTE_MS = 15 * MINUTO; // Despues de 15 min de iniciada es tardanza.
const MENSAJE_SESION_INACTIVA = 'Tu sesión ya no está activa. Inicia sesión de nuevo.';

let tokenActual = null;
let alExpirarSesion = () => {};
let datosRevisados = false;

export function configurarSesionApi({ token, alExpirar }) {
    tokenActual = token;
    if (alExpirar) {
        alExpirarSesion = alExpirar;
    }
}

// Si al abrir la app ya no hay ninguna clase en curso, los datos se regeneran.
function cargarDatos() {
    let datos = leerDatos();
    const ahora = Date.now();
    const hayEnCurso = datos?.reuniones.some((reunion) => reunion.inicio <= ahora && reunion.fin >= ahora);
    if (!datos || (!datosRevisados && !hayEnCurso)) {
        datos = crearDatosDemo(ahora);
        guardarDatos(datos);
    }
    datosRevisados = true;
    return datos;
}

export function reiniciarDatosDemo() {
    guardarDatos(crearDatosDemo());
}

export function firmarPaso(secreto, ticketId, paso) {
    return sha256.hmac(secreto, `${ticketId}.${paso}`).slice(0, 16);
}

function esPersonal(usuario) {
    return usuario.rol === 'docente' || usuario.rol === 'administrativo';
}

function serializarUsuario(usuario) {
    return {
        id: usuario.id,
        codigo: usuario.codigo,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        area: esPersonal(usuario) ? 'personal' : 'estudiante',
        detalle: usuario.detalle,
    };
}

function autenticar(datos) {
    const sesion = datos.sesiones.find((item) => item.token === tokenActual);
    const usuario = sesion && datos.usuarios.find((item) => item.id === sesion.usuarioId);
    if (!usuario) {
        if (tokenActual) alExpirarSesion(MENSAJE_SESION_INACTIVA);
        throw new Error(MENSAJE_SESION_INACTIVA);
    }
    return usuario;
}

function autenticarArea(datos, area) {
    const usuario = autenticar(datos);
    if ((area === 'personal') !== esPersonal(usuario)) {
        throw new Error('Tu rol no tiene acceso a esta función.');
    }
    return usuario;
}

function estadoReunion(reunion, ahora) {
    if (ahora < reunion.inicio) return 'PROGRAMADA';
    return ahora <= reunion.fin ? 'EN_CURSO' : 'FINALIZADA';
}

function ventanaAbierta(reunion, ahora) {
    return ahora >= reunion.inicio - VENTANA_TICKET_MS && ahora <= reunion.fin;
}

function serializarReunion(reunion, ahora) {
    return {
        id: reunion.id,
        titulo: reunion.titulo,
        tipo: reunion.tipo,
        descripcion: reunion.descripcion,
        ubicacion: reunion.ubicacion,
        inicio: reunion.inicio,
        fin: reunion.fin,
        estado: estadoReunion(reunion, ahora),
        ticketDesde: reunion.inicio - VENTANA_TICKET_MS,
        escaneoActivo: ventanaAbierta(reunion, ahora),
    };
}

function estadoAsistencia(ticket, reunion, ahora) {
    if (ticket.estado) return ticket.estado;
    return ahora > reunion.fin ? 'Ausente' : 'Pendiente';
}

function obtenerReunion(datos, id) {
    const reunion = datos.reuniones.find((item) => item.id === id);
    if (!reunion) throw new Error('La reunión no existe.');
    return reunion;
}

function reunionDelPersonal(datos, usuario, id) {
    const reunion = obtenerReunion(datos, id);
    if (usuario.rol !== 'administrativo' && reunion.docenteId !== usuario.id) {
        throw new Error('Esta reunión no está a tu cargo.');
    }
    return reunion;
}

function resumenDeAsistencia(datos, reunion, ahora) {
    const estudiantes = datos.tickets
        .filter((ticket) => ticket.reunionId === reunion.id)
        .map((ticket) => {
            const estudiante = datos.usuarios.find((item) => item.id === ticket.estudianteId);
            return {
                id: estudiante.id,
                nombre: estudiante.nombre,
                codigo: estudiante.codigo,
                correo: estudiante.correo,
                estado: estadoAsistencia(ticket, reunion, ahora),
                registradoEn: ticket.registradoEn,
            };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    const contar = (estado) => estudiantes.filter((estudiante) => estudiante.estado === estado).length;
    return {
        estudiantes,
        resumen: {
            total: estudiantes.length,
            registrados: contar('Presente') + contar('Tardanza'),
            presentes: contar('Presente'),
            tardanzas: contar('Tardanza'),
            ausentes: contar('Ausente'),
            pendientes: contar('Pendiente'),
        },
    };
}

function normalizarCorreo(correo) {
    return String(correo ?? '').trim().toLowerCase();
}

function validarClaveNueva(clave) {
    if (typeof clave !== 'string' || clave.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
    }
}

export async function iniciarSesion(correo, contrasena) {
    const datos = cargarDatos();
    const usuario = datos.usuarios.find((item) => item.correo === normalizarCorreo(correo));
    if (!usuario || usuario.claveHash !== hashClave(String(contrasena ?? ''))) {
        throw new Error('Correo o contraseña incorrectos.');
    }
    // Un estudiante solo puede tener su ticket en una sesion a la vez.
    if (!esPersonal(usuario)) {
        datos.sesiones = datos.sesiones.filter((sesion) => sesion.usuarioId !== usuario.id);
    }
    const token = sha256(`${usuario.id}-${Date.now()}-${Math.random()}`);
    datos.sesiones.push({ token, usuarioId: usuario.id });
    guardarDatos(datos);
    return { token, usuario: serializarUsuario(usuario) };
}

export async function cerrarSesion() {
    const datos = cargarDatos();
    datos.sesiones = datos.sesiones.filter((sesion) => sesion.token !== tokenActual);
    guardarDatos(datos);
}

export async function obtenerUsuarioActual() {
    return { usuario: serializarUsuario(autenticar(cargarDatos())) };
}

export async function solicitarRecuperacion(correo) {
    const datos = cargarDatos();
    const usuario = datos.usuarios.find((item) => item.correo === normalizarCorreo(correo));
    if (!usuario) throw new Error('No hay una cuenta con ese correo institucional.');
    usuario.resetCodigo = String(Math.floor(100000 + Math.random() * 900000));
    usuario.resetExpira = Date.now() + 15 * MINUTO;
    guardarDatos(datos);
    // No hay servidor de correo: el codigo se muestra en la pantalla.
    return { codigoDemo: usuario.resetCodigo };
}

export async function restablecerContrasena(correo, codigo, nueva) {
    validarClaveNueva(nueva);
    const datos = cargarDatos();
    const usuario = datos.usuarios.find((item) => item.correo === normalizarCorreo(correo));
    const valido = usuario
        && usuario.resetCodigo
        && usuario.resetCodigo === String(codigo ?? '').trim()
        && usuario.resetExpira >= Date.now();
    if (!valido) throw new Error('El código es incorrecto o ya venció.');
    usuario.claveHash = hashClave(nueva);
    usuario.resetCodigo = null;
    usuario.resetExpira = null;
    datos.sesiones = datos.sesiones.filter((sesion) => sesion.usuarioId !== usuario.id);
    guardarDatos(datos);
}

export async function cambiarContrasena(actual, nueva) {
    const datos = cargarDatos();
    const usuario = autenticar(datos);
    if (usuario.claveHash !== hashClave(String(actual ?? ''))) {
        throw new Error('La contraseña actual no es correcta.');
    }
    validarClaveNueva(nueva);
    usuario.claveHash = hashClave(nueva);
    guardarDatos(datos);
}

export async function listarReuniones() {
    const datos = cargarDatos();
    const usuario = autenticar(datos);
    const ahora = Date.now();

    if (esPersonal(usuario)) {
        return datos.reuniones
            .filter((reunion) => usuario.rol === 'administrativo' || reunion.docenteId === usuario.id)
            .sort((a, b) => a.inicio - b.inicio)
            .map((reunion) => {
                const { resumen } = resumenDeAsistencia(datos, reunion, ahora);
                return { ...serializarReunion(reunion, ahora), registrados: resumen.registrados, total: resumen.total };
            });
    }

    const inicioDeHoy = new Date(ahora).setHours(0, 0, 0, 0);
    return datos.tickets
        .filter((ticket) => ticket.estudianteId === usuario.id)
        .map((ticket) => ({ ticket, reunion: obtenerReunion(datos, ticket.reunionId) }))
        .filter(({ reunion }) => reunion.fin >= inicioDeHoy)
        .sort((a, b) => a.reunion.inicio - b.reunion.inicio)
        .map(({ ticket, reunion }) => {
            const asistencia = estadoAsistencia(ticket, reunion, ahora);
            return {
                ...serializarReunion(reunion, ahora),
                asistencia,
                ticketDisponible: ventanaAbierta(reunion, ahora) && asistencia === 'Pendiente',
            };
        });
}

export async function programarReunion({ titulo, tipo, ubicacion, descripcion, inicio, fin, estudiantes }) {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'personal');
    const ahora = Date.now();
    if (fin <= ahora) throw new Error('La reunión ya habría terminado.');

    const reunionId = Math.max(...datos.reuniones.map((reunion) => reunion.id)) + 1;
    const reunion = {
        id: reunionId,
        titulo: titulo.trim(),
        tipo,
        descripcion: (descripcion ?? '').trim(),
        ubicacion: ubicacion.trim(),
        inicio,
        fin,
        docenteId: usuario.id,
    };
    datos.reuniones.push(reunion);

    let ticketId = Math.max(...datos.tickets.map((ticket) => ticket.id));
    [...new Set(estudiantes)].forEach((estudianteId) => {
        ticketId += 1;
        datos.tickets.push({
            id: ticketId,
            reunionId,
            estudianteId,
            secreto: secretoDeTicket(reunionId, estudianteId),
            estado: null,
            registradoEn: null,
        });
    });
    guardarDatos(datos);
    return { reunion: serializarReunion(reunion, ahora) };
}

export async function obtenerReporte(reunionId) {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'personal');
    const ahora = Date.now();
    const reunion = reunionDelPersonal(datos, usuario, reunionId);
    return { reunion: serializarReunion(reunion, ahora), ...resumenDeAsistencia(datos, reunion, ahora) };
}

export async function listarEstudiantes() {
    const datos = cargarDatos();
    autenticarArea(datos, 'personal');
    return datos.usuarios
        .filter((usuario) => usuario.rol === 'estudiante')
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map(({ id, codigo, nombre, correo }) => ({ id, codigo, nombre, correo }));
}

export async function obtenerTicket(reunionId) {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'estudiante');
    const ahora = Date.now();
    const reunion = obtenerReunion(datos, reunionId);
    const ticket = datos.tickets.find((item) => item.reunionId === reunion.id && item.estudianteId === usuario.id);
    if (!ticket) throw new Error('No estás inscrito en esta reunión.');
    const asistencia = estadoAsistencia(ticket, reunion, ahora);
    const activo = ventanaAbierta(reunion, ahora) && asistencia === 'Pendiente';
    return {
        ahora,
        pasoMs: PASO_QR_MS,
        reunion: serializarReunion(reunion, ahora),
        ticket: {
            id: ticket.id,
            // El secreto solo se entrega mientras el ticket puede usarse.
            secreto: activo ? ticket.secreto : null,
            asistencia,
            registradoEn: ticket.registradoEn,
        },
    };
}

export async function escanearCodigo(reunionId, codigo) {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'personal');
    const ahora = Date.now();
    const reunion = reunionDelPersonal(datos, usuario, reunionId);

    const contadores = () => {
        const { resumen } = resumenDeAsistencia(datos, reunion, ahora);
        return { registrados: resumen.registrados, total: resumen.total };
    };
    const rechazo = (resultado, mensaje, estudiante = null) => ({ resultado, mensaje, estudiante, ...contadores() });

    const partes = /^KC1\.(\d+)\.(\d+)\.([0-9a-f]{16})$/.exec(String(codigo ?? ''));
    if (!partes) return rechazo('INVALIDO', 'Este QR no es un ticket de KonradCheck.');

    const paso = Number(partes[2]);
    const ticket = datos.tickets.find((item) => item.id === Number(partes[1]));
    if (!ticket || firmarPaso(ticket.secreto, ticket.id, paso) !== partes[3]) {
        return rechazo('INVALIDO', 'La firma del código no es válida.');
    }

    const dueno = datos.usuarios.find((item) => item.id === ticket.estudianteId);
    const estudiante = { nombre: dueno.nombre, codigo: dueno.codigo };
    if (ticket.reunionId !== reunion.id) {
        return rechazo('OTRA_REUNION', 'Este ticket pertenece a otra reunión.', estudiante);
    }
    if (ticket.estado) {
        return { ...rechazo('DUPLICADO', 'Este estudiante ya estaba registrado.', estudiante), estado: ticket.estado };
    }
    if (Math.abs(Math.floor(ahora / PASO_QR_MS) - paso) > PASOS_DE_TOLERANCIA) {
        return rechazo('VENCIDO', 'Código vencido: puede ser una captura. Pide el ticket en vivo desde la app.', estudiante);
    }
    if (!ventanaAbierta(reunion, ahora)) {
        return rechazo('FUERA_DE_HORARIO', 'El registro de esta reunión no está abierto.', estudiante);
    }

    ticket.estado = ahora - reunion.inicio > LIMITE_PRESENTE_MS ? 'Tardanza' : 'Presente';
    ticket.registradoEn = ahora;
    guardarDatos(datos);
    return { resultado: 'REGISTRADO', mensaje: 'Registro exitoso', estudiante, estado: ticket.estado, ...contadores() };
}

export async function obtenerHistorial() {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'estudiante');
    const ahora = Date.now();
    return datos.tickets
        .filter((ticket) => ticket.estudianteId === usuario.id)
        .map((ticket) => ({ ticket, reunion: obtenerReunion(datos, ticket.reunionId) }))
        .filter(({ ticket, reunion }) => ticket.estado || reunion.fin < ahora)
        .sort((a, b) => b.reunion.inicio - a.reunion.inicio)
        .map(({ ticket, reunion }) => ({
            id: ticket.id,
            titulo: reunion.titulo,
            tipo: reunion.tipo,
            inicio: reunion.inicio,
            estado: estadoAsistencia(ticket, reunion, ahora),
            registradoEn: ticket.registradoEn,
        }));
}

// Para probar el escaner sin un segundo dispositivo.
export async function listarTicketsPendientes(reunionId) {
    const datos = cargarDatos();
    const usuario = autenticarArea(datos, 'personal');
    const reunion = reunionDelPersonal(datos, usuario, reunionId);
    return datos.tickets
        .filter((ticket) => ticket.reunionId === reunion.id && !ticket.estado)
        .map((ticket) => {
            const estudiante = datos.usuarios.find((item) => item.id === ticket.estudianteId);
            return { id: ticket.id, secreto: ticket.secreto, nombre: estudiante.nombre, codigo: estudiante.codigo };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
}
