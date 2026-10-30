import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { obtenerHistorial } from '../../../services/asistenciaService';
import { formatearDia, formatearHora } from '../../../services/fechas';
import EstadoPill from '../../components/EstadoPill';

const FILTRO_TODAS = 'Todas';

function calcularResumen(registros) {
    const total = registros.length;
    const asistidas = registros.filter((registro) => registro.estado !== 'Ausente').length;
    const porcentaje = total === 0 ? 0 : (asistidas / total) * 100;
    return {
        asistenciaGeneral: `${porcentaje.toFixed(1)}%`,
        clasesRegistradas: `${asistidas} / ${total}`,
    };
}

export default function Historial() {
    const [filtro, setFiltro] = useState(FILTRO_TODAS);
    const { datos, error, cargando, recargar } = useDatosEnVivo(obtenerHistorial);

    const todos = datos ?? [];
    const filtros = [FILTRO_TODAS, ...new Set(todos.map((registro) => registro.titulo))];
    const registros = filtro === FILTRO_TODAS
        ? todos
        : todos.filter((registro) => registro.titulo === filtro);
    const resumen = calcularResumen(registros);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Historial de Asistencias</Text>
                <Text style={styles.subtitle}>
                    Revisa tu récord del semestre académico activo.
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Asistencia General</Text>
                        <Text style={styles.statValueTeal}>{resumen.asistenciaGeneral}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Clases Registradas</Text>
                        <Text style={styles.statValueDark}>{resumen.clasesRegistradas}</Text>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersRow}
                >
                    {filtros.map((opcion) => {
                        const activo = opcion === filtro;
                        return (
                            <Pressable
                                key={opcion}
                                accessibilityRole="button"
                                accessibilityState={{ selected: activo }}
                                onPress={() => setFiltro(opcion)}
                                style={[styles.filterChip, activo && styles.filterChipActive]}
                            >
                                <Text style={[styles.filterChipText, activo && styles.filterChipTextActive]}>
                                    {opcion}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {cargando && <ActivityIndicator color="#12A889" style={styles.estadoLista} />}
                {error && !datos && (
                    <Pressable onPress={recargar} style={styles.estadoLista}>
                        <Text style={styles.errorTexto}>{error}</Text>
                        <Text style={styles.reintentar}>Reintentar</Text>
                    </Pressable>
                )}
                {datos && registros.length === 0 && (
                    <Text style={styles.vacio}>Todavía no tienes registros de asistencia.</Text>
                )}

                {registros.map((registro) => (
                    <View key={registro.id} style={styles.recordCard}>
                        <View style={styles.recordTextBlock}>
                            <Text style={styles.recordTitle}>{registro.titulo}</Text>
                            <Text style={styles.recordDate}>
                                {formatearDia(registro.inicio)}
                                {registro.registradoEn ? ` · ${formatearHora(registro.registradoEn)}` : ''}
                            </Text>
                        </View>
                        <EstadoPill estado={registro.estado} />
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
    title: {
        color: '#172B4D',
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: '#667085',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 22,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 22,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flex: 1,
        padding: 16,
        shadowColor: '#172B4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    statLabel: {
        color: '#667085',
        fontSize: 13,
        marginBottom: 8,
    },
    statValueTeal: {
        color: '#12A889',
        fontSize: 24,
        fontWeight: '800',
    },
    statValueDark: {
        color: '#172B4D',
        fontSize: 24,
        fontWeight: '800',
    },
    filtersScroll: {
        flexGrow: 0,
        marginBottom: 22,
        marginHorizontal: -24,
    },
    filtersRow: {
        gap: 10,
        paddingHorizontal: 24,
    },
    filterChip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E4E9F0',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 9,
    },
    filterChipActive: {
        backgroundColor: '#12A889',
        borderColor: '#12A889',
    },
    filterChipText: {
        color: '#344054',
        fontSize: 14,
        fontWeight: '700',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
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
    reintentar: {
        color: '#12A889',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    vacio: {
        color: '#667085',
        fontSize: 14,
        marginVertical: 20,
        textAlign: 'center',
    },
    recordCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        padding: 18,
        shadowColor: '#172B4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    recordTextBlock: {
        flex: 1,
        paddingRight: 12,
    },
    recordTitle: {
        color: '#172B4D',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    recordDate: {
        color: '#98A2B3',
        fontSize: 13,
    },
});
