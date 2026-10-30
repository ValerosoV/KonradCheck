// Lee la plantilla de asistentes. Excel en espanol suele separar con ";", asi que
// se aceptan ambos, y cada celda se reconoce por su contenido en vez de por su columna.
export function leerAsistentesDeCsv(texto) {
    const filas = [];
    texto
        .replace(/^﻿/, '')
        .split(/\r?\n/)
        .forEach((linea) => {
            const celdas = linea.split(/[,;]/).map((celda) => celda.trim().replace(/^"|"$/g, ''));
            const correo = celdas.find((celda) => celda.includes('@'))?.toLowerCase();
            const codigo = celdas.find((celda) => /^\d{5,}$/.test(celda));
            if (correo || codigo) {
                filas.push({ correo, codigo });
            }
        });
    return filas;
}

function escaparCelda(valor) {
    const texto = String(valor ?? '');
    return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

// El BOM hace que Excel respete las tildes al abrir el archivo.
export function generarCsv(columnas, filas) {
    const lineas = [columnas, ...filas].map((fila) => fila.map(escaparCelda).join(','));
    return `﻿${lineas.join('\r\n')}\r\n`;
}
