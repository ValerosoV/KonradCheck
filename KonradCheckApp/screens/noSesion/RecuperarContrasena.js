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
import { restablecerContrasena, solicitarRecuperacion } from '../../services/authService';

const PASOS = { CORREO: 'correo', CODIGO: 'codigo', LISTO: 'listo' };

export default function RecuperarContrasena({ navigation }) {
    const [paso, setPaso] = useState(PASOS.CORREO);
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState('');
    const [codigoDemo, setCodigoDemo] = useState(null);
    const [nueva, setNueva] = useState('');
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const enviar = async (accion) => {
        setError(null);
        setEnviando(true);
        try {
            await accion();
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const pedirCodigo = () => {
        if (!correo.includes('@')) {
            setError('Ingresa un correo institucional válido.');
            return;
        }
        enviar(async () => {
            const datos = await solicitarRecuperacion(correo);
            setCodigoDemo(datos.codigoDemo ?? null);
            setPaso(PASOS.CODIGO);
        });
    };

    const guardarContrasena = () => {
        if (nueva.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        enviar(async () => {
            await restablecerContrasena(correo, codigo, nueva);
            setPaso(PASOS.LISTO);
        });
    };

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

                    {paso === PASOS.CORREO && (
                        <>
                            <View style={styles.copy}>
                                <Text style={styles.title}>Recuperar contraseña</Text>
                                <Text style={styles.description}>
                                    Ingresa tu correo institucional y te enviaremos las instrucciones para recuperar tu acceso.
                                </Text>
                            </View>
                            <View style={styles.form}>
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
                                        value={correo}
                                        onChangeText={setCorreo}
                                        onSubmitEditing={pedirCodigo}
                                    />
                                </View>
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Pressable style={styles.button} onPress={pedirCodigo} disabled={enviando}>
                                    {enviando ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Enviar instrucciones</Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}

                    {paso === PASOS.CODIGO && (
                        <>
                            <View style={styles.copy}>
                                <Text style={styles.title}>Crea tu nueva contraseña</Text>
                                <Text style={styles.description}>
                                    Escribe el código de 6 dígitos y la contraseña que quieres usar. El código vence en 15 minutos.
                                </Text>
                            </View>
                            {codigoDemo && (
                                <View style={styles.demoBox}>
                                    <Text style={styles.demoLabel}>
                                        Modo demostración: no hay servidor de correo, este es tu código
                                    </Text>
                                    <Text style={styles.demoCode}>{codigoDemo}</Text>
                                </View>
                            )}
                            <View style={styles.form}>
                                <Text style={styles.label}>Código de verificación</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="000000"
                                        placeholderTextColor="#A0AEC0"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        value={codigo}
                                        onChangeText={setCodigo}
                                    />
                                </View>
                                <Text style={styles.label}>Nueva contraseña</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mínimo 8 caracteres"
                                        placeholderTextColor="#A0AEC0"
                                        secureTextEntry
                                        value={nueva}
                                        onChangeText={setNueva}
                                        onSubmitEditing={guardarContrasena}
                                    />
                                </View>
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Pressable style={styles.button} onPress={guardarContrasena} disabled={enviando}>
                                    {enviando ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Guardar contraseña</Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}

                    {paso === PASOS.LISTO && (
                        <View style={styles.copy}>
                            <Text style={styles.title}>¡Listo!</Text>
                            <Text style={styles.description}>
                                Tu contraseña se actualizó. Ya puedes iniciar sesión con ella.
                            </Text>
                        </View>
                    )}

                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        hitSlop={10}
                    >
                        <Text style={styles.backText}>Volver al inicio de sesión</Text>
                    </Pressable>
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
    flex: { flex: 1 },
    container: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 48,
        paddingBottom: 24,
    },
    header: { alignItems: 'center' },
    logoMark: { alignItems: 'center', backgroundColor: '#101A33', borderRadius: 14, height: 56, justifyContent: 'center', marginBottom: 12, width: 56 },
    logoLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
    brand: {
        color: '#111A33',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: { color: '#718096', fontSize: 13 },
    copy: { marginTop: 36 },
    title: {
        color: '#172B4D',
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 21,
    },
    form: { gap: 9, marginTop: 24 },
    label: {
        color: '#1F2937',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 4,
    },
    inputWrapper: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, flexDirection: 'row', minHeight: 48, paddingHorizontal: 12 },
    inputIcon: { color: '#64748B', fontSize: 16, fontWeight: '700', marginRight: 8, textAlign: 'center', width: 18 },
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
    demoBox: {
        alignItems: 'center',
        backgroundColor: '#D7F8F0',
        borderRadius: 10,
        gap: 6,
        marginTop: 20,
        padding: 14,
    },
    demoLabel: {
        color: '#087C71',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
        textAlign: 'center',
    },
    demoCode: {
        color: '#172B4D',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 4,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#109A91',
        borderRadius: 10,
        justifyContent: 'center',
        minHeight: 48,
        marginTop: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    backButton: {
        alignItems: 'center',
        marginTop: 22,
    },
    backText: {
        color: '#109A91',
        fontSize: 13,
        fontWeight: '700',
    },
});
