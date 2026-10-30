import { useEffect, useState } from 'react';

// Un navegador no puede bloquear las capturas del sistema operativo. En la version web
// se disuade: el codigo se oculta sin foco, al imprimir y al detectar los atajos de
// captura. La proteccion real sigue siendo que el codigo vence en segundos.
const MS_OCULTO_TRAS_ATAJO = 3000;

export function useProteccionCaptura(activo) {
    const [sinFoco, setSinFoco] = useState(false);
    const [atajo, setAtajo] = useState(false);
    const [capturaDetectada, setCapturaDetectada] = useState(false);

    useEffect(() => {
        if (!activo) {
            setSinFoco(false);
            setAtajo(false);
            return undefined;
        }

        let temporizador;
        const revisarFoco = () => setSinFoco(document.hidden || !document.hasFocus());
        const ocultarPorAtajo = () => {
            setAtajo(true);
            setCapturaDetectada(true);
            clearTimeout(temporizador);
            temporizador = setTimeout(() => setAtajo(false), MS_OCULTO_TRAS_ATAJO);
        };
        // Impr Pant en Windows, y Cmd+Shift (Mac) o Win+Shift (recortes en Windows).
        const alPresionar = (evento) => {
            if (evento.key === 'PrintScreen' || (evento.metaKey && evento.shiftKey)) {
                ocultarPorAtajo();
            }
        };
        const bloquear = (evento) => evento.preventDefault();

        const estilo = document.createElement('style');
        estilo.textContent = '@media print { body { display: none !important; } }';
        document.head.appendChild(estilo);

        revisarFoco();
        document.addEventListener('visibilitychange', revisarFoco);
        window.addEventListener('blur', revisarFoco);
        window.addEventListener('focus', revisarFoco);
        window.addEventListener('keydown', alPresionar);
        window.addEventListener('keyup', alPresionar);
        window.addEventListener('beforeprint', ocultarPorAtajo);
        document.addEventListener('contextmenu', bloquear);
        document.addEventListener('copy', bloquear);

        return () => {
            clearTimeout(temporizador);
            estilo.remove();
            document.removeEventListener('visibilitychange', revisarFoco);
            window.removeEventListener('blur', revisarFoco);
            window.removeEventListener('focus', revisarFoco);
            window.removeEventListener('keydown', alPresionar);
            window.removeEventListener('keyup', alPresionar);
            window.removeEventListener('beforeprint', ocultarPorAtajo);
            document.removeEventListener('contextmenu', bloquear);
            document.removeEventListener('copy', bloquear);
        };
    }, [activo]);

    return { oculto: sinFoco || atajo, capturaDetectada };
}
