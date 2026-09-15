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

        // La respuesta de la BD determinara el destino segun el rol real.
        navigation.navigate('Reuniones');
    };

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

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Correo Institucional</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>@</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="usuario@konradlorenz.edu.co"
                                placeholderTextColor="#A0AEC0"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu contraseña"
                                placeholderTextColor="#A0AEC0"
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <Pressable style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    </Pressable>

                    <Pressable
                        style={styles.recoveryButton}
                        onPress={() => navigation.navigate('RecuperarContrasena')}
                    >
                        <Text style={styles.recoveryText}>
                            ¿Olvidé mi contraseña?
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.personalButton}
                        onPress={() => navigation.navigate('ReunionesPersonal')}
                    >
                        <Text style={styles.personalButtonText}>
                            Acceso docente / administrativo
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>Fundación Universitaria Konrad Lorenz</Text>
                    <Text style={styles.footerText}>© 2025 KonradCheck · Todos los derechos reservados</Text>
                    <View style={styles.homeIndicator} />
                </View>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#EEF3F8',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 36,
        paddingTop: 62,
        paddingBottom: 18,
    },
    header: {
        alignItems: 'center',
    },
    logoMark: {
        alignItems: 'center',
        backgroundColor: '#101A33',
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        marginBottom: 10,
        width: 48,
    },
    logoLetter: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    brand: {
        color: '#111A33',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 3,
    },
    subtitle: {
        color: '#718096',
        fontSize: 10,
    },
    form: {
        gap: 16,
        marginTop: 36,
    },
    field: {
        gap: 8,
    },
    label: {
        color: '#1F2937',
        fontSize: 10,
        fontWeight: '700',
    },
    inputWrapper: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        flexDirection: 'row',
        minHeight: 42,
        paddingHorizontal: 10,
    },
    inputIcon: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '700',
        marginRight: 8,
        textAlign: 'center',
        width: 16,
    },
    input: {
        color: '#1F2937',
        flex: 1,
        fontSize: 11,
        minHeight: 42,
        padding: 0,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#109A91',
        borderRadius: 7,
        justifyContent: 'center',
        minHeight: 42,
        marginTop: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    recoveryButton: {
        alignItems: 'center',
        marginTop: -2,
    },
    recoveryText: {
        color: '#109A91',
        fontSize: 10,
        fontWeight: '700',
    },
    personalButton: {
        alignItems: 'center',
        borderColor: '#CBD5E1',
        borderRadius: 7,
        borderWidth: 1,
        justifyContent: 'center',
        marginTop: 18,
        minHeight: 38,
    },
    personalButtonText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
    },
    footerTitle: {
        color: '#1F2937',
        fontSize: 8,
        fontWeight: '700',
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 7,
        marginTop: 5,
        textAlign: 'center',
    },
    homeIndicator: {
        backgroundColor: '#94A3B8',
        borderRadius: 4,
        height: 3,
        marginTop: 14,
        width: 72,
    },
});
