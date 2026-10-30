// En web no existe almacenamiento cifrado. Se usa sessionStorage para que cada
// pestana tenga su propia sesion y se pueda abrir estudiante y docente a la vez.

const CLAVE_TOKEN = 'konradcheck.token';

export async function leerToken() {
    try {
        return window.sessionStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

export async function guardarToken(token) {
    try {
        window.sessionStorage.setItem(CLAVE_TOKEN, token);
    } catch {
        // Sin almacenamiento la sesion dura hasta recargar la pagina.
    }
}

export async function borrarToken() {
    try {
        window.sessionStorage.removeItem(CLAVE_TOKEN);
    } catch {
        // Nada que borrar.
    }
}
