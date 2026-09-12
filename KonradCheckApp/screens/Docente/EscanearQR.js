import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MenuNavegacion from '../../components/MenuNavegacion';

export default function EscanearQR({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Escanear QR</Text>
                    <MenuNavegacion navigation={navigation} />
                </View>
                <View style={styles.scannerPlaceholder}>
                    <Text style={styles.scannerText}>Camara</Text>
                    <Text style={styles.helper}>Aqui se integrara el lector QR.</Text>
                </View>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Abrir camara</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { flex: 1, padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', fontSize: 28, fontWeight: '800' },
    scannerPlaceholder: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#176B87', borderWidth: 2, height: 280, justifyContent: 'center', marginTop: 36 },
    scannerText: { color: '#172B4D', fontSize: 28, fontWeight: '800' },
    helper: { color: '#667085', fontSize: 14, marginTop: 12 },
    button: { alignItems: 'center', backgroundColor: '#176B87', borderRadius: 8, marginTop: 24, padding: 15 },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
