import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const CLAVE_DEMO = 'Konrad123';

const CUENTAS_DEMO = [
    { etiqueta: 'Estudiante', correo: 'david.gomez@konradlorenz.edu.co' },
    { etiqueta: 'Docente', correo: 'armando.casas@konradlorenz.edu.co' },
];

export default function Login({ navigation }) {
    const { entrar, aviso } = useAuth();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const handleLogin = async () => {
        if (!correo.trim() || !contrasena) {
            setError('Ingresa tu correo institucional y tu contraseña.');
            return;
        }
        setError(null);
        setEnviando(true);
        try {
            // Al recibir el usuario, App.js cambia al area que corresponde a su rol.
            await entrar(correo, contrasena);
        } catch (e) {
            setError(e.message);
            setEnviando(false);
        }
    };

    const usarCuentaDemo = (cuenta) => {
        setCorreo(cuenta.correo);
        setContrasena(CLAVE_DEMO);
        setError(null);
    };

    const mensaje = error ?? aviso;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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
                                    autoCorrect={false}
                                    autoComplete="email"
                                    value={correo}
                                    onChangeText={setCorreo}
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
                                    autoComplete="password"
                                    value={contrasena}
                                    onChangeText={setContrasena}
                                    onSubmitEditing={handleLogin}
                                />
                            </View>
                        </View>

                        {mensaje && <Text style={styles.error}>{mensaje}</Text>}

                        <Pressable style={styles.button} onPress={handleLogin} disabled={enviando}>
                            {enviando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                            )}
                        </Pressable>

                        <Pressable
                            style={styles.recoveryButton}
                            onPress={() => navigation.navigate('RecuperarContrasena')}
                            hitSlop={10}
                        >
                            <Text style={styles.recoveryText}>¿Olvidé mi contraseña?</Text>
                        </Pressable>

                        <View style={styles.demoBox}>
                            <Text style={styles.demoTitle}>Cuentas de demostración</Text>
                            <View style={styles.demoRow}>
                                {CUENTAS_DEMO.map((cuenta) => (
                                    <Pressable
                                        key={cuenta.correo}
                                        style={styles.demoButton}
                                        onPress={() => usarCuentaDemo(cuenta)}
                                    >
                                        <Text style={styles.demoButtonText}>{cuenta.etiqueta}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerTitle}>Fundación Universitaria Konrad Lorenz</Text>
                        <Text style={styles.footerText}>© 2026 KonradCheck · Proyecto académico</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#EEF3F8',
    },
    flex: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingTop: 48,
        paddingBottom: 18,
    },
    header: {
        alignItems: 'center',
    },
    logoMark: {
        alignItems: 'center',
        backgroundColor: '#101A33',
        borderRadius: 14,
        height: 56,
        justifyContent: 'center',
        marginBottom: 12,
        width: 56,
    },
    logoLetter: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
    },
    brand: {
        color: '#111A33',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        color: '#718096',
        fontSize: 13,
    },
    form: {
        gap: 16,
        marginTop: 32,
    },
    field: {
        gap: 8,
    },
    label: {
        color: '#1F2937',
        fontSize: 13,
        fontWeight: '700',
    },
    inputWrapper: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        flexDirection: 'row',
        minHeight: 48,
        paddingHorizontal: 12,
    },
    inputIcon: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
        textAlign: 'center',
        width: 18,
    },
    input: {
        color: '#1F2937',
        flex: 1,
        fontSize: 16,
        minHeight: 48,
        minWidth: 0,
        padding: 0,
    },
    error: {
        color: '#C0392B',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#109A91',
        borderRadius: 10,
        justifyContent: 'center',
        minHeight: 48,
        marginTop: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    recoveryButton: {
        alignItems: 'center',
    },
    recoveryText: {
        color: '#109A91',
        fontSize: 13,
        fontWeight: '700',
    },
    demoBox: {
        borderColor: '#CBD5E1',
        borderRadius: 10,
        borderWidth: 1,
        gap: 10,
        marginTop: 8,
        padding: 12,
    },
    demoTitle: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    demoRow: {
        flexDirection: 'row',
        gap: 8,
    },
    demoButton: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        flex: 1,
        paddingVertical: 10,
    },
    demoButtonText: {
        color: '#087C71',
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 28,
    },
    footerTitle: {
        color: '#1F2937',
        fontSize: 12,
        fontWeight: '700',
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
});
