import qrcode from 'qrcode-generator';
import * as api from './apiSimulada';

// El ticket funciona como en un concierto: la app firma un codigo nuevo cada 5 s con
// el secreto del ticket, y una captura deja de servir en cuanto cambia el paso.

const PASOS_ATRAS_CAPTURA = 6;

export { escanearCodigo, obtenerHistorial } from './apiSimulada';

export async function obtenerTicket(reunionId) {
    const datos = await api.obtenerTicket(reunionId);
    return { ...datos, desfaseMs: 0 };
}

export function generarCodigo(ticket, paso) {
    return `KC1.${ticket.id}.${paso}.${api.firmarPaso(ticket.secreto, ticket.id, paso)}`;
}

export function matrizQr(texto) {
    const qr = qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    const modulos = qr.getModuleCount();
    const matriz = [];
    for (let fila = 0; fila < modulos; fila++) {
        const celdas = [];
        for (let columna = 0; columna < modulos; columna++) {
            celdas.push(qr.isDark(fila, columna) ? 1 : 0);
        }
        matriz.push(celdas);
    }
    return matriz;
}

// Para probar con un solo dispositivo: el mismo codigo que muestra la app del
// estudiante, y otro ya vencido como si fuera una captura.
export async function obtenerCodigosDemo(reunionId) {
    const pendientes = await api.listarTicketsPendientes(reunionId);
    const paso = Math.floor(Date.now() / 5000);
    return pendientes.map((ticket) => ({
        nombre: ticket.nombre,
        codigo: ticket.codigo,
        codigoVigente: generarCodigo(ticket, paso),
        codigoVencido: generarCodigo(ticket, paso - PASOS_ATRAS_CAPTURA),
    }));
}
