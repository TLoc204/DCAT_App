import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Order from './Order';
import OrderDetails from './OrderDetails';

const Stack = createNativeStackNavigator();

export default function OrderScreen() {
    return (
        <Stack.Navigator initialRouteName="Order">
            <Stack.Screen name="Order" component={Order} options={{ headerShown: false }} />
            <Stack.Screen
                name="OrderDetails"
                component={OrderDetails}
                options={({ route }) => ({
                    headerShown: true,
                    headerTitleAlign: 'center',
                    title: "HĐ: " + route.params.titleOrderId + " - " + "KH: " + route.params.titleCustomerName
                })}/>
        </Stack.Navigator>
    );
}
