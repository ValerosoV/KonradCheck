const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function dosDigitos(numero) {
    return String(numero).padStart(2, '0');
}

export function formatearHora(ms) {
    const fecha = new Date(ms);
    return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

export function formatearHoraSegundos(ms) {
    return `${formatearHora(ms)}:${dosDigitos(new Date(ms).getSeconds())}`;
}

export function formatearRango(inicio, fin) {
    return `${formatearHora(inicio)} - ${formatearHora(fin)}`;
}

export function esHoy(ms) {
    return new Date(ms).toDateString() === new Date().toDateString();
}

export function formatearDia(ms) {
    const fecha = new Date(ms);
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const base = `${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;

    if (esHoy(ms)) return `Hoy, ${base}`;
    if (fecha.toDateString() === ayer.toDateString()) return `Ayer, ${base}`;
    if (fecha.toDateString() === manana.toDateString()) return `Mañana, ${base}`;
    return `${base} de ${fecha.getFullYear()}`;
}

export function fechaParaFormulario(ms) {
    const fecha = new Date(ms);
    return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

// Mascaras para escribir solo con el teclado numerico: 12112026 -> 12/11/2026.
export function mascaraFecha(texto) {
    const digitos = texto.replace(/\D/g, '').slice(0, 8);
    return [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)].filter(Boolean).join('/');
}

export function mascaraHora(texto) {
    const digitos = texto.replace(/\D/g, '').slice(0, 4);
    return [digitos.slice(0, 2), digitos.slice(2)].filter(Boolean).join(':');
}

// Devuelve null si la combinacion no existe (por ejemplo 31/02 o 25:00).
export function construirFecha(fechaTexto, horaTexto) {
    const fechaPartes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fechaTexto);
    const horaPartes = /^(\d{2}):(\d{2})$/.exec(horaTexto);
    if (!fechaPartes || !horaPartes) return null;

    const [dia, mes, anio] = fechaPartes.slice(1).map(Number);
    const [hora, minuto] = horaPartes.slice(1).map(Number);
    const fecha = new Date(anio, mes - 1, dia, hora, minuto);
    const coincide = fecha.getDate() === dia
        && fecha.getMonth() === mes - 1
        && fecha.getHours() === hora
        && fecha.getMinutes() === minuto;
    return coincide ? fecha.getTime() : null;
}
