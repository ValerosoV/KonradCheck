import { StyleSheet, Text, View } from 'react-native';

export const ESTADO_STYLES = {
    Presente: { bg: '#DFF7E6', text: '#1E9E5A' },
    Tardanza: { bg: '#FBEFD1', text: '#B07A1E' },
    Ausente: { bg: '#FBE1DE', text: '#C0392B' },
    Pendiente: { bg: '#EEF1F5', text: '#667085' },
};

export default function EstadoPill({ estado }) {
    const { bg, text } = ESTADO_STYLES[estado];
    return (
        <View style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={[styles.pillText, { color: text }]}>{estado}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
