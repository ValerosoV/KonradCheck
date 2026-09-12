import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
} from 'react-native';

// Futuro servicio de autenticacion:
// import { validarCredenciales } from '../../services/authService';

export default function Login({ navigation }) {

    const handleLogin = () => {
        // Futuro flujo con BD:
        // const usuarioValido = await validarCredenciales(correo, contrasena);
        // if (!usuarioValido) return;

        navigation.navigate('ReunionesEstudiante');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.brand}>KonradCheck</Text>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>
                        Ingresa tus datos para continuar
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="tucorreo@konradlorenz.edu.co"
                            placeholderTextColor="#8A94A6"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu contraseña"
                            placeholderTextColor="#8A94A6"
                            secureTextEntry
                        />
                    </View>

                    <Pressable style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Iniciar sesión</Text>
                    </Pressable>

                    <Pressable
                        style={styles.recoveryButton}
                        onPress={() => navigation.navigate('RecuperarContrasena')}
                    >
                        <Text style={styles.recoveryText}>
                            ¿Olvidaste tu contraseña?
                        </Text>
                    </Pressable>
                </View>

                <Text style={styles.footer}>Universidad Konrad Lorenz</Text>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7FB',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingVertical: 44,
    },
    header: {
        marginTop: 36,
    },
    brand: {
        color: '#176B87',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 28,
    },
    title: {
        color: '#172B4D',
        fontSize: 34,
        fontWeight: '800',
        marginBottom: 10,
    },
    subtitle: {
        color: '#667085',
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        gap: 20,
        marginTop: 36,
    },
    field: {
        gap: 8,
    },
    label: {
        color: '#344054',
        fontSize: 14,
        fontWeight: '700',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D0D5DD',
        borderRadius: 10,
        borderWidth: 1,
        color: '#172B4D',
        fontSize: 16,
        minHeight: 54,
        paddingHorizontal: 16,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#176B87',
        borderRadius: 10,
        justifyContent: 'center',
        minHeight: 54,
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    recoveryButton: {
        alignItems: 'center',
    },
    recoveryText: {
        color: '#176B87',
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        color: '#98A2B3',
        fontSize: 12,
        textAlign: 'center',
    },
});
