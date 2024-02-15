import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Keyboard, View, } from 'react-native';
import Home from './Home/Home';
import OrderScreen from './Order/OrderScreen';
import Setting from './Setting/Setting'
import Statistics from './Statistics/Statistics'
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
const Tab = createBottomTabNavigator();

const BottomNavigationBar = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isFoodOrderRoute, setIsFoodOrderRoute] = useState(false);
  useEffect(() => {
    const getActiveRouteName = (state) => {
      return state.routes[state.index]?.name;
    };
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });
    const unsubscribe = navigation.addListener('state', () => {
      const currentRouteName = getActiveRouteName(navigation.getState());
      // Cập nhật trạng thái nếu route hiện tại là 'FoodOrder'
      if (currentRouteName == 'FoodOrder') setIsFoodOrderRoute(true);
      else setIsFoodOrderRoute(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      unsubscribe.remove();
    };
  }, []);

  return (
    <NavigationContainer independent={true}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'OrderScreen') {
                iconName = focused ? 'cart' : 'cart-outline';
              }
              else if (route.name === 'Setting') {
                iconName = focused ? 'person' : 'person-outline';
              }
              else if (route.name === 'Statistics') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },

            tabBarActiveTintColor: 'black',
            tabBarInactiveTintColor: 'gray',
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              position: isKeyboardVisible || isFoodOrderRoute ? 'absolute' : 'relative',
              bottom: isKeyboardVisible || isFoodOrderRoute ? 0 : null,
              display: isFoodOrderRoute || isKeyboardVisible ? 'none' : 'flex'
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false, tabBarLabel: 'Trang chủ', }}
          />
          <Tab.Screen
            name="Statistics"
            component={Statistics}
            options={{ headerShown: false, tabBarLabel: 'Thống kê' }}
          />
          <Tab.Screen
            name="OrderScreen"
            component={OrderScreen}
            options={{ headerShown: false, tabBarLabel: 'Đơn hàng' }}
          />
          <Tab.Screen
            name="Setting"
            component={Setting}
            options={{ headerShown: false, tabBarLabel: 'Tôi' }}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default BottomNavigationBar;
