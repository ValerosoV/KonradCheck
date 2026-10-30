import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#12A889';
const INACTIVE_COLOR = '#98A2B3';

// Barra inferior comun. `padres` indica que pestana se resalta en las pantallas
// internas, por ejemplo Mi QR pertenece a Inicio.
export default function BarraTabs({ state, navigation, tabs, padres }) {
    const insets = useSafeAreaInsets();
    const [tecladoVisible, setTecladoVisible] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') return undefined;
        const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
        const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
        return () => {
            mostrar.remove();
            ocultar.remove();
        };
    }, []);

    if (tecladoVisible) return null;

    const rutaActual = state.routes[state.index].name;
    const activa = padres[rutaActual] ?? rutaActual;

    return (
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {tabs.map(({ route, label, Icon }) => {
                const esActiva = route === activa;
                const color = esActiva ? ACTIVE_COLOR : INACTIVE_COLOR;
                return (
                    <Pressable
                        key={route}
                        accessibilityRole="tab"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: esActiva }}
                        style={styles.tabItem}
                        onPress={() => navigation.navigate(route)}
                    >
                        <View style={styles.tabIcon}>
                            <Icon color={color} />
                        </View>
                        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#EAECF0',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
    },
    tabItem: {
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    tabIcon: {
        alignItems: 'center',
        height: 22,
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
});
