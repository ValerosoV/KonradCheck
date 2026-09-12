import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MenuNavegacion from '../components/MenuNavegacion';

export default function PerfilUsuario({ navigation }) {
    const cerrarSesion = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Mi perfil</Text>
                    <MenuNavegacion navigation={navigation} />
                </View>
                <View style={styles.card}>
                    <Text style={styles.name}>Usuario Konrad</Text>
                    <Text style={styles.detail}>correo@konradlorenz.edu.co</Text>
                    <Text style={styles.detail}>Rol: usuario de la aplicacion</Text>
                    <Pressable onPress={cerrarSesion} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Cerrar sesion</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { flex: 1, padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', fontSize: 30, fontWeight: '800' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 10, marginTop: 28, padding: 20 },
    name: { color: '#172B4D', fontSize: 20, fontWeight: '800' },
    detail: { color: '#667085', fontSize: 15, marginTop: 12 },
    logoutButton: { alignItems: 'center', borderColor: '#B42318', borderRadius: 8, borderWidth: 1, marginTop: 24, padding: 13 },
    logoutText: { color: '#B42318', fontSize: 14, fontWeight: '700' },
});
