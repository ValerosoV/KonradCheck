import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/noSesion/Login';
import RecuperarContrasena from './screens/noSesion/RecuperarContrasena';
import Reuniones from './screens/conSesion/Estudiante/Reuniones';
import MiQR from './screens/conSesion/Estudiante/MiQR';
import Historial from './screens/conSesion/Estudiante/Historial';
import Perfil from './screens/conSesion/Perfil';
import ReunionesPersonal from './screens/conSesion/Personal/Reuniones';
import ProgramarReunion from './screens/conSesion/Personal/ProgramarReunion';
import Reportes from './screens/conSesion/Personal/Reportes';
import EscanearQR from './screens/conSesion/Personal/EscanearQR';

const Stack = createNativeStackNavigator();

//abajo importar las pantallas que se van a usar en el stack navigator


/*

  <Stack.Screen
    name="Inicio"             //
    component={Inicio}        //
    options={{                //
    title: 'Tienda Virtual',  //
    }}
  />
        
*/

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecuperarContrasena"
          component={RecuperarContrasena}
          options={{ title: 'Recuperar contraseña' }}
        />
        <Stack.Screen
          name="Reuniones"
          component={Reuniones}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MiQR"
          component={MiQR}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Historial"
          component={Historial}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReunionesPersonal"
          component={ReunionesPersonal}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProgramarReunion"
          component={ProgramarReunion}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReporteAsistencia"
          component={Reportes}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EscanearQR"
          component={EscanearQR}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}