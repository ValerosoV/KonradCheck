import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { esHoy, formatearDia, formatearHora, formatearRango } from '../../../services/fechas';
import { listarReuniones } from '../../../services/reunionesService';
import EstadoPill from '../../components/EstadoPill';
import { QrGrid, PinIcon, QrIcon, miniQrMatrix } from '../../components/Icons';

const LIMITE_INICIAL = 2;

const ORDEN_ESTADO = { EN_CURSO: 0, PROGRAMADA: 1, FINALIZADA: 2 };

function ordenarClases(clases) {
    return [...clases].sort(
        (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] || a.inicio - b.inicio,
    );
}

function iniciales(nombre) {
    const partes = nombre.split(' ');
    return `${partes[0][0]}${partes[1]?.[0] ?? ''}`.toUpperCase();
}

function BotonTicket({ clase, onPress }) {
    if (clase.ticketDisponible) {
        return (
            <Pressable style={styles.qrButton} onPress={onPress}>
                <QrIcon color="#12A889" />
                <Text style={styles.qrButtonText}>QR</Text>
            </Pressable>
        );
    }
    if (clase.estado === 'PROGRAMADA') {
        return <Text style={styles.ticketNota}>Desde {formatearHora(clase.ticketDesde)}</Text>;
    }
    return null;
}

export default function Reuniones({ navigation }) {
    const { usuario } = useAuth();
    const [mostrarTodas, setMostrarTodas] = useState(false);
    const { datos, error, cargando, recargar } = useDatosEnVivo(listarReuniones, { intervalo: 5000 });

    const clases = ordenarClases(datos ?? []);
    const clasesDeHoy = clases.filter((clase) => esHoy(clase.inicio));
    const clasesVisibles = mostrarTodas ? clases : clasesDeHoy.slice(0, LIMITE_INICIAL);
    const ticketActivo = clases.find((clase) => clase.ticketDisponible);

    const abrirTicket = (clase) => navigation.navigate('MiQR', { reunionId: clase.id });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={false} onRefresh={recargar} tintColor="#12A889" />}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerText}>
                        <Text style={styles.greeting}>¡Hola de nuevo!</Text>
                        <Text style={styles.userName}>{usuario.nombre}</Text>
                        <Text style={styles.userCode}>Código: {usuario.codigo}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{iniciales(usuario.nombre)}</Text>
                    </View>
                </View>

                <View style={styles.attendanceCard}>
                    <View style={styles.attendanceTextBlock}>
                        <Text style={styles.attendanceTitle}>Asistencia rápida</Text>
                        <Text style={styles.attendanceSubtitle}>
                            {ticketActivo
                                ? `Tu ticket de ${ticketActivo.titulo} está listo. Muéstralo en el escáner del salón.`
                                : 'Cuando tengas una clase activa, tu ticket aparecerá aquí.'}
                        </Text>
                    </View>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Abrir ticket de la clase activa"
                        disabled={!ticketActivo}
                        style={[styles.qrCard, !ticketActivo && styles.qrCardInactivo]}
                        onPress={() => abrirTicket(ticketActivo)}
                    >
                        <QrGrid matrix={miniQrMatrix} cellSize={3} />
                        <Text style={styles.qrLabel}>{ticketActivo ? 'ABRIR TICKET' : 'SIN TICKET'}</Text>
                    </Pressable>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Clases de Hoy</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={mostrarTodas ? 'Mostrar menos clases' : 'Ver todas las clases'}
                        onPress={() => setMostrarTodas((mostrar) => !mostrar)}
                        hitSlop={10}
                    >
                        <Text style={styles.sectionLink}>{mostrarTodas ? 'Ver menos' : 'Ver todas'}</Text>
                    </Pressable>
                </View>

                {cargando && <ActivityIndicator color="#12A889" style={styles.estadoLista} />}
                {error && !datos && (
                    <Pressable onPress={recargar} style={styles.estadoLista}>
                        <Text style={styles.errorTexto}>{error}</Text>
                        <Text style={styles.sectionLinkCentrado}>Reintentar</Text>
                    </Pressable>
                )}
                {datos && clasesVisibles.length === 0 && (
                    <Text style={styles.vacio}>No tienes clases programadas para hoy.</Text>
                )}

                {clasesVisibles.map((clase) => (
                    <View key={clase.id} style={styles.classCard}>
                        <View style={styles.classHeaderRow}>
                            <Text style={styles.classTitle}>{clase.titulo}</Text>
                            <EstadoPill estado={clase.asistencia} />
                        </View>
                        <Text style={styles.classTime}>
                            {esHoy(clase.inicio) ? '' : `${formatearDia(clase.inicio)} · `}
                            {formatearRango(clase.inicio, clase.fin)}
                        </Text>

                        <View style={styles.divider} />

                        <View style={styles.classFooterRow}>
                            <View style={styles.classLocationRow}>
                                <PinIcon color="#12A889" />
                                <Text style={styles.classLocation}>{clase.ubicacion}</Text>
                            </View>
                            <BotonTicket clase={clase} onPress={() => abrirTicket(clase)} />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7FB',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerText: {
        flex: 1,
        paddingRight: 12,
    },
    greeting: {
        color: '#667085',
        fontSize: 15,
        marginBottom: 4,
    },
    userName: {
        color: '#172B4D',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 6,
    },
    userCode: {
        color: '#98A2B3',
        fontSize: 14,
    },
    avatar: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    attendanceCard: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
        padding: 20,
    },
    attendanceTextBlock: {
        flex: 1,
        paddingRight: 16,
    },
    attendanceTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    attendanceSubtitle: {
        color: '#B7C0D1',
        fontSize: 13,
        lineHeight: 19,
    },
    qrCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        gap: 6,
        padding: 8,
    },
    qrCardInactivo: {
        opacity: 0.45,
    },
    qrLabel: {
        color: '#667085',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        color: '#172B4D',
        fontSize: 20,
        fontWeight: '800',
    },
    sectionLink: {
        color: '#12A889',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionLinkCentrado: {
        color: '#12A889',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    estadoLista: {
        marginVertical: 20,
    },
    errorTexto: {
        color: '#C0392B',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    vacio: {
        color: '#667085',
        fontSize: 14,
        marginVertical: 20,
        textAlign: 'center',
    },
    classCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 14,
        padding: 18,
        shadowColor: '#172B4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    classHeaderRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    classTitle: {
        color: '#172B4D',
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        paddingRight: 10,
    },
    classTime: {
        color: '#667085',
        fontSize: 14,
        marginBottom: 14,
    },
    divider: {
        backgroundColor: '#EEF1F5',
        height: 1,
        marginBottom: 12,
    },
    classFooterRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    classLocationRow: {
        alignItems: 'center',
        flexDirection: 'row',
        flexShrink: 1,
        gap: 8,
    },
    classLocation: {
        color: '#667085',
        flexShrink: 1,
        fontSize: 13,
    },
    qrButton: {
        alignItems: 'center',
        backgroundColor: '#E7F7F3',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 6,
        marginLeft: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    qrButtonText: {
        color: '#12A889',
        fontSize: 13,
        fontWeight: '700',
    },
    ticketNota: {
        color: '#98A2B3',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 10,
    },
});
