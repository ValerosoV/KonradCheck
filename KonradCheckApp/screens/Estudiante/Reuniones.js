import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MenuNavegacion from '../../components/MenuNavegacion';
import { reunionesMock } from '../../data/reunionesMock';

export default function ReunionesEstudiante({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Mis reuniones</Text>
                        <Text style={styles.subtitle}>Vista de estudiante</Text>
                    </View>
                    <MenuNavegacion navigation={navigation} />
                </View>
                {reunionesMock.map((reunion) => (
                    <View key={reunion.titulo} style={styles.card}>
                        <Text style={styles.cardTitle}>{reunion.titulo}</Text>
                        <Text style={styles.type}>{reunion.tipo}</Text>
                        <Text style={styles.description}>{reunion.descripcion}</Text>
                        <Text style={styles.detail}>Lugar: {reunion.ubicacion}</Text>
                        <Text style={styles.detail}>Inicio: {reunion.fechaInicio}</Text>
                        <Text style={styles.status}>{reunion.estado}</Text>
                        <Pressable
                            onPress={() => navigation.navigate('MostrarQR', { reunion })}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionText}>Mostrar QR</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', fontSize: 28, fontWeight: '800' },
    subtitle: { color: '#667085', fontSize: 14, marginTop: 6 },
    card: { backgroundColor: '#FFFFFF', borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, marginTop: 24, padding: 18 },
    cardTitle: { color: '#172B4D', fontSize: 19, fontWeight: '800' },
    type: { color: '#176B87', fontSize: 13, fontWeight: '700', marginTop: 8 },
    description: { color: '#667085', fontSize: 15, marginTop: 14 },
    detail: { color: '#344054', fontSize: 14, marginTop: 8 },
    status: { color: '#027A48', fontSize: 13, fontWeight: '700', marginTop: 14 },
    actionButton: { alignItems: 'center', backgroundColor: '#176B87', borderRadius: 8, marginTop: 18, padding: 13 },
    actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
