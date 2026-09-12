import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import BottomTabBar from './components/BottomTabBar';

export default function Historial({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Historial</Text>
                <Text style={styles.subtitle}>
                    Aquí aparecerá tu historial de asistencia.
                </Text>
            </View>

            <BottomTabBar navigation={navigation} active="Historial" />
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
