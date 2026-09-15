import { View, Text, Pressable, StyleSheet } from 'react-native';
import { HomeIcon, QrIcon, PerfilIcon } from '../../components/Icons';

const TABS = [
    { route: 'ReunionesPersonal', label: 'Reuniones', Icon: HomeIcon },
    { route: 'EscanearQR', label: 'Escanear QR', Icon: QrIcon },
    { route: 'Perfil', label: 'Perfil', Icon: PerfilIcon },
];

const ACTIVE_COLOR = '#12A889';
const INACTIVE_COLOR = '#98A2B3';

export default function BottomTabBarPersonal({ navigation, active }) {
    return (
        <View>
            <View style={styles.tabBar}>
                {TABS.map(({ route, label, Icon }) => {
                    const color = route === active ? ACTIVE_COLOR : INACTIVE_COLOR;
                    return (
                        <Pressable
                            key={route}
                            style={styles.tabItem}
                            onPress={() => {
                                if (route === 'Perfil') {
                                    navigation.navigate(route, { role: 'personal' });
                                    return;
                                }
                                navigation.navigate(route);
                            }}
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
        paddingBottom: 6,
        paddingTop: 10,
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
