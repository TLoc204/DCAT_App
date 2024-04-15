import React, { createContext, useEffect, useState, useRef, useContext } from "react";
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform,
    StyleSheet,
    ScrollView,
    TextInput,
    FlatList,
    Keyboard
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import {
    getDatabase,
    ref,
    onValue
} from 'firebase/database';
import {
    getStorage,
    ref as storageRef,
    listAll,
    getDownloadURL,
} from "firebase/storage";
import { BottomSheet } from 'react-native-sheet';
import { SearchBar } from 'react-native-elements';

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
            const folders = ["Topping", "Foods", "FoodBonus", "Drinks", "Drink2ND", "Games"];
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

export default function FoodOrder({ route }) {
    const database = getDatabase(FIREBASE_APP);
    const [dataOrders, setDataOrders] = useState([]);
    const [dataRoom, setDataRoom] = useState([]);
    const [dataFoods, setDataFoods] = useState([]);
    const [dataCategories, setDataCategories] = useState([]);
    const [dataFoodBonus, setDataFoodBonus] = useState([]);
    const [dataDrinks, setDataDrinks] = useState([]);
    const [dataDrink2ND, setDataDrink2ND] = useState([]);
    const [dataToppings, setDataToppings] = useState([]);
    const [dataGames, setDataGames] = useState([]);

    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const bottomSheetFood = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState('');

    const { imageAllFolder } = useImageAllFolder();

    const foods = route.params?.Foods || {};
    const Orders = route.params?.Orders || {};
    const OrderID = route.params?.OrderID || {};
    const [discount, setDiscount] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [defaultImageUrl, setDefaultImageUrl] = useState('https://firebasestorage.googleapis.com/v0/b/dcat-c09a4.appspot.com/o/MacDinh.jpg?alt=media&token=d66af2a0-9be6-44cb-9eda-504f04c1763c');
    useEffect(() => {
        // Chỉ cập nhật cartItems nếu foods thực sự thay đổi.
        const currentFoods = JSON.stringify(foods);
        const prevFoods = JSON.stringify(cartItems);

        if (currentFoods !== prevFoods) {
            setCartItems(foods ? foods : []);
        }
    }, [foods]); // Chỉ re-run khi foods thay đổi.
    useEffect(() => {
        setFilteredOrders(getFilteredData()); 
    }, [selectedCategory, dataDrinks, dataDrink2ND, dataFoods, dataToppings, dataFoodBonus, dataGames]);
    
    const [bottomSheetData, setBottomSheetData] = useState({});
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
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
        setInitialDataLoaded(true);
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
    const addToCart = () => {
        if (bottomSheetData) {
            setCartItems((prevCartItems) => {
                const key = Object.keys(bottomSheetData)[0];
                const currentItem = Object.values(bottomSheetData)[0];

                if (currentItem) {
                    const newCartItems = { ...prevCartItems };

                    // Lọc các mục có cùng key với key ban đầu
                    const filteredItems = Object.values(newCartItems).filter(
                        (item) => item.key.startsWith(key)
                    );

                    if (filteredItems.length > 0) {
                        // Kiểm tra trùng discount
                        const existingItem = filteredItems.find(
                            (item) => item.discount === currentItem.discount
                        );

                        if (existingItem) {
                            // Trùng key và discount, tăng quantity và cộng tổng giá trị
                            newCartItems[existingItem.key].quantity += currentItem.quantity;
                            newCartItems[existingItem.key].totalPrice += currentItem.price * currentItem.quantity;
                        } else {
                            // Trùng key, nhưng khác discount, thêm số index vào key
                            const lastIndex = filteredItems.length + 1;
                            const newKey = `${key}_${lastIndex}`;
                            newCartItems[newKey] = {
                                ...currentItem,
                                key: newKey,
                                totalPrice: currentItem.price * currentItem.quantity,
                            };
                        }
                    } else {
                        // Không có mục nào cùng key, tạo mục mới
                        const newKey = key;
                        newCartItems[newKey] = {
                            ...currentItem,
                            key: newKey,
                            totalPrice: currentItem.price * currentItem.quantity,
                        };
                    }

                    return newCartItems;
                } else {
                    // Xử lý khi currentItem không tồn tại (hiển thị thông báo lỗi hoặc thực hiện hành động khác)
                    return prevCartItems;
                }
            });
        } else {
            // Xử lý khi bottomSheetData không tồn tại
        }
        setIsBottomSheetVisible(false);
    };
    const addToCartSheet = (customKey, customDiscount) => {
        if (bottomSheetData) {
            setCartItems((prevCartItems) => {
                const key = customKey;
                const discount = customDiscount;
                const currentItem = Object.values(cartItems)[0]; // Lấy currentItem từ cartItems

                if (currentItem) {
                    const newCartItems = { ...prevCartItems };

                    // Kiểm tra xem có mục nào trong cartItems có cùng key và discount không
                    const existingCartItem = Object.values(newCartItems).find(
                        (item) => item.key === key && item.discount === discount
                    );

                    if (existingCartItem) {
                        // Nếu đã tồn tại mục có cùng key và discount, cộng thêm quantity và tính lại totalPrice
                        newCartItems[existingCartItem.key].quantity += 1;
                        newCartItems[existingCartItem.key].totalPrice = newCartItems[existingCartItem.key].price * newCartItems[existingCartItem.key].quantity;
                        newCartItems[existingCartItem.key].discountPrice = (newCartItems[existingCartItem.key].price * newCartItems[existingCartItem.key].quantity) * (newCartItems[existingCartItem.key].discount / 100);
                    } else {
                        const lastIndex = Object.keys(newCartItems).length + 1;
                        const newKey = `${key}_${lastIndex}`;
                        newCartItems[newKey] = {
                            ...currentItem,
                            key: newKey,
                            totalPrice: currentItem.price * currentItem.quantity,
                        };
                    }

                    return newCartItems;
                } else {
                    // Xử lý khi currentItem không tồn tại (hiển thị thông báo lỗi hoặc thực hiện hành động khác)
                    return prevCartItems;
                }
            });
        } else {
            // Xử lý khi bottomSheetData không tồn tại
        }
        setIsBottomSheetVisible(false);
    };





    const removeFromCart = (key) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };

            // Lọc các mục có cùng key với key ban đầu
            const filteredItems = Object.values(newCartItems).filter(
                (item) => item.key.startsWith(key)
            );

            if (filteredItems.length > 0) {
                // Kiểm tra trùng discount
                const existingItem = filteredItems.find(
                    (item) => item.discount === filteredItems[0].discount
                );

                if (existingItem) {
                    // Trùng key và discount, giảm quantity và cập nhật tổng giá trị
                    existingItem.quantity -= 1;
                    existingItem.totalPrice = existingItem.price * existingItem.quantity;
                    existingItem.discountPrice = (existingItem.price * existingItem.quantity) * (existingItem.discount / 100);
                    // Nếu quantity <= 0, xóa mục khỏi giỏ hàng
                    if (existingItem.quantity <= 0) {
                        delete newCartItems[existingItem.key];
                    }
                }
            }

            return newCartItems;
        });
    };

    const addToCartItem = (key) => {
        setBottomSheetData((prevData) => {
            const currentItem = prevData[key];
            if (currentItem) {
                // Increase quantity
                const updatedQuantity = currentItem.quantity + 1;
                // Calculate new total price
                const updatedTotalPrice = updatedQuantity * currentItem.price;
                const totalPrice = currentItem.price * currentItem.quantity || 0;
                // Tính giá trị sau giảm giá
                const discountedPrice = updatedTotalPrice * (currentItem.discount / 100);
                // Return the updated data with the new quantity and total price for the item
                return {
                    ...prevData,
                    [key]: {
                        ...currentItem,
                        quantity: updatedQuantity,
                        totalPrice: updatedTotalPrice,
                        discountPrice: discountedPrice
                    },
                };
            }

            return prevData; // Trường hợp không tìm thấy mục, trả về trạng thái trước đó
        });
    };


    const removeFromCartItem = (key) => {
        setBottomSheetData((prevData) => {
            const currentItem = prevData[key];
            if (currentItem) {
                // Decrease quantity
                const updatedQuantity = currentItem.quantity - 1;

                if (updatedQuantity <= 0) {
                    setIsBottomSheetVisible(false);
                    // If the quantity is 0 or less, remove the item from data
                    const { [key]: removedItem, ...restData } = prevData;
                    return restData;
                } else {
                    // Otherwise, update the item's quantity and total price
                    const updatedTotalPrice = updatedQuantity * currentItem.price;
                    const discountedPrice = updatedTotalPrice * (currentItem.discount / 100);
                    return {
                        ...prevData,
                        [key]: {
                            ...currentItem,
                            quantity: updatedQuantity,
                            totalPrice: updatedTotalPrice,
                        },
                    };
                }
            }

            return prevData; // In case the item is not found, return previous state
        });

    };

    const updateDiscount = (key, discountValue) => {
        setBottomSheetData((prevBottomSheetData) => {
            // Tạo một bản sao của dữ liệu hiện tại
            const newBottomSheetData = { ...prevBottomSheetData };

            if (newBottomSheetData[key]) {
                // Nếu tìm thấy sản phẩm với key tương ứng
                const price = newBottomSheetData[key].price;
                const quantity = newBottomSheetData[key].quantity; // Lấy giá của món hàng
                newBottomSheetData[key].discount = discountValue; // Cập nhật giảm giá

                // Tính toán và cập nhật discountPrice dựa trên quantity mới
                const discountedPrice = (price * quantity) * (newBottomSheetData[key].discount / 100);
                newBottomSheetData[key].discountPrice = discountedPrice;
            }

            return newBottomSheetData;
        });
    };



    const openModal = (itemData) => {
        setIsBottomSheetVisible(true);
    };

    const closeModal = () => {
        setIsBottomSheetVisible(false);
    };
    const totalItemsInCart = Object.values(cartItems).reduce(
        (total, item) => total + item.quantity,
        0
    );


    const handleSearch = () => {
        // Lấy dữ liệu từ getFilteredData()
        let data = getFilteredData();
        // Áp dụng bộ lọc tìm kiếm nếu có từ khóa tìm kiếm
        if (searchQuery) {
            data = data.filter(([key, data]) => {
                const itemName = data.Name.toLowerCase();
                const searchTerm = searchQuery.toLowerCase();
                return itemName.includes(searchTerm);
            });
            setFilteredOrders(data);
        }
        else {
            setFilteredOrders(getFilteredData())
        }
    };
    useEffect(() => {
        // Chạy lại handleSearch khi searchQuery hoặc selectedCategory thay đổi
        setFilteredOrders(getFilteredData());
        handleSearch();
    }, [searchQuery, selectedCategory]);

    const totalCartDiscountPrice = Object.values(cartItems).reduce(
        (total, item) => total + (item.price * item.quantity - (item.price * item.quantity * item.discount / 100 || 0)),
        0
    );
    //-------------------------------------------------------------End Add Food-------------------------------------------------------------
    const openFoodOrder = () => {
        bottomSheetFood.current.show();
    };
    const openFoodOrderItem = (key, data, url) => {
        if (Array.isArray(data)) {
            const itemData = data.find(([itemKey, itemValue]) => itemKey === key);

            if (itemData) {
                const [, itemValue] = itemData;
                const updatedData = {
                    name: itemValue.Name,
                    price: itemValue.Price,
                    image:itemValue.Image,
                    quantity: 1,
                    discount: 0,
                    totalPrice: itemValue.Price // Khởi tạo totalPrice ban đầu với giá của sản phẩm
                };

                // Thêm dữ liệu vào bottomSheetData
                setBottomSheetData({ [key]: updatedData });

                // Mở BottomSheet
                setIsBottomSheetVisible(true);
            }
        } else {
            console.error("data is not an array");
        }
    };


    const deleteFoodOrder = () => {
        setCartItems('');
    };
    const closeFoodOrder = () => {
        bottomSheetFood.current.hide();
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
            paddingBottom: Object.keys(cartItems).length > 0 ? 60 : 0 || isBottomSheetVisible ? 150 : 0,
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
        imageBottomSheetData: {
            width: 80,
            height: 80,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
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
            paddingBottom: Object.keys(cartItems).length > 0 ? 60 : 0 || isBottomSheetVisible ? 150 : 0,
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
        imageBottomSheetData: {
            width: 80,
            height: 80,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
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
    
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...

    return (

        <View >
            <View style={{ flexDirection: 'row', marginTop: 'auto', marginBottom: 20 }}>
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
                data={filteredOrders}
                renderItem={({ item, index }) => {
                    const [key, data] = item;
                    const name = data.Name;
                    const price = data.price;
                    const img = data.Image;
                    const quantity = cartItems[key] ? cartItems[key].quantity : 0;
                    const imageArray = imageAllFolder || [];
                    const url = imageArray.find((item) => item.name === img)?.url || defaultImageUrl;


                    return (
                        <View style={finalStyles.gridTotal}>
                            <View
                                style={[
                                    finalStyles.gridItem,
                                    index === filteredOrders.length - 1
                                        ? { borderBottomWidth: 0 } // Không có đường viền cho mục cuối cùng
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

                                            <TouchableOpacity key={key} onPress={() => openFoodOrderItem(key, filteredOrders, url)}>
                                                <IconAnt name="pluscircleo" size={24} color="#667080" />
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </View>

                            </View>

                        </View>

                    );
                }}
                numColumns={1}
                keyExtractor={(item) => item[0]}
                contentContainerStyle={[
                    finalStyles.listContainer,
                    filteredOrders.length >= 5 ? { height: 'auto' } : { height: Dimensions.get('window').height - 20 },
                ]}
            />
            {isBottomSheetVisible && (
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    width: '100%',
                    height: 150,
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
                    <View style={finalStyles.gridTotal}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start' }} onPress={() => { setIsBottomSheetVisible(false) }}>
                                <Text style={{ color: "#667080", paddingLeft: 10 }}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onPress={() => { addToCart() }}>
                                <Text style={{ color: "#667080", paddingRight: 10 }}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[finalStyles.gridItem, { borderBottomWidth: 0, paddingTop: 10 }]}>

                            <View style={{ width: '20%' }}>
                                <Image
                                    source={{
                                        uri: (imageAllFolder.find(
                                            (item) =>
                                                item.name === `${Object.keys(bottomSheetData)[0]}.jpg`
                                        ) || {}).url,
                                    }}
                                    style={finalStyles.imageBottomSheetData}
                                />
                            </View>
                            <View style={finalStyles.itemDetails}>
                                <Text style={finalStyles.itemName}>
                                    {Object.values(bottomSheetData)[0]?.name}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text>Giảm giá:</Text>
                                    {Object.values(bottomSheetData)[0]?.discount !== 0 ? (
                                        <Text>{Object.values(bottomSheetData)[0]?.discount}%</Text>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TextInput
                                                value={discount[Object.keys(bottomSheetData)[0]] || ''}
                                                inputMode="decimal"
                                                onChangeText={(text) => {
                                                    setDiscount((prevDiscount) => ({
                                                        ...prevDiscount,
                                                        [Object.keys(bottomSheetData)[0]]: text,
                                                    }));
                                                }}
                                                onEndEditing={() => {
                                                    updateDiscount(
                                                        Object.keys(bottomSheetData)[0],
                                                        discount[Object.keys(bottomSheetData)[0]]
                                                    );
                                                    setDiscount((prevDiscount) => ({
                                                        ...prevDiscount,
                                                        [Object.keys(bottomSheetData)[0]]: '',
                                                    }));
                                                }}
                                            />
                                            <Text>%</Text>
                                        </View>
                                    )}
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <View>
                                        {Object.values(bottomSheetData)[0]?.discount !== 0 ? ( // Check if there is a discount for the item
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start', textDecorationLine: 'line-through' }]}>{`${Object.values(bottomSheetData)[0]?.totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                <Text style={[finalStyles.itemPrice, { marginLeft: 5 }]}>{`${(Object.values(bottomSheetData)[0]?.totalPrice - Object.values(bottomSheetData)[0]?.discountPrice).toLocaleString('vi-VN')}đ`}</Text>
                                            </View>
                                        ) : (
                                            <Text style={finalStyles.itemPrice}>{`${Object.values(bottomSheetData)[0]?.totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            paddingRight: 20,
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() =>
                                                removeFromCartItem(Object.keys(bottomSheetData)[0])
                                            }
                                        >
                                            <IconAnt name="minuscircleo" size={24} color="#667080" />
                                        </TouchableOpacity>
                                        <Text style={{ marginLeft: 8, marginRight: 8 }}>
                                            {Object.values(bottomSheetData)[0]?.quantity}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => addToCartItem(Object.keys(bottomSheetData)[0])}
                                        >
                                            <IconAnt name="pluscircleo" size={24} color="#667080" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}
            {Object.keys(cartItems).length > 0 && !isBottomSheetVisible && !isKeyboardVisible ? (
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
                        <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop: 10, justifyContent: 'space-between', alignItems: 'center' }}>
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
                                    const img = data.image;
                                    const totalPrice = price * quantity;
                                    const discount = data.discount;
                                    const discountPrice = totalPrice * discount / 100;
                                    const imageArray = imageAllFolder || [];

                                    // Find the URL for the specific key or provide a default URL if not found
                                    const url = imageArray.find((item) => item.name === img)?.url || defaultImageUrl;
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
                                                        <Text>{discount}%</Text>

                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <View>
                                                            {discount !== 0 ? ( // Check if there is a discount for the item
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start', textDecorationLine: 'line-through' }]}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                                    <Text style={[finalStyles.itemPrice, { marginLeft: 5 }]}>{`${(totalPrice - discountPrice).toLocaleString('vi-VN')}đ`}</Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={finalStyles.itemPrice}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                            )}
                                                        </View>

                                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 20 }}>
                                                            {quantity > 0 ? ( // Nếu số lượng > 0, hiển thị nút giảm và số lượng
                                                                <>
                                                                    <TouchableOpacity onPress={() => removeFromCart(key)}>
                                                                        <IconAnt name="minuscircleo" size={24} color="#667080" />
                                                                    </TouchableOpacity>
                                                                    <Text style={{ marginLeft: 8, marginRight: 8 }}>{quantity}</Text>
                                                                    <TouchableOpacity onPress={() => addToCartSheet(key, discount)}>
                                                                        <IconAnt name="pluscircleo" size={24} color="#667080" />
                                                                    </TouchableOpacity>
                                                                </>
                                                            ) : ( // Ngược lại, chỉ hiển thị nút tăng
                                                                <TouchableOpacity onPress={() => addToCartSheet(key, discount)}>
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
                                contentContainerStyle={[finalStyles.listContainer, Object.entries(cartItems).length >= 5 ? { paddingBottom: 90 } : { paddingBottom: 0 }]}
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
                                <Text style={{ marginRight: 10, paddingTop: 10 }}>{totalCartDiscountPrice.toLocaleString('vi-VN')}đ</Text>
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
                                    onPress={() => {
                                        // Kiểm tra xem người dùng đến từ màn hình nào
                                        const origin = route.params.origin;
                                        if (origin === 'CreateOrder') {
                                            navigation.navigate('CreateOrder', { Foods: cartItems });
                                        } else if (origin === 'OrderDetails') {
                                            navigation.navigate('OrderDetails', { Foods: cartItems, Orders: Orders, OrderID: OrderID });
                                        }
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
                        <Text style={{ marginRight: 10, paddingTop: 10 }}>{totalCartDiscountPrice.toLocaleString('vi-VN')}đ</Text>
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
                            onPress={() => {
                                // Kiểm tra xem người dùng đến từ màn hình nào
                                const origin = route.params.origin;
                                if (origin === 'CreateOrder') {
                                    navigation.navigate('CreateOrder', { Foods: cartItems });
                                } else if (origin === 'OrderDetails') {
                                    navigation.navigate('OrderDetails', { Foods: cartItems, Orders: Orders, OrderID: OrderID });
                                }
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

