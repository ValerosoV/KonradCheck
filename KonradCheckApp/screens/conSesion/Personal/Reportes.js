import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BottomTabBarPersonal from './BottomTabBarPersonal';

const asistenciaMock = [
    { nombre: 'Andrés Felipe Rojas', codigo: '22019483', estado: 'Presente' },
    { nombre: 'Diana Carolina Martínez', codigo: '21908432', estado: 'Presente' },
    { nombre: 'Guillermo León Vélez', codigo: '21982499', estado: 'Ausente' },
    { nombre: 'María Camila Restrepo', codigo: '22014389', estado: 'Tardanza' },
    { nombre: 'Santiago Silva Ochoa', codigo: '22019401', estado: 'Presente' },
];

const estadoStyles = {
    Presente: { backgroundColor: '#DFF7E6', color: '#1E9E5A' },
    Ausente: { backgroundColor: '#FBE1DE', color: '#C0392B' },
    Tardanza: { backgroundColor: '#FBEFD1', color: '#B07A1E' },
};

export default function Reportes({ navigation, route }) {
    const reunion = route.params?.reunion;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.eyebrow}>REPORTE DE ASISTENCIA</Text>
                <Text style={styles.title}>{reunion?.titulo || 'Sistemas Operativos - G1'}</Text>
                <Text style={styles.date}>Fecha: Hoy, 24 de Octubre de 2025</Text>
                <View style={styles.summaryRow}>
                    <Summary value="28" label="Presentes" color="#DFF7E6" />
                    <Summary value="5" label="Ausentes" color="#FBE1DE" />
                    <Summary value="2" label="Tarde" color="#FBEFD1" />
                </View>
                <TextInput style={styles.search} placeholder="Buscar estudiante por nombre o ID..." />
                {asistenciaMock.map((estudiante) => (
                    <View key={estudiante.codigo} style={styles.studentRow}>
                        <View>
                            <Text style={styles.studentName}>{estudiante.nombre}</Text>
                            <Text style={styles.studentCode}>Código: {estudiante.codigo}</Text>
                        </View>
                        <Text style={[styles.badge, estadoStyles[estudiante.estado]]}>{estudiante.estado}</Text>
                    </View>
                ))}
                <View style={styles.exportButton}>
                    <Text style={styles.exportText}>Exportar Reporte (CSV)</Text>
                </View>
            </ScrollView>
            <BottomTabBarPersonal navigation={navigation} active="ReunionesPersonal" />
        </SafeAreaView>
    );
}

function Summary({ value, label, color }) {
    return (
        <View style={[styles.summary, { backgroundColor: color }]}>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    container: { padding: 18 },
    eyebrow: { color: '#12A889', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
    title: { color: '#172B4D', fontSize: 21, fontWeight: '800', marginTop: 8 },
    date: { color: '#667085', fontSize: 12, marginTop: 4 },
    summaryRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
    summary: { alignItems: 'center', borderRadius: 8, flex: 1, padding: 10 },
    summaryValue: { color: '#172B4D', fontSize: 17, fontWeight: '800' },
    summaryLabel: { color: '#344054', fontSize: 10, marginTop: 3 },
    search: { backgroundColor: '#FFFFFF', borderColor: '#D0D5DD', borderRadius: 8, borderWidth: 1, fontSize: 12, marginTop: 16, padding: 12 },
    studentRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, padding: 12 },
    studentName: { color: '#172B4D', fontSize: 12, fontWeight: '800' },
    studentCode: { color: '#667085', fontSize: 10, marginTop: 3 },
    badge: { borderRadius: 9, fontSize: 10, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
    exportButton: { alignItems: 'center', backgroundColor: '#D7F8F0', borderRadius: 8, marginTop: 22, padding: 14 },
    exportText: { color: '#087C71', fontSize: 13, fontWeight: '700' },
});
