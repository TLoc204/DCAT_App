import React, { useEffect, useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, Dimensions, Platform, StyleSheet, Alert, ActivityIndicator, StatusBar } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, get} from 'firebase/database';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');
const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007AFF', // Thay đổi màu primary theo ý muốn
    },
};
export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberPassword, setRememberPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const database = getDatabase(FIREBASE_APP);
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    useEffect(() => {
        // Kiểm tra nếu đã lưu thông tin đăng nhập
        const checkLoginInfo = async () => {
            const savedUsername = await AsyncStorage.getItem('username');
            const savedPassword = await AsyncStorage.getItem('password');
            if (savedUsername && savedPassword) {
                setUsername(savedUsername);
                setPassword(savedPassword);
                setRememberPassword(true);
                navigation.navigate('BottomBarNavigation');
            }
        };
        checkLoginInfo();
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Thực hiện kiểm tra đăng nhập ở đây
            // Lấy danh sách người dùng từ Firebase
            const itemsRef = ref(database, 'Users');
            const snapshot = await get(itemsRef);
            const userAccount = snapshot.val();

            let user = null;

            for (const key in userAccount) {
                if (userAccount[key].Username === username) {
                    user = userAccount[key];
                    break; // Dừng vòng lặp nếu tìm thấy người dùng
                }
            }

            if (user) {

                const { Password } = user;
                if (password == Password) {
                    // Nếu kiểm tra đăng nhập thành công, thì mới chuyển đến màn hình 'Order'
                    if (rememberPassword) {
                        await AsyncStorage.setItem('username', username);
                        await AsyncStorage.setItem('password', password);
                        await AsyncStorage.setItem('role', user.IdRole);
                        await AsyncStorage.setItem('name', user.Name);
                    }
                    navigation.navigate('BottomBarNavigation');
                } else {
                    Alert.alert('Mật khẩu không đúng');
                }
            } else {
                Alert.alert('Tài khoản không tồn tại');
            }
        } catch (error) {
            console.log(error);
            // Xử lý lỗi ở đây
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
            textAlign: 'center',
            color: '#667080',
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 10
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
            marginLeft: 15,
            marginBottom: 5
        },
        signUpContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },
        customLoading: {

        }
    });

    const webStyles = StyleSheet.create({
        container: {
            width:'100%',
            justifyContent: 'center',

            alignItems:'center',
            flex: 1,
            flexDirection:"column",
            backgroundColor: "#FFFFFF",
        },
        logo: {
            height: 100,
            width: 140,
            marginBottom: 20,
            alignSelf: 'center',
        },
        title: {
            textAlign: 'center',
            color: '#667080',
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 10
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
            alignContent:'flex-start',
            marginLeft: 15,
            marginBottom: 5
        },
        signUpContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },
        customLoading: {

        }
    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    return (
        <PaperProvider theme={theme}>
            <View style={finalStyles.container}>
                <View style={finalStyles.logoContainer}>
                    <Image
                        source={require('../../assets/p-high-resolution-logo-transparent.png')}
                        resizeMode={"stretch"}
                        style={finalStyles.logo}
                    />
                </View>
                <Text style={finalStyles.title}>{"Đăng nhập"}</Text>
                <View style={finalStyles.inputRow}>
                    <Icon name="person" size={24} color="#667080" style={finalStyles.icon} />
                    <TextInput
                        style={finalStyles.input}
                        placeholder="Tên đăng nhập"
                        value={username}
                        onChangeText={(text) => setUsername(text)}
                    />
                </View>

                <View style={finalStyles.inputRow}>
                    <Icon name="lock" size={24} color="#667080" style={finalStyles.icon} />
                    <TextInput
                        secureTextEntry={!isPasswordVisible}
                        style={finalStyles.input}
                        value={password}
                        placeholder="Mật khẩu"
                        onChangeText={(text) => setPassword(text)}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <Icon
                            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                            size={24}
                            color="#667080"
                        />
                    </TouchableOpacity>
                </View>

                <View style={finalStyles.checkboxContainer}>
                    <Checkbox.Android
                        status={rememberPassword ? 'checked' : 'unchecked'}
                        color="#667080"
                        onPress={() => setRememberPassword(!rememberPassword)}
                    />
                    <Text>Nhớ mật khẩu</Text>
                </View>

                <TouchableOpacity
                    style={finalStyles.button}
                    onPress={handleSubmit}
                >
                    {loading ? (
                        <ActivityIndicator style={finalStyles.customLoading} size="large" color="#ffffff" />
                    ) : (
                        <Text style={finalStyles.buttonText}>Đăng nhập</Text>
                    )}

                </TouchableOpacity>

            </View>
            <StatusBar
                barStyle={'dark-content'} // Chọn kiểu biểu tượng (dark/light) tùy thuộc vào trạng thái focus
                translucent={true}
                animated
            />
        </PaperProvider>
    );
}
