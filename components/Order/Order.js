import React, { useEffect, useState, useRef, useContext } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { BottomSheet } from 'react-native-sheet';
import SearchBar from "react-native-dynamic-search-bar";
import { Dropdown } from 'react-native-element-dropdown';
import { getStorage, ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import { useRoute } from '@react-navigation/native';
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
    const storage = getStorage(FIREBASE_APP);
    const [dataOrders, setDataOrders] = useState([]);
    const [dataRoom, setDataRoom] = useState([]);
    const [dataFoods, setDataFoods] = useState([]);
    const [dataCategories, setDataCategories] = useState([]);
    const [dataFoodBonus, setDataFoodBonus] = useState([]);
    const [dataDrinks, setDataDrinks] = useState([]);
    const [dataDrink2ND, setDataDrink2ND] = useState([]);
    const [dataToppings, setDataToppings] = useState([]);
    const [dataGames, setDataGames] = useState([]);
    const [roomDropdownData, setRoomDropdownData] = useState([]);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const bottomSheet = useRef(null);
    const bottomSheetCreate = useRef(null);
    const bottomSheetFood = useRef(null);
    const [orderCountByRoom, setOrderCountByRoom] = useState({});
    const [currentRoom, setCurrentRoom] = useState('Tất cả');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [imageUrls, setImageUrls] = useState({});
    const [imageAll, setImageAll] = useState({});
    const screenHeight = Dimensions.get('window').height; // Lấy chiều cao màn hình
    useEffect(() => {
        const ordersRef = ref(database, 'Orders');
        const roomRef = ref(database, 'Rooms');
        const foodRef = ref(database, 'Foods');
        const categoryRef = ref(database, 'Categories');
        const drinkRef = ref(database, 'Drinks');
        const drink2ndRef = ref(database, 'Drink2ND');
        const foodbonusRef = ref(database, 'FoodBonus');
        const gameRef = ref(database, 'Games');
        const toppingRef = ref(database, 'Topping');
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

        const unsubscribeFoods = onValue(foodRef, (snapshot) => {
            const foodData = snapshot.val();
            if (foodData) {
                setDataFoods(foodData);
            }
        });

        const unsubscribeCategories = onValue(categoryRef, (snapshot) => {
            const categoryData = snapshot.val();
            if (categoryData) {
                setDataCategories(categoryData);
            }
        });

        const unsubscribeDrinks = onValue(drinkRef, (snapshot) => {
            const drinkData = snapshot.val();
            if (drinkData) {
                setDataDrinks(drinkData);
            }
        });


        const unsubscribeDrink2ND = onValue(drink2ndRef, (snapshot) => {
            const drink2ndData = snapshot.val();
            if (drink2ndData) {
                setDataDrink2ND(drink2ndData);
            }
        });

        const unsubscribeFoodBonus = onValue(foodbonusRef, (snapshot) => {
            const foodbonusData = snapshot.val();
            if (foodbonusData) {
                setDataFoodBonus(foodbonusData);
            }
        });

        const unsubscribeGames = onValue(gameRef, (snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                setDataGames(gameData);
            }
        });

        const unsubscribeToppings = onValue(toppingRef, (snapshot) => {
            const toppingData = snapshot.val();
            if (toppingData) {
                setDataToppings(toppingData);
            }
        });
        // Khi component bị unmount, gọi các hàm hủy đăng ký
        return () => {
            unsubscribeOrders();
            unsubscribeRooms();
            unsubscribeFoods();
            unsubscribeCategories();
            unsubscribeDrinks();
            unsubscribeDrink2ND();
            unsubscribeFoodBonus();
            unsubscribeGames();
            unsubscribeToppings();
        };

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
        bottomSheet.current.show();
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
    
    // const getFilteredData = () => {
    //     switch (selectedCategory) {
    //         case 'C1':
    //             return Object.entries(dataDrinks);
    //         case 'C2':
    //             return Object.entries(dataDrink2ND);
    //         case 'C3':
    //             return Object.entries(dataFoods);
    //         case 'C4':
    //             return Object.entries(dataToppings);
    //         case 'C5':
    //             return Object.entries(dataFoodBonus);
    //         case 'C6':
    //             return Object.entries(dataGames);
    //         case '':
    //         default:
    //             // Concatenate all items for 'all' filter
    //             return [
    //                 ...Object.entries(dataDrinks),
    //                 ...Object.entries(dataDrink2ND),
    //                 ...Object.entries(dataFoods),
    //                 ...Object.entries(dataToppings),
    //                 ...Object.entries(dataFoodBonus),
    //                 ...Object.entries(dataGames),
    //             ];
    //     }
    // };

    //------------------------------------------------ Lấy ảnh firebase--------------------------------------------
    // const fetchImagesFromStorage = async () => {
    //     try {
    //         const orderDetails = dataOrders;
    //         let urls = {};

    //         for (let billKey in orderDetails) {
    //             const bill = orderDetails[billKey];
    //             for (let orderKey in bill) {
    //                 const order = bill[orderKey];

    //                 const ids = {    
    //                     IdDrink: "Drinks",
    //                     IdDrink2ND: "Drink2ND",
    //                     IdFood: "Foods",
    //                     IdGame: "Games",
    //                     IdTopping: "Topping",
    //                     IdFoodBonus: "FoodBonus",
    //                 };
    //                 for (let id in ids) {
    //                     if (order[id]) {
    //                         const imageUrl = await fetchImageFromStorage(
    //                             `${ids[id]}/${order[id]}.jpg`
    //                         );
    //                         for (const folder in imageAll) {
    //                             const items = imageAll[folder];
    //                             console.log(items)
    //                             const matchedItem = items.find((item) => item.url === imageUrl);
    //                             if (matchedItem) {
    //                               urls[order[id]] = imageUrl;
    //                               break; // Đã tìm thấy URL khớp, không cần duyệt tiếp
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         setImageUrls(urls);
    //     } catch (error) {
    //         console.error("Error fetching images:", error);
    //     }
    // };


    // const listAllItemsInFolder = async () => {
    //     try {
    //         const items = await listAll(storageRef(storage));
    //         const itemDetails = [];

    //         for (const item of items.items) {
    //             const itemUrl = await getDownloadURL(item);
    //             console.log(itemUrl);
    //             itemDetails.push({ name: item.name, url: itemUrl });
    //         }
    //         return itemDetails;
    //     } catch (error) {
    //         console.error("Error listing items:", error);
    //         return [];
    //     }
    // };

    // const fetchAllItems = async () => {
    //     try {
    //         const allItems = await listAllItemsInFolder();
    //         setImageAll(allItems);
    //         // Bạn có thể xử lý tất cả các item ở đây hoặc lưu chúng vào đối tượng để sử dụng sau này.
    //     } catch (error) {
    //         console.error("Error fetching all items:", error);
    //     }
    // };


    // useEffect(() => {
    //     fetchAllItems();
    // }, []);

    // useEffect(() => {
    //     fetchImagesFromStorage();
    // }, [dataOrders]);

    // const fetchImageFromStorage = async (filePath) => {
    //     try {
    //         const url = await getDownloadURL(storageRef(storage, filePath));
    //         return url;
    //     } catch (error) {
    //         console.error("Error fetching image from storage:", error);
    //         return null;
    //     }
    // };
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

    });
    const roomNames = {};

    // Duyệt qua dataTables và lưu tên của các bàn vào tableNames
    Object.keys(dataRoom).forEach((roomKey) => {
        const room = dataRoom[roomKey];
        roomNames[roomKey] = room.Name;
    });
    const handleSearchChange = (query) => {
        if (query !== '') {
            setSearchQuery(query);
        }
    };
    useEffect(() => {
        // Chuyển đổi dataRoom thành mảng cho Dropdown
        const roomOptions = Object.keys(dataRoom).map((key) => {
            return { label: dataRoom[key].Name, value: key };
        });
        setRoomDropdownData(roomOptions);
    }, [dataRoom]);
    const handleRoomChange = (selectedValue) => {
        setSelectedRoom(selectedValue);
    };
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    return (
        <PaperProvider theme={theme}>
            <SafeAreaView
                style={finalStyles.container_order}>
                <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                    <SearchBar
                        style={{ width: "auto", height: 50, marginLeft: 20 }}
                        fontColor="#ffffff"
                        iconColor="#ffffff"
                        shadowColor="#282828"
                        cancelIconColor="#ffffff"
                        backgroundColor="#ffffff"
                        placeholder="Tìm kiếm"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearIconComponent={() => null}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50, marginTop: 10 }}>
                    <TouchableOpacity onPress={openFilterMenu}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                            <Text>{currentRoom} ({currentRoom === 'Tất cả' ? Object.keys(filteredOrders).length : (orderCountByRoom[currentRoom] || 0)})</Text>
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

                            {/*onPress={openCreateOrder} */ }
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
                    {Object.keys(filteredOrders).reverse().map((orderId) => {
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
                                    <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { titleCustomerName: order.CustomerName })}>
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
