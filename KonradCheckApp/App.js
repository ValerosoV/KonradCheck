import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Reuniones from './screens/Reuniones';

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
          name="Reuniones"
          component={Reuniones}
          options={{ title: 'Reuniones' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}