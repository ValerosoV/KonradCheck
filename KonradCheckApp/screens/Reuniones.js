import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
} from 'react-native';

export default function Reuniones() {

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Mis reuniones</Text>
                <Text style={styles.subtitle}>
                    Aqui apareceran tus reuniones programadas.
                </Text>
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
    },
    title: {
        color: '#172B4D',
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 10,
    },
    subtitle: {
        color: '#667085',
        fontSize: 16,
        lineHeight: 24,
    },
});
