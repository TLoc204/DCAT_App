import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Setting from './Setting';
import Admin from './Admin';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Stack = createNativeStackNavigator();

export default function SettingScreen() {
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
                })}
            />
        </Stack.Navigator>
    );
}
