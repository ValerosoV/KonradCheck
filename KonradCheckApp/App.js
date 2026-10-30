import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './screens/noSesion/Login';
import RecuperarContrasena from './screens/noSesion/RecuperarContrasena';
import Reuniones from './screens/conSesion/Estudiante/Reuniones';
import MiQR from './screens/conSesion/Estudiante/MiQR';
import Historial from './screens/conSesion/Estudiante/Historial';
import BottomTabBar from './screens/conSesion/Estudiante/BottomTabBar';
import Perfil from './screens/conSesion/Perfil';
import CambiarContrasena from './screens/conSesion/CambiarContrasena';
import ReunionesPersonal from './screens/conSesion/Personal/Reuniones';
import ProgramarReunion from './screens/conSesion/Personal/ProgramarReunion';
import Reportes from './screens/conSesion/Personal/Reportes';
import EscanearQR from './screens/conSesion/Personal/EscanearQR';
import BottomTabBarPersonal from './screens/conSesion/Personal/BottomTabBarPersonal';

const Stack = createNativeStackNavigator();
const TabsEstudiante = createBottomTabNavigator();
const TabsPersonal = createBottomTabNavigator();

const opcionesTabs = { headerShown: false, lazy: true };

function AreaEstudiante() {
    return (
        <TabsEstudiante.Navigator
            backBehavior="history"
            screenOptions={opcionesTabs}
            tabBar={(props) => <BottomTabBar {...props} />}
        >
            <TabsEstudiante.Screen name="Reuniones" component={Reuniones} />
            <TabsEstudiante.Screen name="Historial" component={Historial} />
            <TabsEstudiante.Screen name="Perfil" component={Perfil} />
            <TabsEstudiante.Screen name="MiQR" component={MiQR} />
            <TabsEstudiante.Screen name="CambiarContrasena" component={CambiarContrasena} />
        </TabsEstudiante.Navigator>
    );
}

function AreaPersonal() {
    return (
        <TabsPersonal.Navigator
            backBehavior="history"
            screenOptions={opcionesTabs}
            tabBar={(props) => <BottomTabBarPersonal {...props} />}
        >
            <TabsPersonal.Screen name="ReunionesPersonal" component={ReunionesPersonal} />
            <TabsPersonal.Screen name="EscanearQR" component={EscanearQR} />
            <TabsPersonal.Screen name="Perfil" component={Perfil} />
            <TabsPersonal.Screen name="ProgramarReunion" component={ProgramarReunion} />
            <TabsPersonal.Screen name="ReporteAsistencia" component={Reportes} />
            <TabsPersonal.Screen name="CambiarContrasena" component={CambiarContrasena} />
        </TabsPersonal.Navigator>
    );
}

function Navegacion() {
    const { usuario, restaurando } = useAuth();

    if (restaurando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator color="#12A889" size="large" />
            </View>
        );
    }

    // El rol que devuelve el servidor decide a que area entra cada persona.
    return (
        <NavigationContainer documentTitle={{ formatter: () => 'KonradCheck' }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!usuario && (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasena} />
                    </>
                )}
                {usuario?.area === 'estudiante' && (
                    <Stack.Screen name="AreaEstudiante" component={AreaEstudiante} />
                )}
                {usuario?.area === 'personal' && (
                    <Stack.Screen name="AreaPersonal" component={AreaPersonal} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <View style={styles.fondo}>
                    <View style={styles.telefono}>
                        <Navegacion />
                    </View>
                </View>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    fondo: {
        backgroundColor: '#0E172D',
        flex: 1,
    },
    // La app se piensa para celular: en una pantalla ancha conserva el tamano de telefono.
    telefono: {
        alignSelf: 'center',
        flex: 1,
        width: '100%',
        ...(Platform.OS === 'web' ? { maxWidth: 480 } : null),
    },
    cargando: {
        alignItems: 'center',
        backgroundColor: '#EEF3F8',
        flex: 1,
        justifyContent: 'center',
    },
});
