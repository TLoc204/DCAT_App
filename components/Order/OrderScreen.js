import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Order from './Order';
import { useNavigation } from '@react-navigation/native';
import OrderDetails from './OrderDetails';
import CreateOrder from './CreateOrder';
import FoodOrder from './FoodOrder';
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
const Stack = createNativeStackNavigator();

export default function OrderScreen() {
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
                        <TouchableOpacity onPress={() => navigation.navigate('CreateOrder')}>
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
                    title: "Sửa đơn & Thanh toán ",
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
