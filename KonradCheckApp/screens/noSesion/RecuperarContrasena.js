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
                <Text style={styles.brand}>KonradCheck</Text>
                <Text style={styles.title}>Recuperar contraseña</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu correo y te ayudaremos a recuperar el acceso.
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="tucorreo@konradlorenz.edu.co"
                        placeholderTextColor="#8A94A6"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

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
        backgroundColor: '#F4F7FB',
    },
    container: {
        flex: 1,
        padding: 28,
        paddingTop: 72,
    },
    brand: {
        color: '#176B87',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 32,
    },
    title: {
        color: '#172B4D',
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 12,
    },
    subtitle: {
        color: '#667085',
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        gap: 12,
        marginTop: 36,
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
        marginTop: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    backButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    backText: {
        color: '#176B87',
        fontSize: 14,
        fontWeight: '700',
    },
});
