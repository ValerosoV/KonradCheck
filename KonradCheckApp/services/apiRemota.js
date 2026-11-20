const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

let tokenActual = null;
let alExpirarSesion = () => {};

export function configurarSesionApi({ token, alExpirar }) {
    tokenActual = token;
    if (alExpirar) alExpirarSesion = alExpirar;
}

async function solicitar(ruta, { metodo = 'GET', cuerpo, requiereSesion = true } = {}) {
    const headers = {};
    if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
    if (requiereSesion && tokenActual) headers.Authorization = `Bearer ${tokenActual}`;

    let respuesta;
    try {
        respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
            method: metodo,
            headers,
            body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        });
    } catch (error) {
        throw new Error(`No se pudo conectar con el backend (${API_BASE_URL}): ${error.message}`);
    }

    const texto = await respuesta.text();
    let datos = null;
    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            throw new Error(`El backend respondió con un formato inválido (HTTP ${respuesta.status}).`);
        }
    }
    if (!respuesta.ok) {
        const mensaje = datos?.error ?? datos?.message ?? `La solicitud falló (HTTP ${respuesta.status}).`;
        if (respuesta.status === 401 && tokenActual) alExpirarSesion(mensaje);
        throw new Error(mensaje);
    }
    return datos;
}

export function prepararCuentaDemo(tipo) {
    return solicitar(`/demo/cuentas/${encodeURIComponent(tipo)}`, {
        metodo: 'POST',
        requiereSesion: false,
    });
}

export function iniciarSesion(correo, contrasena) {
    return solicitar('/auth/login', {
        metodo: 'POST',
        cuerpo: { correo, contrasena },
        requiereSesion: false,
    });
}

export function cerrarSesion() {
    return solicitar('/auth/logout', { metodo: 'POST' });
}

export function obtenerUsuarioActual() {
    return solicitar('/auth/me');
}

export function listarReuniones() {
    return solicitar('/reuniones');
}

export function programarReunion(reunion) {
    return solicitar('/reuniones', { metodo: 'POST', cuerpo: reunion });
}

export function obtenerReporte(reunionId) {
    return solicitar(`/reuniones/${encodeURIComponent(reunionId)}/reporte`);
}

export function listarEstudiantes() {
    return solicitar('/estudiantes');
}

export function obtenerTicket(reunionId) {
    return solicitar(`/reuniones/${encodeURIComponent(reunionId)}/ticket`);
}

export function escanearCodigo(reunionId, codigo) {
    return solicitar(`/reuniones/${encodeURIComponent(reunionId)}/asistencias/escanear`, {
        metodo: 'POST',
        cuerpo: { codigo },
    });
}

export function obtenerHistorial() {
    return solicitar('/estudiantes/me/historial');
}

export function listarTicketsPendientes(reunionId) {
    return solicitar(`/reuniones/${encodeURIComponent(reunionId)}/tickets-pendientes`);
}

export function solicitarRecuperacion(correo) {
    return solicitar('/auth/password-reset/request', {
        metodo: 'POST',
        cuerpo: { correo },
        requiereSesion: false,
    });
}

export function restablecerContrasena(correo, codigo, nuevaContrasena) {
    return solicitar('/auth/password-reset/confirm', {
        metodo: 'POST',
        cuerpo: { correo, codigo, nuevaContrasena },
        requiereSesion: false,
    });
}

export async function cambiarContrasena() {
    throw new Error('El cambio de contraseña estará disponible en una siguiente etapa.');
}

export { API_BASE_URL };
