import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export function leerArchivoElegido(archivo) {
    return new File(archivo.uri).text();
}

export async function compartirTexto(nombre, texto) {
    const archivo = new File(Paths.cache, nombre);
    archivo.create({ overwrite: true });
    archivo.writeSync(texto);
    await Sharing.shareAsync(archivo.uri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: nombre,
    });
}
