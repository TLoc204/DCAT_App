import React, { useEffect, useState, useRef} from "react";
import { View, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue } from 'firebase/database';
import { BottomSheet } from 'react-native-sheet';
import { SearchBar } from 'react-native-elements';

import ContentLoader, { Rect } from 'react-content-loader/native';
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
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const ordersRef = ref(database, 'Orders');
        const roomRef = ref(database, 'Rooms');
        // Tạo một biến để giữ các hàm hủy đăng ký
        const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
            const ordersData = snapshot.val();
            if (ordersData) {
                setDataOrders(ordersData);
            }
        });

        const unsubscribeRooms = onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                setDataRoom(roomData);
            }
        });

        
        // Khi component bị unmount, gọi các hàm hủy đăng ký
        return () => {
            unsubscribeOrders();
            unsubscribeRooms();
           
        };

    }, []);
    useEffect(() => {
        // Tạo một đối tượng để theo dõi số lượng đơn hàng không bị xóa cho mỗi phòng
        const countByRoom = {};

        // Lặp qua mỗi đơn hàng trong filteredOrders
        Object.values(filteredOrders).forEach(order => {
            if (!order.Delete) { // Kiểm tra nếu đơn hàng không bị xóa
                const roomName = roomNames[order.IdRoom] || 'Unknown'; // Lấy tên phòng hoặc dùng 'Unknown'
                countByRoom[roomName] = (countByRoom[roomName] || 0) + 1; // Tăng số lượng cho phòng
            }
        });

        // Cập nhật trạng thái với số lượng đơn hàng theo phòng
        setOrderCountByRoom(countByRoom);
    }, [filteredOrders, roomNames]);

    const handleSubmit = async () => {

    };
    useEffect(() => {
        const filtered = Object.keys(dataOrders).reduce((acc, key) => {
            const order = dataOrders[key];
            const customerNames = []; // Khởi tạo mảng rỗng để chứa tên khách hàng
            const roomId = order.IdRoom;
            const roomName = roomNames[roomId];

            if (order.OrderDetails) {
                Object.keys(order.OrderDetails).forEach((orderDetailKey) => {
                    if (order.OrderDetails[orderDetailKey].CustomerName) {
                        customerNames.push(order.OrderDetails[orderDetailKey].CustomerName); // Thêm tên khách hàng vào mảng
                    }
                });
            }

            const customerNameString = customerNames.join(', ');

            // Chuyển searchQuery thành chữ thường và so sánh
            if (
                (customerNameString && customerNameString.toLowerCase().includes(searchQuery.toLowerCase())) ||
                key.includes(searchQuery.toLowerCase()) ||
                (roomName && roomName.toLowerCase().includes(searchQuery.toLowerCase()))
            ) {
                acc[key] = order;
            }
            return acc;
        }, {});
        setFilteredOrders(filtered);
    }, [searchQuery, dataOrders]);

    const openFilterMenu = () => {
        bottomSheet.current.show();
    };
    useEffect(() => {
        // Kiểm tra xem filteredOrders đã kết thúc cập nhật
        if (filteredOrders) {
            setTimeout(() => {
                setIsLoading(false);
            }, 2000); // 2000 milliseconds = 2 seconds
        }
        else setIsLoading(true);
    }, [filteredOrders]);
    const handleSelectRoom = (roomKey) => {
        setCurrentRoom(roomNames[roomKey] || 'Tất cả'); // Cập nhật phòng được chọn
        bottomSheet.current.hide(); // Ẩn BottomSheet sau khi lựa chọn
        setIsLoading(true);
        // Lọc các orders dựa trên phòng được chọn
        if (roomKey === 'Tất cả') {
            // Nếu chọn 'Tất cả', hiển thị tất cả orders
            setFilteredOrders(dataOrders);
            setTimeout(() => {
                setIsLoading(false);
            }, 2000); // 2000 milliseconds = 2 seconds
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
            setTimeout(() => {
                setIsLoading(false);
            }, 2000); // 2000 milliseconds = 2 seconds
        }
    };

    //-----------------------------------------------------End-----------------------------------------------
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
            paddingTop: 68,
        },
        main_order: {
            flex: 1,

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
        },
        checkIconContainer: {
            width: 25,
            height: 25,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#DCDCDC',
            backgroundColor: 'white',
        },
        container_sheet: {
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


        inputStyleDD: {
            fontSize: 16
        },
        input: {
            fontSize: 16
        },
        placeholderStyle: {

            fontSize: 16
        },
        //------------------------------- Css Món Ăn----------------------------------
        listContainer: {

            paddingHorizontal: 10,
            alignItems: 'flex-start',
            marginTop: 10
        },
    });
    const webStyles = StyleSheet.create({
        container_order: {
            flex: 1,
        },
        main_order: {
            flex: 1,

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
        },
        checkIconContainer: {
            width: 25,
            height: 25,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#DCDCDC',
            backgroundColor: 'white',
        },
        container_sheet: {
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


        inputStyleDD: {
            fontSize: 16
        },
        input: {
            fontSize: 16
        },
        placeholderStyle: {

            fontSize: 16
        },
        //------------------------------- Css Món Ăn----------------------------------
        listContainer: {

            paddingHorizontal: 10,
            alignItems: 'flex-start',
            marginTop: 10
        },
    });
    const roomNames = {};

    // Duyệt qua dataTables và lưu tên của các bàn vào tableNames
    Object.keys(dataRoom).forEach((roomKey) => {
        const room = dataRoom[roomKey];
        roomNames[roomKey] = room.Name;
    });

    useEffect(() => {
        // Chuyển đổi dataRoom thành mảng cho Dropdown
        const roomOptions = Object.keys(dataRoom).map((key) => {
            return { label: dataRoom[key].Name, value: key };
        });
        setRoomDropdownData(roomOptions);
    }, [dataRoom]);

    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    return (
        <PaperProvider theme={theme}>
            <SafeAreaView
                style={finalStyles.container_order}>
                <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                    <SearchBar
                        placeholder="Tìm kiếm"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        inputStyle={{ color: 'black' }} // Đặt màu chữ trong input
                        containerStyle={{
                            backgroundColor: 'transparent', // Để background của container trong suốt
                            borderBottomColor: 'transparent',
                            borderTopColor: 'transparent',
                            marginLeft: 0, // Loại bỏ lề trái
                            marginRight: 0, // Loại bỏ lề phải
                            height: 50,
                            width: '100%', // Đảm bảo container chiếm full chiều rộng
                            paddingHorizontal: 20, // Loại bỏ padding ngang nếu cần
                            
                        }}
                        inputContainerStyle={{
                            backgroundColor: '#ffffff',
                            width: '100%', // Đảm bảo khung nhập chiếm full chiều rộng
                        }}
                        placeholderTextColor="black" // Màu của placeholder text
                        searchIcon={{ color: 'black' }} // Màu icon tìm kiếm
                        clearIcon={{ color: 'black' }} // Màu icon xóa
                    />

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50, marginTop: 10 }}>
                    <TouchableOpacity onPress={openFilterMenu}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                            <Text>{
                                currentRoom} ({currentRoom === 'Tất cả' ? Object.values(filteredOrders).filter(order => !order.Delete).length : (orderCountByRoom[currentRoom] || 0)})</Text>
                            <Icon name="filter-alt" size={24} color="#667080" />
                        </View>
                    </TouchableOpacity>

                    <BottomSheet ref={bottomSheet} height={270}>
                        <TouchableOpacity onPress={() => handleSelectRoom('Tất cả')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginRight: 20, marginTop: 10 }}>
                                <View style={finalStyles.checkIconContainer}>
                                    {currentRoom === 'Tất cả' && <Icon name="check" size={20} color="#667080" />}
                                </View>
                                <Text style={{ marginLeft: 10 }}>Tất cả</Text>
                            </View>
                        </TouchableOpacity>

                        {Object.keys(roomNames).map((roomKey) => (
                            <TouchableOpacity key={roomKey} onPress={() => handleSelectRoom(roomKey)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#DCDCDC', marginRight: 20, marginTop: 20 }}>
                                    <View style={finalStyles.checkIconContainer}>
                                        {currentRoom === roomNames[roomKey] && <Icon name="check" size={20} color="#667080" />}
                                    </View>
                                    <Text style={{ marginLeft: 10 }}>{roomNames[roomKey]}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </BottomSheet>

                    {/*onPress={openCreateOrder} */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateOrder')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text>Tạo đơn</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    style={finalStyles.main_order}>
                    <ScrollView
                        style={finalStyles.main_order}>
                        {isLoading ? (
                            <ContentLoader
                                originY={0}
                                originX={0}
                                speed={2}
                                width={Dimensions.get('window').width}
                                height={Dimensions.get('window').height}
                                viewBox={`0 0 ${Dimensions.get('window').width} ${Dimensions.get('window').height}`}
                                backgroundColor="#ffffff" 
                                foregroundColor="#f3f3f3"  
                            >

                                <Rect x="40" y="30" rx="4" ry="4" width="80%" height="15" />
                                <Rect x="40" y="60" rx="4" ry="4" width="40%" height="15" />
                                <Rect x="40" y="90" rx="4" ry="4" width="60%" height="15" />
                                <Rect x="40" y="120" rx="4" ry="4" width="50%" height="15" />

                                <Rect x="40" y="220" rx="4" ry="4" width="80%" height="15" />
                                <Rect x="40" y="250" rx="4" ry="4" width="40%" height="15" />
                                <Rect x="40" y="280" rx="4" ry="4" width="60%" height="15" />
                                <Rect x="40" y="310" rx="4" ry="4" width="50%" height="15" />

                                <Rect x="40" y="410" rx="4" ry="4" width="80%" height="15" />
                                <Rect x="40" y="440" rx="4" ry="4" width="40%" height="15" />
                                <Rect x="40" y="470" rx="4" ry="4" width="60%" height="15" />
                                <Rect x="40" y="500" rx="4" ry="4" width="50%" height="15" />

                                {/* <Rect x="13" y="28" rx="5" ry="5" width="51" height="51" />
                                <Rect x="78" y="29" rx="5" ry="5" width="157" height="19" />
                                <Rect x="78" y="55" rx="5" ry="5" width="90" height="19" /> */}
                            </ContentLoader>
                        ) : (
                            Object.keys(filteredOrders)
                                .reverse()
                                .map((orderId) => {
                                    const order = filteredOrders[orderId];
                                    if (!order.Delete) {
                                        let customerNames = []; // Khởi tạo một mảng để tích lũy tên khách hàng

                                        if (order.OrderDetails) {
                                            Object.keys(order.OrderDetails).forEach((key) => {
                                                if (order.OrderDetails[key].CustomerName) {
                                                    customerNames.push(order.OrderDetails[key].CustomerName);
                                                }
                                            });
                                        }

                                        const customerNameString = customerNames.join(', ');
                                        return (
                                            <View
                                                key={orderId} // Sử dụng key là orderId
                                                style={{
                                                    marginBottom: 40,
                                                    marginHorizontal: 24,
                                                }}>
                                                <View style={finalStyles.main_order_item}>
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
                                                            {"Tên khách hàng: " + customerNameString}
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
                                                            {"Tổng tiền: " + order.TotalDiscountPrice.toLocaleString('vi-VN')} {/* Hiển thị key orderId */}
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
                                                <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { Orders: Object.entries(filteredOrders[orderId]), OrderID: orderId })}>
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
                                })
                        )}
                    </ScrollView>
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
}
