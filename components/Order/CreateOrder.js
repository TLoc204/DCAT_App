import React, { createContext, useEffect, useState, useRef, useContext } from "react";
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
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function OrderDetails({ route }) {
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
    //-----------------------------------------------------------End Room-------------------------------------------------------------
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
            

            paddingTop:20,
            
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

            paddingHorizontal: 10,
            alignItems: 'flex-start',
            marginTop: 10
        },
        gridTotal:{
            width:'100%',
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 
            
        },
        // CSS cho gridItem
        gridItem: {
            width: Dimensions.get('window').width - 50, // Đặt một giá trị cố định và trừ đi tổng marginLeft và marginRight
            marginVertical: 10,
            display: 'flex',
            paddingBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 50,
            marginTop: 10,
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
            marginLeft: 10,
        },

        // CSS cho tên sản phẩm
        itemName: {
            // Thêm kiểu CSS cho tên sản phẩm theo ý bạn
        },

        // CSS cho giá sản phẩm
        itemPrice: {
            // Thêm kiểu CSS cho giá sản phẩm theo ý bạn
        },

    });

    const webStyles = StyleSheet.create({

    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <ScrollView>
                <View>
                    <Text style={{ marginLeft: 20, marginBottom: 5 }}>Tên khách hàng</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} />
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

                    <View>
                        <TouchableOpacity onPress={()=> navigation.navigate('FoodOrder')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                <Text style={{ color: '#007AFF' }}>Thêm</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );


}