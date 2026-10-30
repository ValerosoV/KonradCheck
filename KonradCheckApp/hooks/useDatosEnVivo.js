import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Carga datos al enfocar la pantalla y, si se indica, los refresca cada `intervalo` ms
// solo mientras la pantalla esta visible. Al fallar conserva los ultimos datos.
export function useDatosEnVivo(cargar, { intervalo, clave, habilitado = true } = {}) {
    const [estado, setEstado] = useState({ datos: null, error: null, cargando: habilitado });
    const cargarActual = useRef(cargar);
    cargarActual.current = cargar;
    const ultimaSolicitud = useRef(0);

    useEffect(() => {
        setEstado({ datos: null, error: null, cargando: habilitado });
    }, [clave, habilitado]);

    const recargar = useCallback(async () => {
        const solicitud = ++ultimaSolicitud.current;
        try {
            const datos = await cargarActual.current();
            if (solicitud === ultimaSolicitud.current) {
                setEstado({ datos, error: null, cargando: false });
            }
        } catch (error) {
            if (solicitud === ultimaSolicitud.current) {
                setEstado((previo) => ({ ...previo, error: error.message, cargando: false }));
            }
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!habilitado) return undefined;
            recargar();
            const temporizador = intervalo ? setInterval(recargar, intervalo) : null;
            return () => {
                if (temporizador) clearInterval(temporizador);
                ultimaSolicitud.current++;
            };
        }, [recargar, intervalo, clave, habilitado]),
    );

    return { ...estado, recargar };
}
