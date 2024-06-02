import React, { useState, useEffect } from 'react';
import { Keyboard, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useIsFocused, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './components/Login/Login';
import { ImageAllFolderProvider } from './components/Order/FoodOrder';
import FlashMessage from "react-native-flash-message";
import Home from './components/Home/Home';
import Setting from './components/Setting/Setting';
import Payment from './components/Payment/Payment';
import Statistics from './components/Statistics/Statistics';
import Admin from './components/Admin/Admin';
import OrderDetails from './components/Order/OrderDetails';
import CreateOrder from './components/Order/CreateOrder';
import FoodOrder from './components/Order/FoodOrder';
import Order from './components/Order/Order';
import HomeDetail from './components/Home/HomeDetail'
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AdminCreateAndUpdateFood from './components/Admin/AdminCreateAndUpdateFood';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_APP } from './FirebaseConfig';
import { getDatabase, ref, onValue } from 'firebase/database';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomNavigationBar() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const database = getDatabase(FIREBASE_APP);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isFoodOrderRoute, setIsFoodOrderRoute] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({ username: '', role: '' });
  const [dataRole, setDataRole] = useState({});
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
  }, [])
  useEffect(() => {
    const roleRef = ref(database, 'Roles');
    const unsubscribeRole = onValue(roleRef, (snapshot) => {
      const roleData = snapshot.val();
      if (roleData) {
        setDataRole(roleData);
      }
    });
    return () => {
      unsubscribeRole();
    };
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem('name');
        const storedRole = await AsyncStorage.getItem('role');
        const role = storedRole && dataRole[storedRole] ? dataRole[storedRole].Name : 'Unknown';
        setLoggedInUser({ username, role });
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };
    fetchUserData();
  }, [dataRole]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OrderScreen') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'SettingScreen') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Payment') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: isKeyboardVisible ? 'absolute' : 'relative',
          bottom: isKeyboardVisible ? 0 : null,
          display: isKeyboardVisible ? 'none' : 'flex'
        },
      })}
    >
      <Tab.Screen  
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false, tabBarLabel: 'Trang chủ' }}
      />
      
      {loggedInUser.role === 'Admin' && (
        <Tab.Screen
          name="Statistics"
          component={Statistics}
          options={{ headerShown: false, tabBarLabel: 'Thống kê' }}
        />
      )}
      <Tab.Screen
        name="OrderScreen"
        component={OrderScreen}
        options={{ headerShown: false, tabBarLabel: 'Đơn hàng' }}
      />
      <Tab.Screen
        name="Payment"
        component={Payment}
        options={{ headerShown: false, tabBarLabel: 'Phiếu chi' }}
      />
      <Tab.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{ headerShown: false, tabBarLabel: 'Tôi' }}
      />
    </Tab.Navigator>
  );
}
function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeDetail"
        component={HomeDetail}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          title: 'Home Detail',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
function SettingScreen() {
  const navigation = useNavigation();
  const [titleAdmin, setTitle] = useState('Cập nhật');
  return (
    <Stack.Navigator initialRouteName="Setting">
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Admin"
        component={Admin}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          title: 'Admin',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // Xác định hành động người dùng và cập nhật tiêu đề tương ứng
                setTitle('Thêm mới');
                navigation.navigate('AdminCreateAndUpdateFood',{adminRole:"Thêm mới"});
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="add" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AdminCreateAndUpdateFood"
        component={AdminCreateAndUpdateFood}
        options={({ route }) => ({
          
          headerShown: true,
          headerTitleAlign: 'center',
          title: `${route.params?.adminRole}`, 
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
function OrderScreen() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName="Order">
      <Stack.Screen name="Order" component={Order} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrder}
        options={({ route }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          title: "Tạo đơn",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Order')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="FoodOrder"
        component={FoodOrder}
        options={({ route }) => ({
          
          headerShown: true,
          headerTitleAlign: 'center',
          title: "Danh mục",
          headerLeft: () => (
            <TouchableOpacity onPress={() => route.params.origin === "CreateOrder" ?navigation.navigate('CreateOrder'):navigation.navigate('OrderDetails',{origin: 'OrderDetails', Orders: route.params?.Orders, OrderID: route.params?.OrderID })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={({ route }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          title: "Cập nhật & Thanh toán ",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Order')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back-ios" size={24} color="#667080" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ImageAllFolderProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BottomNavigationBar" component={BottomNavigationBar} options={{ headerShown: false }} />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </ImageAllFolderProvider>
  );
}
