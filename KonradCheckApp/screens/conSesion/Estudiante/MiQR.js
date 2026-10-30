import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    Vibration,
    View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { useProteccionCaptura } from '../../../hooks/useProteccionCaptura';
import { generarCodigo, matrizQr, obtenerTicket } from '../../../services/asistenciaService';
import { formatearDia, formatearHora, formatearHoraSegundos, formatearRango } from '../../../services/fechas';
import { QrGrid, RefreshIcon } from '../../components/Icons';

const USA_DRIVER_NATIVO = Platform.OS !== 'web';
const ANCHO_MAXIMO_APP = 480;
const QR_MAXIMO = 250;
const MODULOS_MARGEN = 8; // Zona de silencio que el escaner necesita alrededor del QR.

// Franja en movimiento: igual que en una boleta digital, una captura se reconoce
// a simple vista porque esta franja y el reloj quedan quietos.
function FranjaEnVivo() {
    const avance = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animacion = Animated.loop(
            Animated.timing(avance, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: USA_DRIVER_NATIVO,
            }),
        );
        animacion.start();
        return () => animacion.stop();
    }, [avance]);

    return (
        <View style={styles.franja}>
            <Animated.View
                style={[
                    styles.franjaLuz,
                    {
                        transform: [
                            { translateX: avance.interpolate({ inputRange: [0, 1], outputRange: [-90, 340] }) },
                        ],
                    },
                ]}
            />
            <Text style={styles.franjaTexto}>TICKET EN VIVO</Text>
        </View>
    );
}

function TicketActivo({ ticket, reunion, desfaseMs, pasoMs, usuario, activo }) {
    const { width } = useWindowDimensions();
    const [ahora, setAhora] = useState(() => Date.now() + desfaseMs);
    const { oculto, capturaDetectada } = useProteccionCaptura(activo);

    useEffect(() => {
        if (!activo) return undefined;
        const reloj = setInterval(() => setAhora(Date.now() + desfaseMs), 250);
        return () => clearInterval(reloj);
    }, [activo, desfaseMs]);

    const paso = Math.floor(ahora / pasoMs);
    const codigo = useMemo(() => generarCodigo(ticket, paso), [ticket, paso]);
    const matriz = useMemo(() => matrizQr(codigo), [codigo]);
    const restanteMs = pasoMs - (ahora % pasoMs);
    const segundos = Math.ceil(restanteMs / 1000);

    const disponible = Math.min(Math.min(width, ANCHO_MAXIMO_APP) - 80, QR_MAXIMO);
    const celda = Math.max(3, Math.floor(disponible / (matriz.length + MODULOS_MARGEN)));
    const ladoQr = celda * (matriz.length + MODULOS_MARGEN);

    return (
        <View style={styles.ticketCard}>
            <FranjaEnVivo />

            <View style={[styles.qrZona, { height: ladoQr, width: ladoQr }]}>
                {oculto ? (
                    <View style={styles.qrOculto}>
                        <Text style={styles.qrOcultoTitulo}>Código oculto</Text>
                        <Text style={styles.qrOcultoTexto}>
                            Vuelve a esta pantalla para mostrar tu ticket. Las capturas no sirven: el código vence en segundos.
                        </Text>
                    </View>
                ) : (
                    <QrGrid matrix={matriz} cellSize={celda} />
                )}
            </View>

            <View style={styles.perforacion}>
                <View style={[styles.muesca, styles.muescaIzquierda]} />
                <View style={styles.lineaPunteada} />
                <View style={[styles.muesca, styles.muescaDerecha]} />
            </View>

            <Text style={styles.nombre}>{usuario.nombre}</Text>
            <Text style={styles.id}>ID: {usuario.codigo}</Text>
            <Text style={styles.reloj}>{formatearHoraSegundos(ahora)}</Text>

            <View style={styles.refreshPill}>
                <RefreshIcon color="#12A889" />
                <Text style={styles.refreshText}>El código se actualiza en {segundos}s</Text>
            </View>
            <View style={styles.progresoFondo}>
                <View style={[styles.progreso, { width: `${(restanteMs / pasoMs) * 100}%` }]} />
            </View>

            {capturaDetectada && (
                <Text style={styles.avisoCaptura}>
                    Se detectó un intento de captura. Solo el ticket en vivo registra tu asistencia.
                </Text>
            )}
            <Text style={styles.lugar}>{reunion.ubicacion}</Text>
        </View>
    );
}

function TicketUsado({ ticket, reunion }) {
    const esTardanza = ticket.asistencia === 'Tardanza';
    return (
        <View style={styles.resultado}>
            <View style={[styles.checkCircle, esTardanza && styles.checkCircleTarde]}>
                <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.resultadoTitulo}>¡Asistencia registrada!</Text>
            <Text style={styles.resultadoTexto}>
                {esTardanza ? 'Quedaste con tardanza' : 'Quedaste presente'} en {reunion.titulo}
                {ticket.registradoEn ? ` a las ${formatearHora(ticket.registradoEn)}` : ''}.
            </Text>
            <Text style={styles.resultadoNota}>Este ticket ya se usó y no se puede volver a mostrar.</Text>
        </View>
    );
}

function TicketInactivo({ titulo, texto }) {
    return (
        <View style={styles.resultado}>
            <Text style={styles.resultadoTitulo}>{titulo}</Text>
            <Text style={styles.resultadoTexto}>{texto}</Text>
        </View>
    );
}

export default function MiQR({ navigation, route }) {
    const reunionId = route.params?.reunionId;
    const { usuario } = useAuth();
    const enFoco = useIsFocused();
    const { datos, error } = useDatosEnVivo(() => obtenerTicket(reunionId), {
        intervalo: 2000,
        clave: reunionId,
        habilitado: !!reunionId,
    });

    // El desfase se fija una vez: si cambiara en cada consulta el QR podria parpadear.
    const desfase = useRef(null);
    const reunionDelDesfase = useRef(null);
    if (datos && reunionDelDesfase.current !== reunionId) {
        reunionDelDesfase.current = reunionId;
        desfase.current = datos.desfaseMs;
    }

    const ticket = datos?.ticket;
    const reunion = datos?.reunion;
    const usado = ticket?.asistencia === 'Presente' || ticket?.asistencia === 'Tardanza';

    const anteriorUsado = useRef(false);
    useEffect(() => {
        if (usado && !anteriorUsado.current && Platform.OS !== 'web') {
            Vibration.vibrate(200);
        }
        anteriorUsado.current = usado;
    }, [usado]);

    let contenido;
    if (!reunionId) {
        contenido = (
            <TicketInactivo
                titulo="Elige una clase"
                texto="Abre tu ticket desde la clase que aparece en Inicio."
            />
        );
    } else if (!datos) {
        contenido = (
            <TicketInactivo
                titulo={error ? 'No se pudo cargar tu ticket' : 'Cargando tu ticket...'}
                texto={error ?? 'Un momento, por favor.'}
            />
        );
    } else if (usado) {
        contenido = <TicketUsado ticket={ticket} reunion={reunion} />;
    } else if (ticket.secreto) {
        contenido = (
            <TicketActivo
                ticket={ticket}
                reunion={reunion}
                desfaseMs={desfase.current}
                pasoMs={datos.pasoMs}
                usuario={usuario}
                activo={enFoco}
            />
        );
    } else if (ticket.asistencia === 'Ausente' || reunion.estado === 'FINALIZADA') {
        contenido = (
            <TicketInactivo
                titulo="Esta sesión ya terminó"
                texto="El ticket venció y no quedó registro de tu asistencia."
            />
        );
    } else {
        contenido = (
            <TicketInactivo
                titulo="Tu ticket aún no está activo"
                texto={`Se activa el ${formatearDia(reunion.ticketDesde).toLowerCase()} a las ${formatearHora(reunion.ticketDesde)}, 15 minutos antes de que empiece (${formatearRango(reunion.inicio, reunion.fin)}).`}
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Volver a Inicio"
                    onPress={() => navigation.navigate('Reuniones')}
                    hitSlop={10}
                    style={styles.volver}
                >
                    <Text style={styles.volverTexto}>‹ Inicio</Text>
                </Pressable>

                {reunion && <Text style={styles.materia}>{reunion.titulo.toUpperCase()}</Text>}
                <Text style={styles.title}>Registrar Asistencia</Text>

                {contenido}

                {error && datos && (
                    <Text style={styles.sinConexion}>Sin conexión. Reintentando...</Text>
                )}

                {ticket?.secreto && !usado && (
                    <View style={styles.footer}>
                        <Text style={styles.footerTitle}>Acerca este código al escáner del salón</Text>
                        <Text style={styles.footerSubtitle}>
                            Se regenera cada 5 segundos para evitar fraudes. Solo funciona desde tu app.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111827',
    },
    content: {
        alignItems: 'center',
        flexGrow: 1,
        paddingBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    volver: {
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    volverTexto: {
        color: '#98A2B3',
        fontSize: 15,
        fontWeight: '700',
    },
    materia: {
        color: '#12A889',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 6,
        textAlign: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 16,
    },
    ticketCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        paddingBottom: 16,
        userSelect: 'none',
        width: '100%',
    },
    franja: {
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#087C71',
        height: 26,
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    franjaLuz: {
        backgroundColor: '#3FD7BE',
        bottom: 0,
        left: 0,
        position: 'absolute',
        top: 0,
        width: 90,
    },
    franjaTexto: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    qrZona: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    qrOculto: {
        alignItems: 'center',
        backgroundColor: '#EEF1F5',
        borderRadius: 12,
        height: '100%',
        justifyContent: 'center',
        padding: 18,
        width: '100%',
    },
    qrOcultoTitulo: {
        color: '#172B4D',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
    },
    qrOcultoTexto: {
        color: '#667085',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },
    perforacion: {
        alignItems: 'center',
        alignSelf: 'stretch',
        flexDirection: 'row',
        height: 24,
        marginVertical: 4,
    },
    muesca: {
        backgroundColor: '#111827',
        borderRadius: 12,
        height: 24,
        position: 'absolute',
        width: 24,
    },
    muescaIzquierda: {
        left: -12,
    },
    muescaDerecha: {
        right: -12,
    },
    lineaPunteada: {
        borderColor: '#D0D5DD',
        borderStyle: 'dashed',
        borderTopWidth: 1,
        flex: 1,
        marginHorizontal: 20,
    },
    nombre: {
        color: '#172B4D',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    id: {
        color: '#667085',
        fontSize: 13,
    },
    reloj: {
        color: '#172B4D',
        fontSize: 15,
        fontVariant: ['tabular-nums'],
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 6,
    },
    refreshPill: {
        alignItems: 'center',
        backgroundColor: '#D8F5EA',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    refreshText: {
        color: '#12805A',
        fontSize: 13,
        fontWeight: '700',
    },
    progresoFondo: {
        backgroundColor: '#EEF1F5',
        borderRadius: 2,
        height: 4,
        marginTop: 10,
        overflow: 'hidden',
        width: 150,
    },
    progreso: {
        backgroundColor: '#12A889',
        height: 4,
    },
    avisoCaptura: {
        color: '#C0392B',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 17,
        marginTop: 10,
        paddingHorizontal: 18,
        textAlign: 'center',
    },
    lugar: {
        color: '#98A2B3',
        fontSize: 12,
        marginTop: 10,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    resultado: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingVertical: 32,
        width: '100%',
    },
    checkCircle: {
        alignItems: 'center',
        backgroundColor: '#12A889',
        borderRadius: 36,
        height: 72,
        justifyContent: 'center',
        marginBottom: 16,
        width: 72,
    },
    checkCircleTarde: {
        backgroundColor: '#B07A1E',
    },
    checkText: {
        color: '#FFFFFF',
        fontSize: 38,
        fontWeight: '800',
    },
    resultadoTitulo: {
        color: '#172B4D',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    resultadoTexto: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },
    resultadoNota: {
        color: '#98A2B3',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 12,
        textAlign: 'center',
    },
    sinConexion: {
        color: '#F2B8B0',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 10,
    },
    footer: {
        alignItems: 'center',
        marginTop: 16,
    },
    footerTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    footerSubtitle: {
        color: '#98A2B3',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
});
