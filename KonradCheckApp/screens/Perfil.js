import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import {
    BellIcon,
    KeyIcon,
    InfoIcon,
    QuestionIcon,
    ChevronIcon,
} from './components/Icons';
import BottomTabBar from './components/BottomTabBar';

// Pantalla de perfil: solo maqueta visual con datos de ejemplo.

const usuario = {
    nombre: 'David Gómez',
    iniciales: 'DG',
    correo: 'david.gomez@konradlorenz.edu.co',
    rol: 'Estudiante Pregrado',
};

const opciones = [
    {
        id: '1',
        Icon: BellIcon,
        titulo: 'Notificaciones de Asistencia',
        valor: 'Activadas',
    },
    {
        id: '2',
        Icon: KeyIcon,
        titulo: 'Cambiar Contraseña',
    },
    {
        id: '3',
        Icon: InfoIcon,
        titulo: 'Acerca de la Aplicación',
        valor: 'v1.4.2',
    },
    {
        id: '4',
        Icon: QuestionIcon,
        titulo: 'Soporte de Tecnología',
    },
];

export default function Perfil({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{usuario.iniciales}</Text>
                </View>
                <Text style={styles.nombre}>{usuario.nombre}</Text>
                <Text style={styles.correo}>{usuario.correo}</Text>
                <View style={styles.rolPill}>
                    <Text style={styles.rolText}>{usuario.rol}</Text>
                </View>

                <Text style={styles.sectionTitle}>Configuración General</Text>

                <View style={styles.card}>
                    {opciones.map((opcion, index) => (
                        <View
                            key={opcion.id}
                            style={[
                                styles.row,
                                index < opciones.length - 1 && styles.rowDivider,
                            ]}
                        >
                            <opcion.Icon color="#12A889" />
                            <Text style={styles.rowTitle}>{opcion.titulo}</Text>
                            {opcion.valor && (
                                <Text style={styles.rowValue}>{opcion.valor}</Text>
                            )}
                            <ChevronIcon color="#98A2B3" />
                        </View>
                    ))}
                </View>

                <View style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Cerrar Sesión Activa</Text>
                </View>
            </ScrollView>

            <BottomTabBar navigation={navigation} active="Perfil" />
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
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    avatar: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 44,
        height: 88,
        justifyContent: 'center',
        marginBottom: 20,
        width: 88,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    nombre: {
        color: '#172B4D',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 6,
    },
    correo: {
        color: '#667085',
        fontSize: 14,
        marginBottom: 14,
    },
    rolPill: {
        backgroundColor: '#DFF7E6',
        borderRadius: 20,
        marginBottom: 32,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    rolText: {
        color: '#1E9E5A',
        fontSize: 13,
        fontWeight: '700',
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        color: '#172B4D',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 28,
        paddingHorizontal: 18,
        shadowColor: '#172B4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
        width: '100%',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 16,
    },
    rowDivider: {
        borderBottomColor: '#EEF1F5',
        borderBottomWidth: 1,
    },
    rowTitle: {
        color: '#172B4D',
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
    },
    rowValue: {
        color: '#98A2B3',
        fontSize: 14,
    },
    logoutButton: {
        alignItems: 'center',
        backgroundColor: '#FBE1DE',
        borderRadius: 14,
        paddingVertical: 16,
        width: '100%',
    },
    logoutText: {
        color: '#C0392B',
        fontSize: 15,
        fontWeight: '700',
    },
});
