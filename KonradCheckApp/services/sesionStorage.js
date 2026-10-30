import * as SecureStore from 'expo-secure-store';

// El token de acceso vive en el almacenamiento cifrado del dispositivo.

const CLAVE_TOKEN = 'konradcheck.token';

export function leerToken() {
    return SecureStore.getItemAsync(CLAVE_TOKEN);
}

export function guardarToken(token) {
    return SecureStore.setItemAsync(CLAVE_TOKEN, token);
}

export function borrarToken() {
    return SecureStore.deleteItemAsync(CLAVE_TOKEN);
}
