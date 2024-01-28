import React, { createContext, useEffect, useState, useRef, useContext } from "react";
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform,
    StyleSheet,
    AsyncStorage,
    Alert,
    SafeAreaView,
    ScrollView,
    ImageBackground,
    TextInput,
    FlatList,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import {
    getDatabase,
    ref,
    onValue,
    push,
    get,
    set,
    query,
    orderByChild,
    equalTo,
} from 'firebase/database';
import {
    getStorage,
    ref as storageRef,
    listAll,
    getDownloadURL,
} from "firebase/storage";
import { useRoute } from '@react-navigation/native';
import { BottomSheet } from 'react-native-sheet';
import SearchBar from "react-native-dynamic-search-bar";
import { Dropdown } from 'react-native-element-dropdown';

export const ImageAllFolderContext = createContext();

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007AFF', // Thay đổi màu primary theo ý muốn
    },
};

export const ImageAllFolderProvider = ({ children }) => {
    const [imageAllFolder, setImageAllFolder] = useState({});
    const database = getDatabase(FIREBASE_APP);
    const storage = getStorage(FIREBASE_APP);

    useEffect(() => {
        fetchAllItems();
    }, []);

    const listAllItemsInFolder = async (folderPath) => {
        const folderRef = storageRef(storage, folderPath);
        try {
            const items = await listAll(folderRef);
            const itemDetails = [];

            for (const item of items.items) {
                const itemUrl = await getDownloadURL(item);
                itemDetails.push({ name: item.name, url: itemUrl });
            }

            return itemDetails;
        } catch (error) {
            console.error("Error listing items in folder:", error);
            return [];
        }
    };

    const fetchAllItems = async () => {
        try {
            const folders = ["Toppings", "Foods", "FoodBonus", "Drinks", "Drink2ND", "Games"];
            const allItems = {};

            for (const folder of folders) {
                const items = await listAllItemsInFolder(folder);
                allItems[folder] = items;
                setImageAllFolder((prevItems) => (Array.isArray(prevItems) ? [...prevItems, ...items] : [...items]));
            }
        } catch (error) {
            console.error("Error fetching all items:", error);
        }
    };

    return (
        <ImageAllFolderContext.Provider value={{ imageAllFolder }}>
            {children}
        </ImageAllFolderContext.Provider>
    );
};

export const useImageAllFolder = () => {
    const context = useContext(ImageAllFolderContext);
    if (!context) {
        throw new Error('useImageAllFolder must be used within an ImageAllFolderProvider');
    }
    return context;
};

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
    const bottomSheetFood = useRef(null);
    const [orderCountByRoom, setOrderCountByRoom] = useState({});
    const [currentRoom, setCurrentRoom] = useState('Tất cả');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [imageUrls, setImageUrls] = useState({});
    const [imageAll, setImageAll] = useState({});
    const { imageAllFolder } = useImageAllFolder();
    const [cartItems, setCartItems] = useState({});
    const screenHeight = Dimensions.get('window').height; // Lấy chiều cao màn hình
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
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

    const handleSelectCategory = (key) => {
        setSelectedCategory(key);
    };

    const getFilteredData = () => {
        switch (selectedCategory) {
            case 'C1':
                return Object.entries(dataDrinks);
            case 'C2':
                return Object.entries(dataDrink2ND);
            case 'C3':
                return Object.entries(dataFoods);
            case 'C4':
                return Object.entries(dataToppings);
            case 'C5':
                return Object.entries(dataFoodBonus);
            case 'C6':
                return Object.entries(dataGames);
            case '':
            default:
                return [
                    ...Object.entries(dataDrinks),
                    ...Object.entries(dataDrink2ND),
                    ...Object.entries(dataFoods),
                    ...Object.entries(dataToppings),
                    ...Object.entries(dataFoodBonus),
                    ...Object.entries(dataGames),
                ];
        }
    };

    const addToCart = (key, name, quantity, price) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };

            if (newCartItems[key]) {
                newCartItems[key].quantity += quantity;
                newCartItems[key].totalPrice += price * quantity;
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
                } else {
                    delete newCartItems[key];
                }
            }
            return newCartItems;
        });
    };

    const totalItemsInCart = Object.values(cartItems).reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalCartPrice = Object.values(cartItems).reduce(
        (total, item) => total + item.totalPrice,
        0
    );
    //-------------------------------------------------------------End Add Food-------------------------------------------------------------
    const openFoodOrder = () => {
        bottomSheetFood.current.show();
    };
    const deleteFoodOrder = () => {
        setCartItems('');
    };
    const closeFoodOrder = () => {
        bottomSheetFood.current.hide();
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
        container_foodorder: {
            flex: 1,
            backgroundColor: "#ffffff",
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
        //------------------------------- Css Món Ăn----------------------------------
        categoryButton: {
            marginRight: 10,
            borderRadius: 15,
            paddingHorizontal: 16,
            paddingVertical: 8, // Thay đổi thành marginVertical
            borderWidth: 1,
            borderColor: '#D3D3D3',
            minHeight: 40,
            marginBottom: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        categoryButtonText: {
            fontWeight: 'bold',
        },
        categoryButtonSelected: {
            backgroundColor: '#667080',
            borderColor: '#667080',
        },
        categoryButtonTextSelected: {
            color: '#FFFFFF',
        },
        listContainer: {
            paddingHorizontal: 10,
            alignItems: 'flex-start',
            paddingBottom: Object.keys(cartItems).length > 0?60:0,
        },
        // image: {

        //     width: '100%',
        //     height: 150,
        //     borderRadius: 10,
        // },
        // itemName: {

        // },
        // itemPrice: {

        // },
        // listContainer: {
        //     paddingHorizontal: 10,
        //     alignItems: 'flex-start',
        //     height: '100%',
        // },
        gridTotal: {
            width: '100%',
            height: 'auto'
            
        },
        // CSS cho gridItem
        gridItem: {
            width: Dimensions.get('window').width - 40,
            
            paddingTop: 20,
            paddingBottom: 20,
            flexDirection: 'row',
            marginLeft: 10,
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
            paddingBottom: 15
        },

        // CSS cho giá sản phẩm
        itemPrice: {
            color: '#667080',
        },

    });
    const webStyles = StyleSheet.create({

    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...
    return (

        <View >
            <View style={{ flexDirection: 'row', marginTop: 'auto', marginBottom: 20 }}>
                <SearchBar
                    style={{ width: "auto", height: 50, marginLeft: 20, marginTop: 20 }}
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 20, height: 'auto', width: 'auto' }}>
                <TouchableOpacity onPress={() => handleSelectCategory('')} style={[finalStyles.categoryButton, selectedCategory === '' && finalStyles.categoryButtonSelected]}>
                    <View>
                        <Text style={[finalStyles.categoryButtonText, selectedCategory === '' && finalStyles.categoryButtonTextSelected]}>Tất cả</Text>
                    </View>
                </TouchableOpacity>
                {Object.keys(dataCategories).map((key) => (
                    <TouchableOpacity key={key} onPress={() => handleSelectCategory(key)} style={[finalStyles.categoryButton, selectedCategory === key && finalStyles.categoryButtonSelected]}>
                        <Text style={[finalStyles.categoryButtonText, selectedCategory === key && finalStyles.categoryButtonTextSelected]}>{dataCategories[key].Name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FlatList
                data={getFilteredData()}
                renderItem={({ item, index }) => {
                    const [key, data] = item;
                    const name = data.Name;

                    // Số lượng cho mục này
                    const quantity = cartItems[key] ? cartItems[key].quantity : 0;

                    // Check if imageAll is defined and contains data for the selected category
                    const imageArray = imageAllFolder || [];

                    // Find the URL for the specific key or provide a default URL if not found
                    const url = imageArray.find((item) => item.name === `${key}.jpg`).url;

                    return (
                        <View style={[finalStyles.gridTotal]}>
                            <View
                                style={[
                                    finalStyles.gridItem,
                                    index === getFilteredData().length - 1
                                        ? { borderBottomWidth: 0 } // No border for the last item
                                        : { borderBottomWidth: 1, borderBottomColor: 'gray' },
                                ]}
                            >
                                <View style={{ width: '20%' }}>
                                    <Image source={{ uri: url }} style={finalStyles.image} />
                                </View>
                                <View style={finalStyles.itemDetails}>
                                    <Text style={finalStyles.itemName}>{name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start' }]}>{`${data.Price.toLocaleString('vi-VN')}đ`}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 20 }}>
                                            {quantity > 0 ? ( // Nếu số lượng > 0, hiển thị nút giảm và số lượng
                                                <>
                                                    <TouchableOpacity onPress={() => removeFromCart(key)}>
                                                        <IconAnt name="minuscircleo" size={24} color="#667080" />
                                                    </TouchableOpacity>
                                                    <Text style={{ marginLeft: 8, marginRight: 8 }}>{quantity}</Text>
                                                    <TouchableOpacity onPress={() => addToCart(key, name, 1, data.Price)}>
                                                        <IconAnt name="pluscircleo" size={24} color="#667080" />
                                                    </TouchableOpacity>
                                                </>
                                            ) : ( // Ngược lại, chỉ hiển thị nút tăng
                                                <TouchableOpacity onPress={() => addToCart(key, name, 1, data.Price)}>
                                                    <IconAnt name="pluscircleo" size={24} color="#667080" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                }}
                numColumns={1}
                keyExtractor={(item) => item[0]}
                contentContainerStyle={[finalStyles.listContainer, getFilteredData().length >= 5?{height:'auto'}:{height:Dimensions.get('window').height - 20,}]}
            />
            {Object.keys(cartItems).length > 0 ? (
                <View style={{
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
                    justifyContent: 'space-between', // Add this line to distribute content horizontally
                }}>
                    {/* Left Component */}
                    <TouchableOpacity style={{ justifyContent: 'flex-start' }} onPress={openFoodOrder}>
                        <View style={{ flexDirection: 'row', position: 'relative', paddingLeft: 20 }}>
                            <IconFontAwesome5 name="shopping-basket" size={24} color="#667080" />
                            <Text style={{ position: "absolute", left: 45, top: -10, fontSize: 12 }}>{totalItemsInCart}</Text>
                        </View>
                    </TouchableOpacity>
                    <BottomSheet ref={bottomSheetFood} height={600} draggable={false} backdropClosesSheet={false} >
                        <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop:10, justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity onPress={deleteFoodOrder}>
                                <Text style={{ justifyContent: 'flex-start', color: "#667080" }}>Xóa tất cả</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeFoodOrder}>
                                <Icon name="close" size={24} color="#667080" />
                            </TouchableOpacity>

                        </View>

                        <View>
                            <FlatList
                                data={Object.entries(cartItems)}
                                renderItem={({ item, index }) => {
                                    const [key, data] = item;
                                    const name = data.name;
                                    const price = data.price;
                                    const quantity = data.quantity;

                                    const imageArray = imageAllFolder || [];

                                    // Find the URL for the specific key or provide a default URL if not found
                                    const url = imageArray.find((item) => item.name === `${key}.jpg`).url;
                                    return (
                                        <View style={[finalStyles.gridTotal]}>
                                            <View
                                                style={[
                                                    finalStyles.gridItem,
                                                    index === getFilteredData().length - 1
                                                        ? { borderBottomWidth: 0 } // No border for the last item
                                                        : { borderBottomWidth: 1, borderBottomColor: 'gray' },
                                                ]}
                                            >
                                                <View style={{ width: '20%' }}>
                                                    <Image source={{ uri: url }} style={finalStyles.image} />
                                                </View>
                                                <View style={finalStyles.itemDetails}>
                                                    <Text style={finalStyles.itemName}>{name}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start' }]}>{`${price.toLocaleString('vi-VN')}đ`}</Text>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 20 }}>
                                                            {quantity > 0 ? ( // Nếu số lượng > 0, hiển thị nút giảm và số lượng
                                                                <>
                                                                    <TouchableOpacity onPress={() => removeFromCart(key)}>
                                                                        <IconAnt name="minuscircleo" size={24} color="#667080" />
                                                                    </TouchableOpacity>
                                                                    <Text style={{ marginLeft: 8, marginRight: 8 }}>{quantity}</Text>
                                                                    <TouchableOpacity onPress={() => addToCart(key, name, 1, price)}>
                                                                        <IconAnt name="pluscircleo" size={24} color="#667080" />
                                                                    </TouchableOpacity>
                                                                </>
                                                            ) : ( // Ngược lại, chỉ hiển thị nút tăng
                                                                <TouchableOpacity onPress={() => addToCart(key, name, 1, price)}>
                                                                    <IconAnt name="pluscircleo" size={24} color="#667080" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                                numColumns={1}
                                keyExtractor={(item) => item[0]}
                                contentContainerStyle={[finalStyles.listContainer,Object.entries(cartItems).length >= 5?{paddingBottom:90}:{height:Dimensions.get('window').height - 20}]}
                            />
                        </View>

                        <View style={{
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
                            justifyContent: 'space-between', // Add this line to distribute content horizontally
                        }}>
                            {/* Left Component */}
                            <TouchableOpacity style={{ justifyContent: 'flex-start' }} onPress={closeFoodOrder}>
                                <View style={{ flexDirection: 'row', position: 'relative', paddingLeft: 20 }}>
                                    <IconFontAwesome5 name="shopping-basket" size={24} color="#667080" />
                                    <Text style={{ position: "absolute", left: 45, top: -10, fontSize: 12 }}>{totalItemsInCart}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ marginBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ marginRight: 10, paddingTop: 10 }}>{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
                                <TouchableOpacity
                                    style={{
                                        alignItems: "center",
                                        backgroundColor: "#667080",
                                        // Take up the full width
                                        width: 120,
                                        height: 55,
                                        top: 5,
                                        justifyContent: 'center' // Center the text vertically
                                    }}

                                >
                                    <Text style={{
                                        color: "#ffffff",
                                        fontSize: 14,
                                    }}>Xác nhận</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BottomSheet>



                    <View style={{ marginBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginRight: 10, paddingTop: 10 }}>{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
                        <TouchableOpacity
                            style={{
                                alignItems: "center",
                                backgroundColor: "#667080",
                                // Take up the full width
                                width: 120,
                                height: 55,
                                top: 5,
                                justifyContent: 'center' // Center the text vertically
                            }}

                        >
                            <Text style={{
                                color: "#ffffff",
                                fontSize: 14,
                            }}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            ) : null}

        </View>

    );


}