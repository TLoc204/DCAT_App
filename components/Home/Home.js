import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Button, TextInput } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import SearchableDropdown from 'react-native-searchable-dropdown';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function Order() {
    const database = getDatabase(FIREBASE_APP);
    const [dataOrders, setDataOrders] = useState([]);
    const [dataRoom, setDataRoom] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    useEffect(() => {
        // Sử dụng `onValue` để theo dõi thay đổi trong dữ liệu Firebase
        const ordersRef = ref(database, 'Orders');
        const roomRef = ref(database, 'Rooms');

        // Đăng ký sự kiện theo dõi thay đổi dữ liệu Orders
        onValue(ordersRef, (snapshot) => {
            const ordersData = snapshot.val();
            // Kiểm tra nếu có dữ liệu
            if (ordersData) {
                setDataOrders(ordersData);
            }
        });

        // Đăng ký sự kiện theo dõi thay đổi dữ liệu Rooms
        onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            // Kiểm tra nếu có dữ liệu
            if (roomData) {
                setDataRoom(roomData);
            }
        });


    }, []);
    const handleSubmit = async () => {

    };
    useEffect(() => {
        const filtered = Object.keys(dataOrders).reduce((acc, key) => {
            const order = dataOrders[key];
            if (order.CustomerName.toLowerCase().includes(searchQuery.toLowerCase()) || key.includes(searchQuery)) {
                acc[key] = order;
            }
            return acc;
        }, {});
        setFilteredOrders(filtered);
    }, [searchQuery, dataOrders]);
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
            borderRadius: 50,
            paddingTop: 68,
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
            backgroundColor: "#f8f8f8",
            borderRadius: 50,
            paddingTop: 10,
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            shadowRadius: 104,
            elevation: 104,
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
    const roomNames = {};

    // Duyệt qua dataTables và lưu tên của các bàn vào tableNames
    Object.keys(dataRoom).forEach((roomKey) => {
        const room = dataRoom[roomKey];
        roomNames[roomKey] = room.Name;
    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    return (
        <SafeAreaView
            style={finalStyles.container_order}>
            <View style={{ flexDirection: 'row', padding: 10, marginTop: 'auto' }}>
                <TextInput
                    style={{ flex: 1, marginRight: 10, borderColor: '#ddd' }}
                    mode="outlined"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    label="Tìm kiếm"
                    placeholder="Tìm kiếm"
                    left={
                        <TextInput.Icon
                            icon="magnify"

                        />
                    }
                    maxLength={100}

                />
            </View>
            <ScrollView
                style={finalStyles.main_order}>
                {Object.keys(filteredOrders).map((orderId) => {
                    const order = filteredOrders[orderId];
                    if (!order.Delete) {
                        return (
                            <View
                                key={orderId} // Sử dụng key là orderId
                                style={{
                                    marginBottom: 40,
                                    marginHorizontal: 24,
                                }}>
                                <View
                                    style={finalStyles.main_order_item}>
                                    <View
                                        style={{
                                            flex: 1,
                                        }}>
                                        <Text
                                            style={{
                                                color: "#201a25",
                                                fontSize: 16,
                                                fontWeight: "bold",
                                                marginBottom: 10,
                                                marginLeft: 1,
                                            }}>
                                            {"Tên KH: " + order.CustomerName}
                                        </Text>
                                        <Text
                                            style={{
                                                color: "#c3c6c9",
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                marginBottom: 15,
                                            }}>
                                            {"Số hóa đơn: " + orderId} {/* Hiển thị key orderId */}
                                        </Text>
                                        <Text
                                            style={{
                                                color: "#c3c6c9",
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                marginBottom: 15,
                                            }}>
                                            {"Tổng tiền: " + order.TotalAmount.toLocaleString('vi-VN')} {/* Hiển thị key orderId */}
                                        </Text>
                                        <Text
                                            style={{
                                                color: "#201a25",
                                                fontSize: 14,
                                                fontWeight: "bold",
                                            }}>
                                            {roomNames[order.IdRoom] || ''}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity>
                                    <View
                                        style={{
                                            position: "absolute",
                                            bottom: -20,
                                            right: -1,
                                            width: 66,
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: 66,
                                            backgroundColor: "#eef1f4",
                                            borderRadius: 20,
                                            paddingHorizontal: 20,
                                        }}>
                                        <Icon name="add" size={34} color="#667080" style={finalStyles.icon} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    }
                    return null;
                })}

            </ScrollView>

        </SafeAreaView>
    );
}
