import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MenuNavegacion from '../../components/MenuNavegacion';

export default function MostrarQR({ navigation, route }) {
    const reunion = route.params?.reunion;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Mostrar QR</Text>
                    <MenuNavegacion navigation={navigation} />
                </View>
                <Text style={styles.subtitle}>{reunion?.titulo || 'Reunion seleccionada'}</Text>
                <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrText}>QR</Text>
                </View>
                <Text style={styles.helper}>Aqui se mostrara el codigo QR de la reunion.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { flex: 1, padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', fontSize: 28, fontWeight: '800' },
    subtitle: { color: '#667085', fontSize: 16, marginTop: 28 },
    qrPlaceholder: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#FFFFFF', borderColor: '#172B4D', borderWidth: 4, height: 220, justifyContent: 'center', marginTop: 36, width: 220 },
    qrText: { color: '#172B4D', fontSize: 42, fontWeight: '800' },
    helper: { color: '#667085', fontSize: 14, marginTop: 20, textAlign: 'center' },
});
