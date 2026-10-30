import { File, Paths } from 'expo-file-system';

// En el celular los datos de prueba se guardan en un archivo de la app.

const archivo = new File(Paths.document, 'konradcheck-demo.json');
let enMemoria = null;

export function leerDatos() {
    if (enMemoria) return enMemoria;
    try {
        if (archivo.exists) {
            enMemoria = JSON.parse(archivo.textSync());
        }
    } catch {
        enMemoria = null;
    }
    return enMemoria;
}

export function guardarDatos(datos) {
    enMemoria = datos;
    try {
        archivo.create({ overwrite: true });
        archivo.writeSync(JSON.stringify(datos));
    } catch {
        // Sin archivo los datos duran hasta cerrar la app.
    }
}
