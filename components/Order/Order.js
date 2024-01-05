import React, { useEffect, useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { BottomSheet } from 'react-native-sheet';
import SearchBar from "react-native-dynamic-search-bar";
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
export default function Order() {
    const database = getDatabase(FIREBASE_APP);
    const [dataOrders, setDataOrders] = useState([]);
    const [dataRoom, setDataRoom] = useState([]);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const bottomSheet = useRef(null);
    const [orderCountByRoom, setOrderCountByRoom] = useState({});
    const [currentRoom, setCurrentRoom] = useState('Tất cả');
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
        return () => {
            off(ordersRef);
            off(roomRef);
        }

    }, []);

    useEffect(() => {
        const countByRoom = Object.values(filteredOrders).reduce((acc, order) => {
            const roomName = roomNames[order.IdRoom] || 'Unknown'; // Dùng 'Unknown' cho những phòng không xác định được
            acc[roomName] = (acc[roomName] || 0) + 1;
            return acc;
        }, {});

        setOrderCountByRoom(countByRoom);
    }, [filteredOrders, roomNames]);
    const handleSubmit = async () => {
        navigation.navigate('OrderDetails')
    };
    useEffect(() => {
        const filtered = Object.keys(dataOrders).reduce((acc, key) => {
            const order = dataOrders[key];
            const customerName = order.CustomerName;
            const roomId = order.IdRoom;
            const roomName = roomNames[roomId];

            if (
                (customerName && customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                key.includes(searchQuery) ||
                (roomName && roomName.toLowerCase().includes(searchQuery.toLowerCase()))
            ) {
                acc[key] = order;
            }
            return acc;
        }, {});
        setFilteredOrders(filtered);
    }, [searchQuery, dataOrders]);
    const openFilterMenu = () => {
        bottomSheet.current.show(); // Giả sử bottomSheet là ref của BottomSheet component
    };
    const handleSelectRoom = (roomKey) => {
        setCurrentRoom(roomNames[roomKey] || 'Tất cả'); // Cập nhật phòng được chọn
        bottomSheet.current.hide(); // Ẩn BottomSheet sau khi lựa chọn

        // Lọc các orders dựa trên phòng được chọn
        if (roomKey === 'Tất cả') {
            // Nếu chọn 'Tất cả', hiển thị tất cả orders
            setFilteredOrders(dataOrders);
        } else {
            // Nếu chọn một phòng cụ thể, lọc orders theo phòng đó
            const filteredByRoom = Object.keys(dataOrders).reduce((acc, orderId) => {
                const order = dataOrders[orderId];
                if (order.IdRoom === roomKey) {
                    acc[orderId] = order;
                }
                return acc;
            }, {});
            setFilteredOrders(filteredByRoom);
        }
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
        <PaperProvider theme={theme}>
            <SafeAreaView
                style={finalStyles.container_order}>
                <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                    <SearchBar
                        style={{ width: "auto", height: 50, marginLeft: 20, marginRight: 20 }}
                        fontColor="#ffffff"
                        iconColor="#ffffff"
                        shadowColor="#282828"
                        cancelIconColor="#ffffff"
                        backgroundColor="#ffffff"
                        placeholder="Tìm kiếm"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50, marginTop: 10 }}>
                    <TouchableOpacity onPress={openFilterMenu}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                            <Text>{currentRoom} ({currentRoom === 'Tất cả' ? Object.keys(filteredOrders).length : (orderCountByRoom[currentRoom] || 0)})</Text>
                            <Icon name="filter-alt" size={24} color="#667080" />
                        </View>
                    </TouchableOpacity>

                    <BottomSheet ref={bottomSheet} height={250}>
                        {/* Mục "Tất cả" để reset bộ lọc */}
                        <TouchableOpacity onPress={() => handleSelectRoom('Tất cả')}>
                            <Text>Tất cả</Text>
                        </TouchableOpacity>

                        {/* Danh sách các phòng */}
                        {Object.keys(roomNames).map((roomKey) => (
                            <TouchableOpacity key={roomKey} onPress={() => handleSelectRoom(roomKey)}>
                                <Text>{roomNames[roomKey]}</Text>
                            </TouchableOpacity>
                        ))}
                    </BottomSheet>


                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text>Thêm mới</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
                                                {"Tên khách hàng: " + order.CustomerName}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: "#c3c6c9",
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    marginBottom: 15,
                                                }}>
                                                {"Số hóa đơn: " + orderId.replace("O", "")} {/* Hiển thị key orderId */}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: "#86B6F6",
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
                                    <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { titleCustomerName: order.CustomerName, titleOrderId: orderId.replace("O", "") })}>
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
        </PaperProvider>
    );
}
