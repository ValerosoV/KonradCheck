import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { reiniciarDatosDemo } from '../../services/apiSimulada';
import {
    RefreshIcon,
    KeyIcon,
    InfoIcon,
    QuestionIcon,
    ChevronIcon,
} from '../components/Icons';

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

const HOJAS = {
    acerca: {
        titulo: 'Acerca de la Aplicación',
        parrafos: [
            'KonradCheck registra la asistencia a clases y reuniones de la Fundación Universitaria Konrad Lorenz con tickets QR dinámicos, como los de un concierto.',
            'Cada estudiante tiene un ticket por clase. Su código cambia cada 5 segundos y deja de servir en máximo 10, así que una captura o un reenvío no registra la asistencia.',
            `Versión ${VERSION}. Proyecto académico de Desarrollo de Aplicaciones Móviles, Grupo 8.`,
        ],
    },
    soporte: {
        titulo: 'Soporte de Tecnología',
        parrafos: [
            'No veo mi QR: el ticket se activa 15 minutos antes de la clase y solo aparece si estás en la lista de esa reunión.',
            'El escáner rechaza mi código: abre el ticket de nuevo desde la app. Los códigos vencidos y las capturas no sirven.',
            'Se cerró mi sesión: un estudiante solo puede tener su ticket en una sesión. Al entrar de nuevo, se cierra la anterior.',
        ],
    },
    reiniciar: {
        titulo: 'Reiniciar datos de prueba',
        parrafos: [
            'Se borran las asistencias registradas y las reuniones que hayas creado, y se vuelve a crear una clase en curso. Se cerrará tu sesión.',
        ],
        accion: 'Reiniciar datos',
    },
};

export default function Perfil({ navigation }) {
    const { usuario, salir } = useAuth();
    const [hoja, setHoja] = useState(null);

    const iniciales = usuario.nombre
        .split(' ')
        .filter((parte) => parte.length > 3)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();

    const opciones = [
        {
            id: 'contrasena',
            Icon: KeyIcon,
            titulo: 'Cambiar Contraseña',
            onPress: () => navigation.navigate('CambiarContrasena'),
        },
        {
            id: 'acerca',
            Icon: InfoIcon,
            titulo: 'Acerca de la Aplicación',
            valor: `v${VERSION}`,
            onPress: () => setHoja(HOJAS.acerca),
        },
        {
            id: 'soporte',
            Icon: QuestionIcon,
            titulo: 'Soporte de Tecnología',
            onPress: () => setHoja(HOJAS.soporte),
        },
        {
            id: 'reiniciar',
            Icon: RefreshIcon,
            titulo: 'Reiniciar datos de prueba',
            onPress: () => setHoja(HOJAS.reiniciar),
        },
    ];

    // Se sale primero para que ninguna pantalla consulte datos sin sesion.
    const reiniciarDatos = async () => {
        setHoja(null);
        await salir();
        reiniciarDatosDemo();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{iniciales}</Text>
                </View>
                <Text style={styles.nombre}>{usuario.nombre}</Text>
                <Text style={styles.correo}>{usuario.correo}</Text>
                <View style={styles.rolPill}>
                    <Text style={styles.rolText}>{usuario.detalle}</Text>
                </View>

                <Text style={styles.sectionTitle}>Configuración General</Text>

                <View style={styles.card}>
                    {opciones.map((opcion, index) => (
                        <Pressable
                            key={opcion.id}
                            accessibilityRole="button"
                            onPress={opcion.onPress}
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
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.logoutButton} onPress={salir}>
                    <Text style={styles.logoutText}>Cerrar Sesión Activa</Text>
                </Pressable>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent
                visible={!!hoja}
                onRequestClose={() => setHoja(null)}
            >
                <Pressable style={styles.hojaFondo} onPress={() => setHoja(null)}>
                    <Pressable style={styles.hoja}>
                        <Text style={styles.hojaTitulo}>{hoja?.titulo}</Text>
                        {hoja?.parrafos.map((parrafo) => (
                            <Text key={parrafo} style={styles.hojaTexto}>{parrafo}</Text>
                        ))}
                        {hoja?.accion && (
                            <Pressable style={styles.hojaBotonPeligro} onPress={reiniciarDatos}>
                                <Text style={styles.hojaBotonPeligroTexto}>{hoja.accion}</Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.hojaBoton} onPress={() => setHoja(null)}>
                            <Text style={styles.hojaBotonTexto}>{hoja?.accion ? 'Cancelar' : 'Entendido'}</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
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
        textAlign: 'center',
    },
    correo: {
        color: '#667085',
        fontSize: 14,
        marginBottom: 14,
        textAlign: 'center',
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
    hojaFondo: {
        backgroundColor: 'rgba(14, 23, 45, 0.55)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    hoja: {
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        gap: 12,
        maxWidth: 480,
        padding: 24,
        paddingBottom: 32,
        width: '100%',
    },
    hojaTitulo: {
        color: '#172B4D',
        fontSize: 19,
        fontWeight: '800',
    },
    hojaTexto: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 21,
    },
    hojaBotonPeligro: {
        alignItems: 'center',
        backgroundColor: '#FBE1DE',
        borderRadius: 12,
        marginTop: 8,
        paddingVertical: 14,
    },
    hojaBotonPeligroTexto: {
        color: '#C0392B',
        fontSize: 15,
        fontWeight: '700',
    },
    hojaBoton: {
        alignItems: 'center',
        backgroundColor: '#12A889',
        borderRadius: 12,
        marginTop: 8,
        paddingVertical: 14,
    },
    hojaBotonTexto: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
