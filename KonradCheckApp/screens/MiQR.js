import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { QrGrid, RefreshIcon, bigQrMatrix } from './components/Icons';
import BottomTabBar from './components/BottomTabBar';

// Pantalla "Mi QR": solo maqueta visual con datos de ejemplo.

const ticketPorDefecto = {
    materia: 'ASISTENCIA GENERAL',
    nombre: 'Santiago Rincón',
    id: '22019483',
};

export default function MiQR({ navigation, route }) {
    const materia = route?.params?.materia ?? ticketPorDefecto.materia;
    const { nombre, id } = ticketPorDefecto;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
                <Text style={styles.materia}>{materia.toUpperCase()}</Text>
                <Text style={styles.title}>Ticket de asistencia</Text>

                <View style={styles.qrCard}>
                    <QrGrid matrix={bigQrMatrix} cellSize={9} />
                </View>

                <Text style={styles.nombre}>{nombre}</Text>
                <Text style={styles.id}>ID: {id}</Text>

                <View style={styles.refreshPill}>
                    <RefreshIcon color="#12A889" />
                    <Text style={styles.refreshText}>
                        El código se actualiza en 24s
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>Muestra este código al docente</Text>
                    <Text style={styles.footerSubtitle}>
                        El código se regenera automáticamente para evitar fraudes.
                    </Text>
                </View>
            </View>

            <BottomTabBar navigation={navigation} active="MiQR" />
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
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    materia: {
        color: '#12A889',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 10,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 28,
    },
    qrCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        marginBottom: 24,
        padding: 24,
    },
    nombre: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    id: {
        color: '#98A2B3',
        fontSize: 14,
        marginBottom: 20,
    },
    refreshPill: {
        alignItems: 'center',
        backgroundColor: '#D8F5EA',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 8,
        marginBottom: 48,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    refreshText: {
        color: '#12805A',
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
    },
    footerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    footerSubtitle: {
        color: '#98A2B3',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
});
