import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons,AntDesign} from '@expo/vector-icons';
import { Keyboard } from 'react-native';
import Home from './Home/Home';
import Order from './Order/Order';
import { Provider as PaperProvider ,Text} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import BottomFabBar from './bottombar/components/bottom.tab';

const Tab = createBottomTabNavigator();

const tabBarIcon = (name) => ({ focused, color, size }) => (
  <Ionicons name={name} size={size} color={focused ? 'black' : 'gray'} />
);
const tabBarName = (name) => ({ focused, color, size }) => (
  <Text color={focused ? 'black' : 'gray'}>{name}</Text>
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
          screenOptions={{
            tabBarActiveBackgroundColor: 'white',
            tabBarInactiveBackgroundColor: 'black',
            headerShown: false,
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              color: 'black',
              opacity: isKeyboardVisible ? 0 : 1,
            },
          }}
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
                bottom: isKeyboardVisible ? -100 : 0, // Ẩn thanh tab bar khi bàn phím hiển thị
                left: 0,
                right: 0,
              }}
              {...props}
            />
          )}
        >
          <Tab.Screen
            options={{
              tabBarIcon: tabBarIcon('home-outline'),
              tabBarLabel: tabBarName('Home'),
              
            }}
            name="Home"
            component={Home}
          />
          <Tab.Screen
            name="Meh"
            options={{
              tabBarIcon: tabBarIcon('cart-outline'),
              tabBarLabel: tabBarName('Order'),
            }}
            component={Order}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default BottomNavigationBar;
