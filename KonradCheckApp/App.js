import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/noSesion/Login';
import RecuperarContrasena from './screens/noSesion/RecuperarContrasena';
import Reuniones from './screens/Reuniones';
import MiQR from './screens/MiQR';
import Historial from './screens/Historial';
import Perfil from './screens/Perfil';

const Stack = createNativeStackNavigator();

//abajo importar las pantallas que se van a usar en el stack navigator


/*
import Reemplazar from './screens/Eeemplazar';
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}