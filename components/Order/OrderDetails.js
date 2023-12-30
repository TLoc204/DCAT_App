import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Button } from 'react-native-paper';

import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import SearchBar from "react-native-dynamic-search-bar";
import SearchableDropdown from 'react-native-searchable-dropdown';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function OrderDetails({ route }) {
    const database = getDatabase(FIREBASE_APP);
    const storage = getStorage(FIREBASE_APP);
    const { titleOrderId } = route.params;
    const IDOrder = "O" + titleOrderId
    const [orderData, setOrderData] = useState([]);
    const [drinkData, setDrinkData] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    useEffect(() => {
        // Sử dụng `onValue` để theo dõi thay đổi trong dữ liệu Firebase
        const ordersRef = ref(database, 'Orders');
        const drinksRef = ref(database, 'Drink');
        // Đăng ký sự kiện theo dõi thay đổi dữ liệu Orders
        onValue(ordersRef, (snapshot) => {
            const ordersData = snapshot.val();
            // Kiểm tra nếu có dữ liệu
            if (ordersData) {
                setOrderData(ordersData[IDOrder].OrderDetails);
            }
        });
        onValue(drinksRef, (snapshot) => {
            const drinksData = snapshot.val();
            // Kiểm tra nếu có dữ liệu
            if (drinksData) {
                setDrinkData(drinksData);
            }
        });
        return () => {
            off(ordersRef);
            off(drinksRef);
        }
    }, []);
    const fetchImagesFromStorage = async () => {
        try {
            const orderDetails = orderData;
            let urls = {};

            for (let billKey in orderDetails) {
                const bill = orderDetails[billKey];
                for (let orderKey in bill) {
                    const order = bill[orderKey];

                    const ids = {
                        IdDrink: "Drinks",
                        IdDrink2ND: "Drink2ND",
                        IdFood: "Foods",
                        IdGame: "Games",
                        IdTopping: "Topping",
                        IdFoodBonus: "FoodBonus",
                    };

                    for (let id in ids) {
                        if (order[id]) {
                            const imageUrl = await fetchImageFromStorage(
                                `${ids[id]}/${order[id]}.jpg`
                            );
                            urls[order[id]] = imageUrl;
                        }
                    }
                }
            }

            setImageUrls(urls);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };
    console.log(imageUrls)
    useEffect(() => {
        fetchImagesFromStorage();
    }, [orderData]);

    const fetchImageFromStorage = async (filePath) => {
        try {
            const url = await getDownloadURL(storageRef(storage, filePath));
            return url;
        } catch (error) {
            console.error("Error fetching image from storage:", error);
            return null;
        }
    };
    const handleSubmit = async () => {

    };
    const commonStyles = {
        container_order: {
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
    };
    const mobileStyles = StyleSheet.create({
        container_order: {
            flex: 1,
            backgroundColor: "#f8f8f8",
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            shadowRadius: 104,
            elevation: 104,
        },
        main_order: {
            flex: 1,
            marginTop: 10
        },
        main_order_item: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: 19,
            shadowColor: "#0000000D",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            shadowRadius: 35,
            elevation: 35,
        },
        icon: {
            marginLeft: -2
        }
    });
    
    const webStyles = StyleSheet.create({

    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <ScrollView style={finalStyles.main_order}>
                {Object.keys(orderData).map((billKey) => { // Sửa từ orderDetails sang temp
                    const bill = orderData[billKey]; // Sửa từ orderDetails sang temp
                    return (
                        <View
                            key={billKey}
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: 20,
                                marginBottom: 25,
                                marginHorizontal: 24,
                                shadowColor: "#0000000D",
                                shadowOpacity: 0.1,
                                shadowOffset: {
                                    width: 0,
                                    height: 20,
                                },
                                shadowRadius: 35,
                                elevation: 35,
                            }}
                        >
                            {/* Hiển thị tên của bill (VD: OD1) */}
                            <Text
                                style={{
                                    color: "#201a25",
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    marginLeft: 10,
                                    marginTop: 10,
                                }}
                            >
                                {billKey}
                            </Text>
                            {Object.keys(bill).map((orderKey) => {
                                const order = bill[orderKey];
                                return (
                                    <View
                                        key={orderKey}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            backgroundColor: "#ffffff",
                                            borderRadius: 20,

                                            marginVertical: 5,
                                            marginHorizontal: 24,
                                            shadowColor: "#0000000D",
                                            shadowOpacity: 0.1,
                                            shadowOffset: {
                                                width: 0,
                                                height: 20,
                                            },
                                            shadowRadius: 35,
                                            elevation: 35,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 100,
                                                height: 75,
                                                backgroundColor: "#eef1f4",
                                                borderRadius: 15,
                                                marginRight: 18,
                                                overflow: "hidden", // Để ảnh không tràn ra ngoài khung
                                            }}>
                                            {Object.keys(order).map((id) => {
                                                
                                                if (imageUrls[order[id]]) {
                                                    return (
                                                        <ImageBackground
                                                        key={id}
                                                        source={{ uri: imageUrls[order[id]] }}
                                                        resizeMode="cover"
                                                        style = {{

                                                            width:100,
                                                            height:75
                                                            
                                                        }}
                                                        onError={(error) => console.error("Image loading error:", error)}
                                                        />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </View>
                                        <View
                                            style={{
                                                flex: 1,
                                                marginRight: 4,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "#201a25",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginBottom: 11,
                                                    marginLeft: 1,
                                                }}
                                            >
                                                {order.IdDrink ? `IDDrink: ${order.IdDrink}` : null}
                                                {order.IdDrink2ND ? `IDDrink2ND: ${order.IdDrink2ND}` : null}
                                                {order.IdFood ? `IDFood: ${order.IdFood}` : null}
                                                {order.IdGame ? `IDGame: ${order.IdGame}` : null}
                                                {order.IdTopping ? `IDTopping: ${order.IdTopping}` : null}
                                                {order.IdFoodBonus ? `IDFoodBonus: ${order.IdFoodBonus}` : null}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: "#c3c6c9",
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    marginBottom: 15,
                                                }}
                                            >
                                                {"$225.00"}
                                            </Text>
                                            <TextInput
                                                style={{
                                                    color: "#201a25",
                                                    fontSize: 14,
                                                    fontWeight: "bold",
                                                    marginBottom: 10,
                                                }}
                                            >
                                                {"Giảm giá: "}
                                            </TextInput>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );


}