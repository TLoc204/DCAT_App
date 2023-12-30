import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './components/Login/Login';
import BottomBarNavigation from './components/BottomBarNavigation';
import OrderScreen from './components/Order/OrderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BottomBarNavigation" component={BottomBarNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="OrderScreen" component={OrderScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}