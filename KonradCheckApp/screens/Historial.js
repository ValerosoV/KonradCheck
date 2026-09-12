import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import BottomTabBar from './components/BottomTabBar';

// Pantalla de historial: solo maqueta visual con datos de ejemplo.

const resumen = {
    asistenciaGeneral: '92.4%',
    clasesRegistradas: '36 / 39',
};

const filtros = ['Todas', 'Arq. Software', 'Sistemas Op.'];

const registros = [
    {
        id: '1',
        materia: 'Sistemas Operativos',
        fecha: 'Hoy, 24 de Oct',
        estado: 'Presente',
    },
    {
        id: '2',
        materia: 'Arquitectura de Software',
        fecha: 'Ayer, 23 de Oct',
        estado: 'Tardanza',
    },
    {
        id: '3',
        materia: 'Cálculo Multivariable',
        fecha: 'Marzo 21, 2025',
        estado: 'Presente',
    },
    {
        id: '4',
        materia: 'Sistemas Operativos',
        fecha: 'Marzo 18, 2025',
        estado: 'Ausente',
    },
    {
        id: '5',
        materia: 'Electiva Humanidades',
        fecha: 'Marzo 14, 2025',
        estado: 'Presente',
    },
];

const ESTADO_STYLES = {
    Presente: { bg: '#DFF7E6', text: '#1E9E5A' },
    Tardanza: { bg: '#FBEFD1', text: '#B07A1E' },
    Ausente: { bg: '#FBE1DE', text: '#C0392B' },
};

function EstadoPill({ estado }) {
    const { bg, text } = ESTADO_STYLES[estado];
    return (
        <View style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={[styles.pillText, { color: text }]}>{estado}</Text>
        </View>
    );
}

export default function Historial({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
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
                        <Text style={styles.statValueTeal}>
                            {resumen.asistenciaGeneral}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Clases Registradas</Text>
                        <Text style={styles.statValueDark}>
                            {resumen.clasesRegistradas}
                        </Text>
                    </View>
                </View>

                <View style={styles.filtersRow}>
                    {filtros.map((filtro, index) => (
                        <View
                            key={filtro}
                            style={[
                                styles.filterChip,
                                index === 0 && styles.filterChipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    index === 0 && styles.filterChipTextActive,
                                ]}
                            >
                                {filtro}
                            </Text>
                        </View>
                    ))}
                </View>

                {registros.map((registro) => (
                    <View key={registro.id} style={styles.recordCard}>
                        <View style={styles.recordTextBlock}>
                            <Text style={styles.recordTitle}>{registro.materia}</Text>
                            <Text style={styles.recordDate}>{registro.fecha}</Text>
                        </View>
                        <EstadoPill estado={registro.estado} />
                    </View>
                ))}
            </ScrollView>

            <BottomTabBar navigation={navigation} active="Historial" />
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
    filtersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 22,
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
    pill: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
