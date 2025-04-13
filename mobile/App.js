// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Pages/login';
import Register from './Pages/register';
import Main from './Pages/main';
import Home from './Pages/home';
import Profile from './Pages/profile';
import Map from './Pages/map'; 
import Notification from './Pages/notification';
import Training from './Pages/training'; 
import Certificate from './Pages/certificate'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // This will hide the header for all screens
        }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Map" component={Map} /> 
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="Training" component={Training} />
        <Stack.Screen name="Certificate" component={Certificate} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
