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
import { esHoy, formatearDia, formatearRango } from '../../../services/fechas';
import { listarReuniones } from '../../../services/reunionesService';

const LIMITE_INICIAL = 2;
const ORDEN_ESTADO = { EN_CURSO: 0, PROGRAMADA: 1, FINALIZADA: 2 };
const ETIQUETA_ESTADO = { EN_CURSO: 'EN CURSO', PROGRAMADA: 'PROGRAMADA', FINALIZADA: 'FINALIZADA' };
const ETIQUETA_TIPO = { CLASE: 'CLASE', REUNION: 'REUNIÓN' };

// En curso primero, luego lo que viene y al final lo mas reciente que ya paso.
function ordenarAgenda(reuniones) {
    return [...reuniones].sort((a, b) => {
        const porEstado = ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado];
        if (porEstado !== 0) return porEstado;
        return a.estado === 'FINALIZADA' ? b.inicio - a.inicio : a.inicio - b.inicio;
    });
}

function iniciales(nombre) {
    return nombre
        .split(' ')
        .filter((parte) => parte.length > 3)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();
}

export default function ReunionesPersonal({ navigation, route }) {
    const { usuario } = useAuth();
    const [mostrarAgenda, setMostrarAgenda] = useState(false);
    const { datos, error, cargando, recargar } = useDatosEnVivo(listarReuniones, { intervalo: 5000 });

    const reuniones = ordenarAgenda(datos ?? []);
    const reunionesVisibles = mostrarAgenda ? reuniones : reuniones.slice(0, LIMITE_INICIAL);
    const creada = route.params?.creada;

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
                        <Text style={styles.greeting}>
                            {usuario.rol === 'docente' ? 'Bienvenido Docente' : 'Bienvenido Administrativo'}
                        </Text>
                        <Text style={styles.userName}>{usuario.nombre}</Text>
                        <Text style={styles.userRole}>{usuario.detalle}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{iniciales(usuario.nombre)}</Text>
                    </View>
                </View>

                {creada && (
                    <View style={styles.bannerExito}>
                        <Text style={styles.bannerTexto}>Se programó «{creada}» y se crearon sus tickets.</Text>
                    </View>
                )}

                <Pressable
                    onPress={() => navigation.navigate('ProgramarReunion')}
                    style={styles.scheduleButton}
                >
                    <View style={styles.scheduleIcon}>
                        <Text style={styles.schedulePlus}>+</Text>
                    </View>
                    <View style={styles.scheduleText}>
                        <Text style={styles.scheduleTitle}>Programar nueva reunión</Text>
                        <Text style={styles.scheduleSubtitle}>Crea un evento para tus estudiantes</Text>
                    </View>
                </Pressable>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mis reuniones</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={mostrarAgenda ? 'Mostrar menos reuniones' : 'Ver agenda completa'}
                        onPress={() => setMostrarAgenda((mostrar) => !mostrar)}
                        hitSlop={10}
                    >
                        <Text style={styles.sectionLink}>{mostrarAgenda ? 'Ver menos' : 'Ver agenda'}</Text>
                    </Pressable>
                </View>

                {cargando && <ActivityIndicator color="#12A889" style={styles.estadoLista} />}
                {error && !datos && (
                    <Pressable onPress={recargar} style={styles.estadoLista}>
                        <Text style={styles.errorTexto}>{error}</Text>
                        <Text style={styles.reintentar}>Reintentar</Text>
                    </Pressable>
                )}
                {datos && reuniones.length === 0 && (
                    <Text style={styles.vacio}>Todavía no tienes reuniones programadas.</Text>
                )}

                {reunionesVisibles.map((reunion) => (
                    <View key={reunion.id} style={styles.meetingCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardType}>{ETIQUETA_TIPO[reunion.tipo]}</Text>
                            <Text style={[styles.status, reunion.estado === 'FINALIZADA' && styles.statusFinalizada]}>
                                {ETIQUETA_ESTADO[reunion.estado]}
                            </Text>
                        </View>
                        <Text style={styles.cardTitle}>{reunion.titulo}</Text>
                        <Text style={styles.cardSchedule}>
                            {esHoy(reunion.inicio) ? '' : `${formatearDia(reunion.inicio)} · `}
                            {formatearRango(reunion.inicio, reunion.fin)} · {reunion.ubicacion}
                        </Text>
                        <View style={styles.divider} />
                        {!!reunion.descripcion && (
                            <>
                                <Text style={styles.cardDescription}>Descripción</Text>
                                <Text style={styles.cardDetail}>{reunion.descripcion}</Text>
                            </>
                        )}
                        <Text style={styles.attendanceSummary}>
                            {reunion.registrados} / {reunion.total} Registrados
                        </Text>
                        <View style={styles.cardActions}>
                            <Pressable
                                onPress={() => navigation.navigate('ReporteAsistencia', { reunionId: reunion.id })}
                                style={styles.reportButton}
                            >
                                <Text style={styles.reportButtonText}>Consultar asistencia</Text>
                            </Pressable>
                            {reunion.escaneoActivo && (
                                <Pressable
                                    onPress={() => navigation.navigate('EscanearQR', { reunionId: reunion.id })}
                                    style={styles.scanButton}
                                >
                                    <Text style={styles.scanButtonText}>Escanear</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20, paddingHorizontal: 22, paddingTop: 18 },
    headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    headerText: { flex: 1, paddingRight: 12 },
    greeting: { color: '#344054', fontSize: 14, marginBottom: 3 },
    userName: { color: '#172B4D', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    userRole: { color: '#98A2B3', fontSize: 13 },
    avatar: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    bannerExito: { backgroundColor: '#DFF7E6', borderRadius: 12, marginBottom: 14, padding: 12 },
    bannerTexto: { color: '#1E9E5A', fontSize: 13, fontWeight: '700', lineHeight: 18 },
    scheduleButton: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 14, flexDirection: 'row', marginBottom: 22, paddingHorizontal: 16, paddingVertical: 15 },
    scheduleIcon: { alignItems: 'center', backgroundColor: '#087C71', borderRadius: 17, height: 34, justifyContent: 'center', marginRight: 12, width: 34 },
    schedulePlus: { color: '#FFFFFF', fontSize: 24, fontWeight: '300', lineHeight: 26 },
    scheduleText: { flex: 1 },
    scheduleTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    scheduleSubtitle: { color: '#B7C0D1', fontSize: 12, marginTop: 4 },
    sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { color: '#172B4D', fontSize: 18, fontWeight: '800' },
    sectionLink: { color: '#07877B', fontSize: 14, fontWeight: '700' },
    estadoLista: { marginVertical: 20 },
    errorTexto: { color: '#C0392B', fontSize: 14, lineHeight: 20, textAlign: 'center' },
    reintentar: { color: '#07877B', fontSize: 14, fontWeight: '700', marginTop: 8, textAlign: 'center' },
    vacio: { color: '#667085', fontSize: 14, marginVertical: 20, textAlign: 'center' },
    meetingCard: { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 14, padding: 16, shadowColor: '#172B4D', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
    cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    cardType: { color: '#12A889', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    status: { backgroundColor: '#C9F6EA', borderRadius: 8, color: '#07877B', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
    statusFinalizada: { backgroundColor: '#EEF1F5', color: '#667085' },
    cardTitle: { color: '#172B4D', fontSize: 16, fontWeight: '800', marginTop: 8 },
    cardSchedule: { color: '#667085', fontSize: 13, lineHeight: 18, marginTop: 4 },
    divider: { backgroundColor: '#EEF1F5', height: 1, marginTop: 11 },
    cardDescription: { color: '#98A2B3', fontSize: 12, marginTop: 10 },
    cardDetail: { color: '#667085', fontSize: 13, lineHeight: 18, marginTop: 3 },
    attendanceSummary: { color: '#344054', fontSize: 13, fontWeight: '700', marginTop: 10 },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 11 },
    reportButton: { alignItems: 'center', backgroundColor: '#C9F6EA', borderRadius: 8, flex: 1, paddingVertical: 10 },
    reportButtonText: { color: '#07877B', fontSize: 13, fontWeight: '800' },
    scanButton: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
    scanButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
