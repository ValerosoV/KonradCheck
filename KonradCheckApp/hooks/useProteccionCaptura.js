import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

// App nativa: el sistema bloquea capturas y grabaciones mientras el ticket esta en
// pantalla (FLAG_SECURE en Android) y el codigo se oculta si la app pierde el foco.
export function useProteccionCaptura(activo) {
    const [oculto, setOculto] = useState(false);
    const [capturaDetectada, setCapturaDetectada] = useState(false);

    useEffect(() => {
        if (!activo) {
            setOculto(false);
            return undefined;
        }

        const CLAVE = 'ticket';
        ScreenCapture.preventScreenCaptureAsync(CLAVE).catch(() => {});
        if (Platform.OS === 'ios') {
            ScreenCapture.enableAppSwitcherProtectionAsync().catch(() => {});
        }
        const capturas = ScreenCapture.addScreenshotListener(() => setCapturaDetectada(true));
        const foco = AppState.addEventListener('change', (estado) => setOculto(estado !== 'active'));

        return () => {
            ScreenCapture.allowScreenCaptureAsync(CLAVE).catch(() => {});
            if (Platform.OS === 'ios') {
                ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
            }
            capturas.remove();
            foco.remove();
        };
    }, [activo]);

    return { oculto, capturaDetectada };
}
