import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { configurarSesionApi } from '../services/apiSimulada';
import * as authService from '../services/authService';
import { borrarToken, guardarToken, leerToken } from '../services/sesionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [restaurando, setRestaurando] = useState(true);
    const [aviso, setAviso] = useState(null);

    const limpiarSesion = useCallback(async () => {
        configurarSesionApi({ token: null });
        setUsuario(null);
        await borrarToken();
    }, []);

    useEffect(() => {
        configurarSesionApi({
            token: null,
            alExpirar: (mensaje) => {
                setAviso(mensaje);
                limpiarSesion();
            },
        });

        let vigente = true;
        (async () => {
            const token = await leerToken();
            if (token) {
                configurarSesionApi({ token });
                try {
                    const datos = await authService.obtenerUsuarioActual();
                    if (vigente) setUsuario(datos.usuario);
                } catch {
                    // Con la sesion vencida se vuelve al inicio de sesion.
                }
            }
            if (vigente) setRestaurando(false);
        })();
        return () => {
            vigente = false;
        };
    }, [limpiarSesion]);

    const entrar = useCallback(async (correo, contrasena) => {
        const datos = await authService.iniciarSesion(correo, contrasena);
        configurarSesionApi({ token: datos.token });
        await guardarToken(datos.token);
        setAviso(null);
        setUsuario(datos.usuario);
    }, []);

    const salir = useCallback(async () => {
        try {
            await authService.cerrarSesion();
        } catch {
            // La sesion local se cierra aunque falle el registro de salida.
        }
        await limpiarSesion();
    }, [limpiarSesion]);

    const valor = useMemo(
        () => ({ usuario, restaurando, aviso, entrar, salir }),
        [usuario, restaurando, aviso, entrar, salir],
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
