import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecuperarContrasena({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.logoMark}>
                        <Text style={styles.logoLetter}>K</Text>
                    </View>
                    <Text style={styles.brand}>KonradCheck</Text>
                    <Text style={styles.subtitle}>Portal de Asistencia Universitaria</Text>
                </View>
                <View style={styles.copy}>
                    <Text style={styles.title}>Recuperar contraseña</Text>
                    <Text style={styles.description}>
                        La recuperación de contraseña estará disponible en una siguiente etapa.
                        Puedes ingresar con una cuenta de demostración desde el inicio de sesión.
                    </Text>
                </View>
                <Pressable style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#EEF3F8', flex: 1 },
    container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 48, paddingBottom: 24 },
    header: { alignItems: 'center' },
    logoMark: { alignItems: 'center', backgroundColor: '#101A33', borderRadius: 14, height: 56, justifyContent: 'center', marginBottom: 12, width: 56 },
    logoLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
    brand: { color: '#111A33', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    subtitle: { color: '#718096', fontSize: 13 },
    copy: { marginTop: 36 },
    title: { color: '#172B4D', fontSize: 26, fontWeight: '800', marginBottom: 12 },
    description: { color: '#667085', fontSize: 14, lineHeight: 21 },
    button: { alignItems: 'center', backgroundColor: '#109A91', borderRadius: 10, justifyContent: 'center', minHeight: 48 },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
