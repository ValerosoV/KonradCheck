import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import MenuNavegacion from '../../components/MenuNavegacion';

export default function ProgramarReunion({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Programar reunion</Text>
                    <MenuNavegacion navigation={navigation} />
                </View>
                <Text style={styles.subtitle}>Completa los datos de la nueva reunion.</Text>
                <TextInput style={styles.input} placeholder="Titulo" />
                <TextInput style={styles.input} placeholder="Descripcion" />
                <TextInput style={styles.input} placeholder="Ubicacion" />
                <TextInput style={styles.input} placeholder="Fecha y hora de inicio" />
                <TextInput style={styles.input} placeholder="Fecha y hora de finalizacion" />
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Guardar reunion</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
    container: { padding: 28 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    title: { color: '#172B4D', fontSize: 26, fontWeight: '800' },
    subtitle: { color: '#667085', fontSize: 15, lineHeight: 22, marginTop: 20 },
    input: { backgroundColor: '#FFFFFF', borderColor: '#D0D5DD', borderRadius: 8, borderWidth: 1, color: '#172B4D', fontSize: 16, marginTop: 16, minHeight: 52, paddingHorizontal: 16 },
    button: { alignItems: 'center', backgroundColor: '#176B87', borderRadius: 8, marginTop: 24, padding: 15 },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
