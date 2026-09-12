/**
 * Estructura esperada para una reunion.
 *
 * @typedef {Object} Reunion
 * @property {string} titulo
 * @property {'CLASE'|'REUNION'} tipo
 * @property {string} descripcion
 * @property {string} ubicacion
 * @property {string} fechaInicio Fecha en formato ISO 8601.
 * @property {string} fechaFin Fecha en formato ISO 8601.
 * @property {'PROGRAMADA'|'EN_CURSO'|'FINALIZADA'|'CANCELADA'} estado
 */

/**
 * Crea una reunion respetando la estructura definida arriba.
 *
 * @param {Reunion} reunion
 * @returns {Reunion}
 */
export function crearReunion(reunion) {
    return reunion;
}
