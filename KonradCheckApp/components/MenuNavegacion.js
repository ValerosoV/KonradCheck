import { useState } from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const menuItems = [
    { label: 'Reuniones de estudiante', route: 'ReunionesEstudiante' },
    { label: 'Reuniones de docente', route: 'ReunionesDocente' },
    { label: 'Programar reunion', route: 'ProgramarReunion' },
    { label: 'Reportes de asistencia', route: 'ReporteAsistencia' },
    { label: 'Escanear QR', route: 'EscanearQR' },
    { label: 'Mi perfil', route: 'PerfilUsuario' },
];

export default function MenuNavegacion({ navigation }) {
    const [visible, setVisible] = useState(false);

    const navegar = (route) => {
        setVisible(false);
        navigation.navigate(route);
    };

    const cerrarSesion = () => {
        setVisible(false);
        navigation.navigate('Login');
    };

    return (
        <>
            <Pressable
                accessibilityLabel="Abrir menu de navegacion"
                onPress={() => setVisible(true)}
                style={styles.menuButton}
            >
                <Text style={styles.menuButtonText}>Menu</Text>
            </Pressable>

            <Modal
                animationType="slide"
                onRequestClose={() => setVisible(false)}
                transparent
                visible={visible}
            >
                <SafeAreaView style={styles.overlay}>
                    <View style={styles.drawer}>
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>KonradCheck</Text>
                            <Pressable onPress={() => setVisible(false)}>
                                <Text style={styles.closeText}>Cerrar</Text>
                            </Pressable>
                        </View>

                        {menuItems.map((item) => (
                            <Pressable
                                key={item.route}
                                onPress={() => navegar(item.route)}
                                style={styles.menuItem}
                            >
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </Pressable>
                        ))}

                        <Pressable
                            onPress={cerrarSesion}
                            style={[styles.menuItem, styles.logoutItem]}
                        >
                            <Text style={styles.logoutText}>Cerrar sesion</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        backgroundColor: '#176B87',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    menuButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    overlay: {
        backgroundColor: 'rgba(23, 43, 77, 0.28)',
        flex: 1,
    },
    drawer: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        maxWidth: 340,
        padding: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    drawerHeader: {
        alignItems: 'center',
        borderBottomColor: '#EAECF0',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 18,
    },
    drawerTitle: {
        color: '#172B4D',
        fontSize: 20,
        fontWeight: '800',
    },
    closeText: {
        color: '#667085',
        fontSize: 14,
        fontWeight: '700',
    },
    menuItem: {
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    menuItemText: {
        color: '#344054',
        fontSize: 15,
        fontWeight: '600',
    },
    logoutItem: {
        marginTop: 18,
    },
    logoutText: {
        color: '#B42318',
        fontSize: 15,
        fontWeight: '700',
    },
});
