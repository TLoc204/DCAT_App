import React, { createContext, useEffect, useState, useRef, useContext } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground, TextInput, FlatList, SectionList,Keyboard } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { BottomSheet } from 'react-native-sheet';
import SearchBar from "react-native-dynamic-search-bar";
import { Dropdown } from 'react-native-element-dropdown';
import { getStorage, ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import { useImageAllFolder } from "./FoodOrder"
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { showMessage, hideMessage, } from "react-native-flash-message";
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function CreateOrder({ route }) {
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
    let [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [imageUrls, setImageUrls] = useState({});
    const [imageAll, setImageAll] = useState({});
    const { imageAllFolder } = useImageAllFolder();
    const [discountTotal, setDiscountTotal] = useState('');
    const screenHeight = Dimensions.get('window').height; // Lấy chiều cao màn hình
    const foods = route.params?.Foods || {};
    const [discount, setDiscount] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    useEffect(() => {
        // Chỉ cập nhật cartItems nếu foods thực sự thay đổi.
        const currentFoods = JSON.stringify(foods);
        const prevFoods = JSON.stringify(cartItems);

        if (currentFoods !== prevFoods) {
            setCartItems(foods ? foods : []);
        }
    }, [foods]); // Chỉ re-run khi foods thay đổi.

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
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
          setIsKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
          setIsKeyboardVisible(false);
        });
        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
      }, []);
    //-----------------------------------------------------------Room-----------------------------------------------------------------
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

    const addToCart = (key, name, quantity, price) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };

            if (newCartItems[key]) {
                newCartItems[key].quantity += quantity;
                newCartItems[key].totalPrice = newCartItems[key].price * newCartItems[key].quantity;

                // Cập nhật giảm giá nếu có
                if (newCartItems[key].discount !== undefined) {
                    newCartItems[key].discountPrice = calculateTotalPrice(newCartItems[key]);
                }
            } else {
                newCartItems[key] = { name, quantity, price, totalPrice: price * quantity };
            }

            return newCartItems;
        });
    };


    const removeFromCart = (key) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };
            if (newCartItems[key]) {
                if (newCartItems[key].quantity > 1) {
                    newCartItems[key].quantity -= 1;
                    newCartItems[key].totalPrice = newCartItems[key].price * newCartItems[key].quantity;

                    // Cập nhật giảm giá nếu có
                    if (newCartItems[key].discount !== undefined) {
                        newCartItems[key].discountPrice = calculateTotalPrice(newCartItems[key]);
                    }
                } else {
                    delete newCartItems[key];
                }
            }
            return newCartItems;
        });
    };
    const updateDiscount = (key, discountValue) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };

            if (newCartItems[key]) {
                const price = newCartItems[key].price; // Lấy giá của món hàng
                newCartItems[key].discount = discountValue; // Cập nhật giảm giá

                // Tính toán và cập nhật discountPrice
                newCartItems[key].discountPrice = calculateTotalPrice(newCartItems[key]);
            }

            return newCartItems;
        });
    };

    const calculateTotalPrice = (item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        const discount = item.discount || 0;

        // Tính giá trị sau giảm giá
        const discountedPrice = price * (1 - discount / 100);

        return discountedPrice * quantity;
    };

    const totalItemsInCart = Object.values(cartItems).reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalCartPrice = Object.values(cartItems).reduce(
        (total, item) => total + item.totalPrice,
        0
    );
    const totalCartDiscountPrice = Object.values(cartItems).reduce(
        (total, item) => total + (item.totalPrice - (item.discountPrice || 0)),
        0
    );
    const checkInput = () => {
        if (!selectedRoom || !Object.values(selectedRoom)[1]) {
            selectedRoom = ''; // Gán giá trị mặc định là chuỗi rỗng
        }
        if (selectedRoom.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng chọn phòng."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }

        if (customerName.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng nhập tên khách."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }

    }
    //-----------------------------------------------------------End Room-------------------------------------------------------------
    const handleSubmit = async () => {
        // Kiểm tra selectedRoom và customerName nếu trống
        if (!selectedRoom || !Object.values(selectedRoom)[1]) {
            selectedRoom = ''; // Gán giá trị mặc định là chuỗi rỗng
        }
        if (customerName.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng nhập tên khách."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }
        // Kiểm tra độ dài của selectedRoom
        if (selectedRoom.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng chọn phòng."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }

        if (Object.values(selectedRoom)[1].length > 0 && customerName.length > 0) {
            const ordersRef = ref(database, 'Orders');
            let lastOrderKey = '';

            await get(ordersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const orderKeys = Object.keys(data);
                        lastOrderKey = orderKeys[orderKeys.length - 1];
                    } else {
                        console.log("No data available");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

            const newOrderKey = 'O' + (parseInt(lastOrderKey.substring(1)) + 1);

            let orderDetailsData = {};
            Object.values(cartItems).forEach((item, index) => {
                const orderKey = 'OD1';
                const itemKey = `${orderKey}_${index + 1}`;
                const itemId = item.key.split('_')[0];
                const itemTypePrefix = itemId.match(/[A-Za-z]+/)[0];
                let itemType = '';

                switch (itemTypePrefix) {
                    case 'D':
                        itemType = 'IdDrink';
                        break;
                    case 'F':
                        itemType = 'IdFood';
                        break;
                    case 'DD':
                        itemType = 'IdDrink2ND';
                        break;
                    case 'Tp':
                        itemType = 'IdTopping';
                        break;
                    case 'Fb':
                        itemType = 'IdFoodBonus';
                        break;
                    case 'G':
                        itemType = 'IdGame';
                        break;
                    default:
                        console.log("Unknown item type");
                }

                if (!orderDetailsData[orderKey]) {
                    orderDetailsData[orderKey] = {};
                }

                orderDetailsData[orderKey][itemKey] = {
                    [itemType]: itemId,
                    "Quantity": item.quantity,
                    "Discount": item.discount,
                };
            });

            orderDetailsData['OD1']['CustomerName'] = customerName || 'Khách hàng';

            const newOrderData = {
                "CreatedDate": new Date().toISOString().split('T')[0],
                "Delete": false,
                "IdRoom": Object.values(selectedRoom)[1] || 'Rm3',
                "OrderDetails": orderDetailsData,
                "PaidDate": new Date().toISOString().split('T')[0],
                "TotalAmount": totalCartPrice,
                "TotalDiscountPrice": totalCartDiscountPrice,
                "DiscountTotal": discountTotal || 0
            };

            await set(ref(database, 'Orders/' + newOrderKey), newOrderData)
                .then(() => {
                    console.log('Order saved successfully!');
                })
                .catch((error) => {
                    console.error('Failed to save order: ', error);
                });
        }
        navigation.navigate('Order')
    };
    const CustomMessageComponent = ({ message, description, icon }) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: -30 , marginTop:10 }}>
                    <IconAnt name={icon} size={24} color={'#ffffff'} />
                    <Text style={{ marginLeft: 10, color: '#ffffff' }}>{message}</Text>
                </View>
                <Text style={{ marginLeft: 5, color: '#ffffff' }}>{description}</Text>
            </View>
        );
    };
    const handleCreateOrder = () => {
        if (Object.values(cartItems).length > 0 && 
        selectedRoom  &&
        customerName.length > 0) {
            handleSubmit();
            showMessage({
                message: "Tạo đơn thành công",
                type: "success",
                icon: { icon: "success", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thành công"
                        description="Đơn hàng của bạn đã được tạo thành công."
                        icon="checkcircle"
                    />
                ),
            });
            setTimeout(() => {
                hideMessage();
            }, 2000); // 2000 miliseconds = 2 giây
        } else {
            checkInput();
        }
    }
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
            paddingTop: 20,
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

        input_cus: {
            flex: 1,
            backgroundColor: "#ffffff",
            padding: 10,
            borderRadius: 10,
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            marginLeft: 20,
            marginRight: 20,

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
            paddingHorizontal: 0,
            alignItems: 'flex-start',
        },
        gridTotal: {
            width: '100%',
            height: 'auto'
        },
        // CSS cho gridItem
        gridItem: {
            width: Dimensions.get('window').width - 40,

            paddingTop: 10,
            paddingBottom: 10,
            flexDirection: 'row',
            marginLeft: 5,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
        },

        // CSS cho ảnh
        image: {
            width: 80,
            height: 80,
            borderRadius: 10,
        },

        // CSS cho phần view bên phải của ảnh
        itemDetails: {
            marginLeft: 20,
            width: '80%',
            justifyContent: 'center',
            height: 80,
        },

        // CSS cho tên sản phẩm
        itemName: {

        },

        // CSS cho giá sản phẩm
        itemPrice: {
            color: '#667080',
        },
        orderlist: {
            flex: 1,
            backgroundColor: "#ffffff",
            padding: 10,
            paddingLeft: 10,
            paddingTop: Object.values(cartItems).length > 0 ? 5 : 10,
            paddingRight: 10,
            paddingBottom: 10,
            borderRadius: 10,
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            marginLeft: 20,
            marginRight: 20,
        }
    });

    const webStyles = StyleSheet.create({

    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <ScrollView>
                <View style={{ marginBottom: '20%' }}>
                    <Text style={{ marginLeft: 20, marginBottom: 5 }}>Tên khách hàng</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} onChangeText={(text) => { setCustomerName(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Phòng</Text>
                    <View style={finalStyles.input_cus}>
                        <View style={finalStyles.pickerContainer}>
                            <Dropdown
                                style={finalStyles.dropdown}
                                placeholderStyle={finalStyles.placeholderStyle}
                                selectedTextStyle={finalStyles.selectedTextStyle}
                                inputSearchStyle={finalStyles.inputSearchStyle}
                                itemTextStyle={finalStyles.inputStyleDD}
                                iconStyle={finalStyles.iconStyle}
                                data={roomDropdownData}
                                placeholder="Chọn phòng"
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                onChange={handleRoomChange}
                            />
                        </View>
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Danh sách món</Text>
                    <View style={finalStyles.orderlist}>
                        <FlatList
                            data={Object.entries(cartItems)}
                            renderItem={({ item, index }) => {
                                const [key, data] = item;
                                const name = data.name;
                                const price = data.price;
                                const totalPrice = data.totalPrice;
                                const discountPrice = data.discountPrice || '';
                                const quantity = data.quantity;

                                const imageArray = imageAllFolder || [];

                                // Find the URL for the specific key or provide a default URL if not found
                                const url = imageArray.find((item) => item.name === `${key.split('_')[0]}.jpg`).url;
                                return (
                                    <View style={[finalStyles.gridTotal]}>
                                        <View
                                            style={[
                                                finalStyles.gridItem,
                                                index === Object.entries(cartItems).length - 1
                                                    ? { borderBottomWidth: 0 } // No border for the last item
                                                    : { borderBottomWidth: 1, borderBottomColor: 'gray' },
                                            ]}
                                        >
                                            <View style={{ width: '20%' }}>
                                                <Image source={{ uri: url }} style={finalStyles.image} />
                                            </View>
                                            <View style={finalStyles.itemDetails}>
                                                <Text style={finalStyles.itemName}>{name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text>Giảm giá:</Text>
                                                    {cartItems[key].discount !== undefined ? ( // Kiểm tra nếu có giá trị discount thì hiển thị nó
                                                        <Text>{cartItems[key].discount}%</Text>
                                                    ) : ( // Nếu không có giá trị discount thì cho phép người dùng nhập
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <TextInput
                                                                value={discount[key] || ''} // Use the discount value from the discount object
                                                                inputMode="decimal"
                                                                onChangeText={(text) => {
                                                                    // Update the discount for the specific item in the discount object
                                                                    setDiscount((prevDiscount) => ({
                                                                        ...prevDiscount,
                                                                        [key]: text,
                                                                    }));
                                                                }}
                                                                onEndEditing={() => {
                                                                    // Update the discount for the specific item in cartItems
                                                                    updateDiscount(key, discount[key]);
                                                                    // Clear the discount state for the specific item
                                                                    setDiscount((prevDiscount) => ({
                                                                        ...prevDiscount,
                                                                        [key]: '',
                                                                    }));
                                                                }}
                                                            />
                                                            <Text>%</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View>
                                                        {cartItems[key].discount !== 0 ? ( // Check if there is a discount for the item
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start', textDecorationLine: 'line-through' }]}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                                <Text style={[finalStyles.itemPrice, { marginLeft: 5 }]}>{`${(totalPrice - discountPrice).toLocaleString('vi-VN')}đ`}</Text>
                                                            </View>
                                                        ) : (
                                                            <Text style={finalStyles.itemPrice}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                        )}
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 50 }}>

                                                        <Text style={{ marginLeft: 8, marginRight: 8 }}>SL: {quantity}</Text>

                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                            numColumns={1}
                            keyExtractor={(item) => item[0]}
                            contentContainerStyle={[finalStyles.listContainer]}
                        />
                        <View>
                            <TouchableOpacity style={{
                                alignItems: "center",
                                backgroundColor: "#667080",
                                borderRadius: 15,
                                paddingVertical: 15,
                                marginHorizontal: 5,
                            }} onPress={() => navigation.navigate('FoodOrder', { Foods: cartItems })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                    <Text style={{ color: '#ffffff' }}>Thêm món</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 5 }}>Mã giảm giá </Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} onChangeText={(text) => { setDiscountTotal(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Chi tiết thanh toán</Text>
                    <View style={finalStyles.orderlist}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'gray', }}>
                            <Text style={{ justifyContent: 'flex-start' }}>Tổng</Text>
                            <Text style={{ justifyContent: 'flex-end' }}>{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
                        </View>

                        {Object.entries(cartItems).filter(([key, data]) => data.discount !== undefined && data.discount > 0).map(([key, data], index) => {
                            if (data.discount !== undefined && data.discount > 0) { // Check if there is a discount
                                return (
                                    <View style={{ justifyContent: 'space-between', paddingBottom: 10, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: 'gray', }}>
                                        <Text style={{ justifyContent: 'flex-start' }}>Các món khuyến mãi</Text>
                                        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', justifyContent: 'flex-start' }}>
                                                <Text>{`${index + 1}. `}</Text>
                                                <Text style={{ justifyContent: 'flex-start' }}>{data.name}</Text>
                                            </View>
                                            <Text style={{ justifyContent: 'flex-end' }}>{`-${(data.discountPrice).toLocaleString('vi-VN')}đ`}</Text>
                                        </View>
                                    </View>
                                );
                            } else {
                                return null; // Don't render if there's no discount
                            }
                        })}

                        {discountTotal > 0 ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'gray' }}>
                                <Text style={{ justifyContent: 'flex-start' }}>Khấu trừ giảm giá</Text>
                                <Text style={{ justifyContent: 'flex-end' }}>{`${(totalCartDiscountPrice * discountTotal / 100) > 0 ? '-' : ''}${(totalCartPrice * discountTotal / 100).toLocaleString('vi-VN')}đ`}</Text>
                            </View>
                        ) : null}

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={{ justifyContent: 'flex-start', fontWeight: 'bold' }}>Tổng cộng</Text>
                            <Text style={{ justifyContent: 'flex-end', fontWeight: 'bold' }}>{(discountTotal ? (totalCartDiscountPrice - (totalCartPrice * discountTotal / 100)) : totalCartDiscountPrice).toLocaleString('vi-VN')}đ</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
            {!isKeyboardVisible?
            (    <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                width: '100%',
                height: 55,
                alignItems: 'center',
                shadowColor: "#0000000D",
                shadowOpacity: 0.1,
                shadowOffset: {
                    width: 0,
                    height: 20
                },
                shadowRadius: 35,
                elevation: 35,
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                {/* Left Component */}
                <TouchableOpacity style={{ justifyContent: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', position: 'relative', paddingLeft: 20 }}>
                        {/* Add any content for the left component here */}
                    </View>
                </TouchableOpacity>

                {/* Right Component */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ marginRight: 10 }}>{totalCartDiscountPrice.toLocaleString('vi-VN')}đ</Text>
                    <TouchableOpacity
                        style={{
                            alignItems: "center",
                            backgroundColor: "#667080",
                            width: 120,
                            height: 55,
                            top: 0,
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            handleCreateOrder()
                        }}
                    >
                        <Text style={{
                            color: "#ffffff",
                            fontSize: 14,
                        }}>Tạo đơn</Text>
                    </TouchableOpacity>
                </View>
            </View>)
            :null}
        
        </SafeAreaView>
    );


}
