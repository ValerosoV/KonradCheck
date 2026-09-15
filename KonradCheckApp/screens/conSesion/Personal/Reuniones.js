import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { reunionesMock } from '../../../data/reunionesMock';
import BottomTabBarPersonal from './BottomTabBarPersonal';

const usuario = {
    nombre: 'Docente Konrad',
    iniciales: 'DK',
    rol: 'Docente',
    facultad: 'Facultad de Matematicas e Ingeniería',
};

export default function ReunionesPersonal({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Bienvenido Docente</Text>
                        <Text style={styles.userName}>{usuario.nombre}</Text>
                        <Text style={styles.userRole}>{usuario.facultad}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{usuario.iniciales}</Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => navigation.navigate('ProgramarReunion')}
                    style={styles.scheduleButton}
                >
                    <View style={styles.scheduleIcon}>
                        <Text style={styles.schedulePlus}>+</Text>
                    </View>
                    <View>
                        <Text style={styles.scheduleTitle}>Programar nueva reunión</Text>
                        <Text style={styles.scheduleSubtitle}>Crea un evento para tus estudiantes</Text>
                    </View>
                </Pressable>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mis reuniones</Text>
                    <Text style={styles.sectionLink}>Ver agenda</Text>
                </View>

                {reunionesMock.map((reunion) => (
                    <View key={reunion.titulo} style={styles.meetingCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardType}>{reunion.tipo}</Text>
                            <Text style={styles.status}>{reunion.estado}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{reunion.titulo}</Text>
                        <Text style={styles.cardSchedule}>
                            09:00 - 11:00 · {reunion.ubicacion}
                        </Text>
                        <View style={styles.divider} />
                        <Text style={styles.cardDescription}>Descripción</Text>
                        <Text style={styles.cardDetail}>{reunion.descripcion}</Text>
                        <Text style={styles.attendanceSummary}>♧ 28 / 35 Registrados</Text>
                        <Pressable
                            onPress={() => navigation.navigate('ReporteAsistencia', { reunion })}
                            style={styles.reportButton}
                        >
                            <Text style={styles.reportButtonText}>Consultar asistencia</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
            <BottomTabBarPersonal navigation={navigation} active="ReunionesPersonal" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20, paddingHorizontal: 22, paddingTop: 18 },
    headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    greeting: { color: '#344054', fontSize: 11, marginBottom: 3 },
    userName: { color: '#172B4D', fontSize: 18, fontWeight: '800', marginBottom: 4 },
    userRole: { color: '#98A2B3', fontSize: 10 },
    avatar: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    scheduleButton: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, flexDirection: 'row', marginBottom: 18, paddingHorizontal: 14, paddingVertical: 13 },
    scheduleIcon: { alignItems: 'center', backgroundColor: '#087C71', borderRadius: 14, height: 28, justifyContent: 'center', marginRight: 12, width: 28 },
    schedulePlus: { color: '#FFFFFF', fontSize: 22, fontWeight: '300', lineHeight: 24 },
    scheduleTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    scheduleSubtitle: { color: '#B7C0D1', fontSize: 9, marginTop: 4 },
    sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { color: '#172B4D', fontSize: 16, fontWeight: '800' },
    sectionLink: { color: '#07877B', fontSize: 10, fontWeight: '700' },
    meetingCard: { backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 12, padding: 12, shadowColor: '#172B4D', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
    cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    cardType: { color: '#12A889', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
    status: { backgroundColor: '#C9F6EA', borderRadius: 8, color: '#07877B', fontSize: 8, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 4 },
    cardTitle: { color: '#172B4D', fontSize: 13, fontWeight: '800', marginTop: 8 },
    cardSchedule: { color: '#667085', fontSize: 9, marginTop: 4 },
    divider: { backgroundColor: '#EEF1F5', height: 1, marginTop: 9 },
    cardDescription: { color: '#98A2B3', fontSize: 9, marginTop: 9 },
    cardDetail: { color: '#667085', fontSize: 9, marginTop: 3 },
    attendanceSummary: { color: '#344054', fontSize: 9, fontWeight: '700', marginTop: 9 },
    reportButton: { alignItems: 'center', backgroundColor: '#C9F6EA', borderRadius: 5, marginTop: 9, paddingVertical: 7 },
    reportButtonText: { color: '#07877B', fontSize: 9, fontWeight: '800' },
});
