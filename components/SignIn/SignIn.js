import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';

// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberPassword, setRememberPassword] = useState(false);
    const navigation = useNavigation();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const Login = () => {
        navigation.navigate('Login');
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            
            navigation.navigate('Home');
            if (rememberPassword) {
                await AsyncStorage.setItem('email', 'example@example.com');
                await AsyncStorage.setItem('password', 'yourpassword');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Vui lòng nhập thông tin đăng nhập hợp lệ');
        } finally {
            setLoading(false);
        }
    };
    const commonStyles = {
        
        container: {
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
        
    };
    const mobileStyles = StyleSheet.create({
        container: {
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
        logo: {
            height: 100,
            width: 140,
            marginBottom: 20,
            alignSelf: 'center',
        },
        title: {
            textAlign:'center',
            color:'#667080',
            fontSize:22,
            fontWeight:'bold',
            marginBottom:10
        },
        inputRow: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#9f9e9a0D",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginBottom: 14,
            marginHorizontal: 20,
            width: Platform.OS === 'web' ? width * 0.8 : 'auto', 
        },
        input: {
            color: "#667080",
            fontSize: 16,
            flex: 1,
        },
        button: {
            alignItems: "center",
            backgroundColor: "#667080",
            borderRadius: 50,
            paddingVertical: 21,
            marginBottom: 24,
            marginHorizontal: 20,
            width: Platform.OS === 'web' ? width * 0.8 : 'auto', 
        },
        buttonText: {
            color: "#ffffff",
            fontSize: 16,
        },
        signUpText: {
            color: "#667080",
            fontSize: 14,
        },
        icon: {
            marginRight: 5
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginBottom: 5
        },
        signUpContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },
    });

    const webStyles = StyleSheet.create({
        
    });

    const finalStyles = Platform.OS === 'web' ? {...commonStyles,...webStyles } : mobileStyles;
    return (
        <View style={finalStyles.container}>
            <View style={finalStyles.logoContainer}>
                <Image
                    source={require('../../assets/p-high-resolution-logo-transparent.png')}
                    resizeMode={"stretch"}
                    style={finalStyles.logo}
                />
                
            </View>
            <Text style={finalStyles.title}>{"Đăng ký"}</Text>
            <View style={finalStyles.inputRow}>
                <Icon name="email" size={24} color="#667080" style={finalStyles.icon} />
                <TextInput
                    style={finalStyles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                
                />
            </View>

            <View style={finalStyles.inputRow}>
                <Icon name="lock" size={24} color="#667080" style={finalStyles.icon} />
                <TextInput
                    secureTextEntry={!isPasswordVisible}
                    style={finalStyles.input}
                    placeholder="Mật khẩu"
                
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Icon
                        name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={24}
                        color="#667080"
                    />
                </TouchableOpacity>
            </View>
            <View style={finalStyles.inputRow}>
                <Icon name="lock" size={24} color="#667080" style={finalStyles.icon} />
                <TextInput
                    secureTextEntry={!isPasswordVisible}
                    style={finalStyles.input}
                    placeholder="Xác nhận mật khẩu"
                
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Icon
                        name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={24}
                        color="#667080"
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={finalStyles.button}
                onPress={handleSubmit} 
            >
                <Text style={finalStyles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

            <View style={finalStyles.signUpContainer}>
                <Text style={{ color: '#000000' }}>{"Bạn đã có tài khoản? "}</Text>
                <TouchableOpacity onPress={Login}>
                    <Text style={finalStyles.signUpText}>{"Đăng nhập"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
