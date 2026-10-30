// En web se usa localStorage y se vuelve a leer en cada consulta: asi dos pestanas
// (estudiante y docente) comparten los datos y el ticket se actualiza solo.

const CLAVE = 'konradcheck.demo';
let enMemoria = null;

export function leerDatos() {
    try {
        const guardado = window.localStorage.getItem(CLAVE);
        return guardado ? JSON.parse(guardado) : enMemoria;
    } catch {
        return enMemoria;
    }
}

export function guardarDatos(datos) {
    enMemoria = datos;
    try {
        window.localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
        // Sin almacenamiento los datos duran hasta recargar la pagina.
    }
}
