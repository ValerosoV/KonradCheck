import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CambiarContrasena({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.container}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Volver a Perfil"
                    onPress={() => navigation.navigate('Perfil')}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>‹</Text>
                    <Text style={styles.backText}>Cambiar contraseña</Text>
                </Pressable>
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>
                        El cambio de contraseña estará disponible en una siguiente etapa.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    container: { paddingBottom: 24, paddingHorizontal: 22, paddingTop: 14 },
    backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginBottom: 20 },
    backIcon: { color: '#172B4D', fontSize: 30, lineHeight: 30, marginRight: 8 },
    backText: { color: '#172B4D', fontSize: 18, fontWeight: '800' },
    notice: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 12, padding: 16 },
    noticeText: { color: '#667085', fontSize: 14, lineHeight: 21 },
});
