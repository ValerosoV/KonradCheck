import { View, Text, Pressable, StyleSheet } from 'react-native';
import { HomeIcon, HistorialIcon, PerfilIcon } from './Icons';

const TABS = [
    { route: 'Reuniones', label: 'Inicio', Icon: HomeIcon },
    { route: 'Historial', label: 'Historial', Icon: HistorialIcon },
    { route: 'Perfil', label: 'Perfil', Icon: PerfilIcon },
];

const ACTIVE_COLOR = '#12A889';
const INACTIVE_COLOR = '#98A2B3';

export default function BottomTabBar({ navigation, active }) {
    return (
        <View>
            <View style={styles.tabBar}>
                {TABS.map(({ route, label, Icon }) => {
                    const isActive = route === active;
                    const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
                    return (
                        <Pressable
                            key={route}
                            style={styles.tabItem}
                            onPress={() => navigation.navigate(route)}
                        >
                            <Icon color={color} />
                            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.homeIndicator} />
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
        paddingBottom: 6,
    },
    tabItem: {
        alignItems: 'center',
        gap: 6,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    homeIndicator: {
        alignSelf: 'center',
        backgroundColor: '#D0D5DD',
        borderRadius: 3,
        height: 5,
        marginBottom: 8,
        marginTop: 4,
        width: 120,
    },
});
