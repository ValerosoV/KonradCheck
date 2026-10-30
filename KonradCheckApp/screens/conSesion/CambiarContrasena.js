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
import { cambiarContrasena } from '../../services/authService';

const CAMPOS_VACIOS = { actual: '', nueva: '', confirmacion: '' };

export default function CambiarContrasena({ navigation }) {
    const [campos, setCampos] = useState(CAMPOS_VACIOS);
    const [error, setError] = useState(null);
    const [listo, setListo] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const actualizar = (campo) => (valor) => {
        setCampos((previos) => ({ ...previos, [campo]: valor }));
        setListo(false);
    };

    const guardar = async () => {
        if (!campos.actual) {
            setError('Ingresa tu contraseña actual.');
            return;
        }
        if (campos.nueva.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (campos.nueva !== campos.confirmacion) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }
        setError(null);
        setEnviando(true);
        try {
            await cambiarContrasena(campos.actual, campos.nueva);
            setCampos(CAMPOS_VACIOS);
            setListo(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver a Perfil"
                        onPress={() => navigation.navigate('Perfil')}
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                        <Text style={styles.backText}>Cambiar contraseña</Text>
                    </Pressable>

                    <View style={styles.form}>
                        <Text style={styles.label}>Contraseña actual</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={campos.actual}
                            onChangeText={actualizar('actual')}
                        />
                        <Text style={styles.label}>Nueva contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor="#9AA8BA"
                            secureTextEntry
                            value={campos.nueva}
                            onChangeText={actualizar('nueva')}
                        />
                        <Text style={styles.label}>Confirmar nueva contraseña</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={campos.confirmacion}
                            onChangeText={actualizar('confirmacion')}
                            onSubmitEditing={guardar}
                        />

                        {error && <Text style={styles.error}>{error}</Text>}
                        {listo && <Text style={styles.exito}>Tu contraseña se actualizó.</Text>}

                        <Pressable style={styles.button} onPress={guardar} disabled={enviando}>
                            {enviando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Guardar contraseña</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    flex: { flex: 1 },
    container: { paddingBottom: 24, paddingHorizontal: 22, paddingTop: 14 },
    backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginBottom: 20 },
    backIcon: { color: '#172B4D', fontSize: 30, lineHeight: 30, marginRight: 8 },
    backText: { color: '#172B4D', fontSize: 18, fontWeight: '800' },
    form: { gap: 9 },
    label: { color: '#172B4D', fontSize: 13, fontWeight: '800', marginTop: 6 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 10, color: '#172B4D', fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
    error: { color: '#C0392B', fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 4 },
    exito: { color: '#1E9E5A', fontSize: 13, fontWeight: '700', marginTop: 4 },
    button: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 10, justifyContent: 'center', marginTop: 14, minHeight: 48 },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
