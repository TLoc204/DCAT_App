import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Keyboard } from 'react-native';
import Home from './Home/Home';
import OrderScreen from './Order/OrderScreen';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import BottomFabBar from './bottombar/components/bottom.tab';

const Tab = createBottomTabNavigator();

const tabBarIcon = (name) => ({ focused, color, size }) => (
  <Ionicons name={name} size={size} color={focused ? 'black' : 'gray'} />
);
const tabBarName = (name) => ({ focused, color, size }) => (
  <Text name={name} color={focused ? 'black' : 'gray'} />
);
const BottomNavigationBar = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: tabBarIcon(`${route.name === 'Home' ? 'home-outline' : 'cart-outline'}`),
            tabBarLabel: tabBarName(`${route.name === 'Home' ? 'Home' : 'Order'}`),
            
            tabBarActiveBackgroundColor: 'white',
            tabBarInactiveBackgroundColor: 'black',
            headerShown: false,
            tabBarLabelStyle: {
              color: 'black',
              opacity: isKeyboardVisible ? 0 : 1,
            },
          })}

          tabBar={(props) => (
            <BottomFabBar
              mode={'default'}
              focusedButtonStyle={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 7,
                },
                shadowOpacity: 0.41,
                shadowRadius: 9.11,
                elevation: 14,
              }}
              bottomBarContainerStyle={{
                position: 'absolute',
                bottom: isKeyboardVisible ? -100 : 0,
                left: 0,
                right: 0,
              }}
              {...props}
            />
          )}
        >
          <Tab.Screen
            name="Home"
            component={Home}
          />
          <Tab.Screen
            name="Order"
            component={OrderScreen}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default BottomNavigationBar;
