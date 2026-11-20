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

export default function RecuperarContrasena({ navigation }) {
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [paso, setPaso] = useState('correo');
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const enviarCodigo = async () => {
        if (!correo.trim()) {
            setError('Ingresa tu correo institucional.');
            return;
        }
        setError(null);
        setMensaje(null);
        setEnviando(true);
        try {
            const respuesta = await solicitarRecuperacion(correo.trim());
            setPaso('codigo');
            setMensaje(respuesta.mensaje);
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const actualizarContrasena = async () => {
        if (!/^\d{6}$/.test(codigo.trim())) {
            setError('Ingresa el código de seis dígitos que recibiste.');
            return;
        }
        if (nuevaContrasena.length < 8 || nuevaContrasena.length > 128) {
            setError('La contraseña debe tener entre 8 y 128 caracteres.');
            return;
        }
        if (nuevaContrasena !== confirmacion) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setError(null);
        setMensaje(null);
        setEnviando(true);
        try {
            const respuesta = await restablecerContrasena(correo.trim(), codigo.trim(), nuevaContrasena);
            setPaso('completa');
            setMensaje(respuesta.mensaje);
            setCodigo('');
            setNuevaContrasena('');
            setConfirmacion('');
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const reenviarCodigo = async () => {
        setError(null);
        setMensaje(null);
        setEnviando(true);
        try {
            const respuesta = await solicitarRecuperacion(correo.trim());
            setMensaje(respuesta.mensaje);
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const completada = paso === 'completa';

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
                        <Text style={styles.title}>Recuperar contraseña</Text>

                        {paso === 'correo' && (
                            <>
                                <Text style={styles.description}>
                                    Ingresa tu correo institucional. Si la cuenta puede iniciar sesión, enviaremos
                                    un código de verificación.
                                </Text>
                                <Text style={styles.label}>Correo institucional</Text>
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
                                    editable={!enviando}
                                />
                            </>
                        )}

                        {paso === 'codigo' && (
                            <>
                                <Text style={styles.description}>
                                    Ingresa el código enviado a {correo}. Vence en 10 minutos y solo puede usarse
                                    una vez.
                                </Text>
                                <Text style={styles.label}>Código de seis dígitos</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="000000"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="number-pad"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={codigo}
                                    onChangeText={setCodigo}
                                    editable={!enviando}
                                />
                                <Text style={styles.label}>Nueva contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo 8 caracteres"
                                    placeholderTextColor="#A0AEC0"
                                    secureTextEntry
                                    autoComplete="new-password"
                                    maxLength={128}
                                    value={nuevaContrasena}
                                    onChangeText={setNuevaContrasena}
                                    editable={!enviando}
                                />
                                <Text style={styles.label}>Confirmar contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repite la nueva contraseña"
                                    placeholderTextColor="#A0AEC0"
                                    secureTextEntry
                                    autoComplete="new-password"
                                    maxLength={128}
                                    value={confirmacion}
                                    onChangeText={setConfirmacion}
                                    editable={!enviando}
                                />
                                <Pressable onPress={reenviarCodigo} disabled={enviando} hitSlop={8}>
                                    <Text style={styles.link}>Solicitar otro código</Text>
                                </Pressable>
                            </>
                        )}

                        {mensaje && <Text style={styles.message}>{mensaje}</Text>}
                        {error && <Text style={styles.error}>{error}</Text>}

                        {!completada && (
                            <Pressable
                                style={[styles.button, enviando && styles.buttonDisabled]}
                                onPress={paso === 'correo' ? enviarCodigo : actualizarContrasena}
                                disabled={enviando}
                            >
                                {enviando ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {paso === 'correo' ? 'Enviar código' : 'Actualizar contraseña'}
                                    </Text>
                                )}
                            </Pressable>
                        )}

                        <Pressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            disabled={enviando}
                            hitSlop={8}
                        >
                            <Text style={styles.link}>
                                {completada ? 'Volver al inicio de sesión' : 'Cancelar y volver'}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#EEF3F8', flex: 1 },
    flex: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 48, paddingBottom: 24 },
    header: { alignItems: 'center' },
    logoMark: { alignItems: 'center', backgroundColor: '#101A33', borderRadius: 14, height: 56, justifyContent: 'center', marginBottom: 12, width: 56 },
    logoLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
    brand: { color: '#111A33', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    subtitle: { color: '#718096', fontSize: 13 },
    form: { gap: 12, marginTop: 36 },
    title: { color: '#172B4D', fontSize: 26, fontWeight: '800', marginBottom: 4 },
    description: { color: '#667085', fontSize: 14, lineHeight: 21, marginBottom: 8 },
    label: { color: '#1F2937', fontSize: 13, fontWeight: '700' },
    input: { backgroundColor: '#FFFFFF', borderRadius: 10, color: '#1F2937', fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
    message: { color: '#475569', fontSize: 13, lineHeight: 18 },
    error: { color: '#C0392B', fontSize: 13, fontWeight: '600', lineHeight: 18 },
    button: { alignItems: 'center', backgroundColor: '#109A91', borderRadius: 10, justifyContent: 'center', minHeight: 48, marginTop: 4 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    backButton: { alignItems: 'center', paddingVertical: 8 },
    link: { color: '#109A91', fontSize: 13, fontWeight: '700' },
});
