import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MenuNavegacion from '../../components/MenuNavegacion';

export default function ReporteAsistencia({ navigation, route }) {
    const reunion = route.params?.reunion;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de asistencia</Text>
                    <MenuNavegacion navigation={navigation} />
                </View>
                <Text style={styles.subtitle}>{reunion?.titulo || 'Reunion seleccionada'}</Text>
                <View style={styles.card}>
                    <Text style={styles.metric}>0</Text>
                    <Text style={styles.label}>Asistentes registrados</Text>
                    <Text style={styles.helper}>El reporte se conectara a la BD posteriormente.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { flex: 1, padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', flex: 1, fontSize: 26, fontWeight: '800', marginRight: 12 },
    subtitle: { color: '#667085', fontSize: 16, marginTop: 28 },
    card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, marginTop: 28, padding: 28 },
    metric: { color: '#176B87', fontSize: 48, fontWeight: '800' },
    label: { color: '#344054', fontSize: 16, fontWeight: '700', marginTop: 8 },
    helper: { color: '#667085', fontSize: 14, marginTop: 20, textAlign: 'center' },
});
