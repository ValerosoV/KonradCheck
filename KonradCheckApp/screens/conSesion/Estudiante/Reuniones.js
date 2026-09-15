import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';
import { QrGrid, PinIcon, QrIcon, miniQrMatrix } from '../../components/Icons';
import BottomTabBar from './BottomTabBar';

// Pantalla de inicio: solo maqueta visual con datos de ejemplo,
// la navegacion entre pestanas si funciona.

const usuario = {
    nombre: 'David Gómez',
    iniciales: 'DG',
    codigo: '22019483',
};

const clases = [
    {
        id: '1',
        materia: 'Arquitectura de Software',
        horario: '07:00 - 09:00',
        lugar: 'Salón 402, Edificio Central',
        estado: 'Presente',
    },
    {
        id: '2',
        materia: 'Sistemas Operativos',
        horario: '09:00 - 11:00',
        lugar: 'Salón 103, Laboratorio',
        estado: 'Pendiente',
    },
    {
        id: '3',
        materia: 'Cálculo Multivariable',
        horario: '11:00 - 13:00',
        lugar: 'Salón 301, Edificio Central',
        estado: 'Pendiente',
    },
];

function EstadoPill({ estado }) {
    const esPresente = estado === 'Presente';
    return (
        <View
            style={[
                styles.pill,
                { backgroundColor: esPresente ? '#DFF7E6' : '#FBEFD1' },
            ]}
        >
            <Text
                style={[
                    styles.pillText,
                    { color: esPresente ? '#1E9E5A' : '#B07A1E' },
                ]}
            >
                {estado}
            </Text>
        </View>
    );
}

export default function Reuniones({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>¡Hola de nuevo!</Text>
                        <Text style={styles.userName}>{usuario.nombre}</Text>
                        <Text style={styles.userCode}>Código: {usuario.codigo}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{usuario.iniciales}</Text>
                    </View>
                </View>

                <View style={styles.attendanceCard}>
                    <View style={styles.attendanceTextBlock}>
                        <Text style={styles.attendanceTitle}>Asistencia rápida</Text>
                        <Text style={styles.attendanceSubtitle}>
                            Muestra tu código QR dinámico para registrar tu entrada.
                        </Text>
                    </View>
                    <Pressable
                        style={styles.qrCard}
                        onPress={() => navigation.navigate('MiQR')}
                    >
                        <Text style={styles.qrLabel}>STUDENT ATTENDANCE</Text>
                        <QrGrid matrix={miniQrMatrix} cellSize={3.5} />
                    </Pressable>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Clases de Hoy</Text>
                    <Text style={styles.sectionLink}>Ver todas</Text>
                </View>

                {clases.map((clase) => (
                    <View key={clase.id} style={styles.classCard}>
                        <View style={styles.classHeaderRow}>
                            <Text style={styles.classTitle}>{clase.materia}</Text>
                            <EstadoPill estado={clase.estado} />
                        </View>
                        <Text style={styles.classTime}>{clase.horario}</Text>

                        <View style={styles.divider} />

                        <View style={styles.classFooterRow}>
                            <View style={styles.classLocationRow}>
                                <PinIcon color="#12A889" />
                                <Text style={styles.classLocation}>{clase.lugar}</Text>
                            </View>
                            <Pressable
                                style={styles.qrButton}
                                onPress={() =>
                                    navigation.navigate('MiQR', { materia: clase.materia })
                                }
                            >
                                <QrIcon color="#12A889" />
                                <Text style={styles.qrButtonText}>QR</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <BottomTabBar navigation={navigation} active="Reuniones" />
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
    qrLabel: {
        color: '#98A2B3',
        fontSize: 6,
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
    pill: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '700',
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
});
