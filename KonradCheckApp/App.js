import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/noSesion/Login';
import RecuperarContrasena from './screens/noSesion/RecuperarContrasena';
import ReunionesEstudiante from './screens/Estudiante/Reuniones';
import MostrarQR from './screens/Estudiante/MostrarQR';
import ReunionesDocente from './screens/Docente/Reuniones';
import ProgramarReunion from './screens/Docente/ProgramarReunion';
import ReporteAsistencia from './screens/Docente/ReporteAsistencia';
import EscanearQR from './screens/Docente/EscanearQR';
import PerfilUsuario from './screens/PerfilUsuario';

const Stack = createNativeStackNavigator();

//abajo importar las pantallas que se van a usar en el stack navigator


/*
import Reemplazar from './screens/Reemplazar';
*/

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
        <Stack.Screen name="ReunionesEstudiante" component={ReunionesEstudiante} options={{ headerShown: false }} />
        <Stack.Screen name="MostrarQR" component={MostrarQR} options={{ title: 'Mostrar QR' }} />
        <Stack.Screen name="ReunionesDocente" component={ReunionesDocente} options={{ headerShown: false }} />
        <Stack.Screen name="ProgramarReunion" component={ProgramarReunion} options={{ title: 'Programar reunion' }} />
        <Stack.Screen name="ReporteAsistencia" component={ReporteAsistencia} options={{ title: 'Reporte de asistencia' }} />
        <Stack.Screen name="EscanearQR" component={EscanearQR} options={{ title: 'Escanear QR' }} />
        <Stack.Screen name="PerfilUsuario" component={PerfilUsuario} options={{ title: 'Mi perfil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}