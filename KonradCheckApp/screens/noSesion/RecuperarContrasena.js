import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
} from 'react-native';

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
                        />
                    </View>

                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Enviar instrucciones</Text>
                    </Pressable>

                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>Volver al inicio de sesión</Text>
                    </Pressable>
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
        paddingHorizontal: 36,
        paddingTop: 62,
    },
    header: { alignItems: 'center' },
    logoMark: { alignItems: 'center', backgroundColor: '#101A33', borderRadius: 12, height: 48, justifyContent: 'center', marginBottom: 10, width: 48 },
    logoLetter: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    brand: {
        color: '#111A33',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 3,
    },
    subtitle: { color: '#718096', fontSize: 10 },
    copy: { marginTop: 52 },
    title: {
        color: '#172B4D',
        fontSize: 27,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 21,
    },
    form: { gap: 9, marginTop: 32 },
    label: {
        color: '#1F2937',
        fontSize: 10,
        fontWeight: '700',
    },
    inputWrapper: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, flexDirection: 'row', minHeight: 42, paddingHorizontal: 10 },
    inputIcon: { color: '#64748B', fontSize: 15, fontWeight: '700', marginRight: 8, textAlign: 'center', width: 16 },
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
        marginTop: 14,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    backButton: {
        alignItems: 'center',
        marginTop: 14,
    },
    backText: {
        color: '#109A91',
        fontSize: 10,
        fontWeight: '700',
    },
});
