import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Platform, Image, FlatList, Dimensions,Alert  } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { getDatabase, ref, onValue, get, set,remove } from 'firebase/database';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { useImageAllFolder } from "../Order/FoodOrder";
import { SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { createResizedImage } from 'react-native-image-resizer';
import {
    getStorage,
    ref as storageRef,
    listAll,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject 
} from "firebase/storage";
export default function Admin() {
    const database = getDatabase(FIREBASE_APP);
    const storage = getStorage(FIREBASE_APP);
    const navigation = useNavigation();
    const { imageAllFolder } = useImageAllFolder();
    const [dataFoods, setDataFoods] = useState([]);
    const [dataCategories, setDataCategories] = useState([]);
    const [dataFoodBonus, setDataFoodBonus] = useState([]);
    const [dataDrinks, setDataDrinks] = useState([]);
    const [dataDrink2ND, setDataDrink2ND] = useState([]);
    const [dataToppings, setDataToppings] = useState([]);
    const [dataGames, setDataGames] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    // const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [defaultImageUrl, setDefaultImageUrl] = useState('https://firebasestorage.googleapis.com/v0/b/dcat-c09a4.appspot.com/o/MacDinh.jpg?alt=media&token=d66af2a0-9be6-44cb-9eda-504f04c1763c');
    useEffect(() => {
        const foodRef = ref(database, 'Foods');
        const categoryRef = ref(database, 'Categories');
        const drinkRef = ref(database, 'Drinks');
        const drink2ndRef = ref(database, 'Drink2ND');
        const foodbonusRef = ref(database, 'FoodBonus');
        const gameRef = ref(database, 'Games');
        const toppingRef = ref(database, 'Topping');

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
            unsubscribeFoods();
            unsubscribeCategories();
            unsubscribeDrinks();
            unsubscribeDrink2ND();
            unsubscribeFoodBonus();
            unsubscribeGames();
            unsubscribeToppings();
        };

    }, []);
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
    const deleteItemFromFirebase = (itemId,ImageName) => {
        let dataRef;
        let dataStorage;
        const onlyLetters = itemId.replace(/[^a-zA-Z]/g, '');
        switch (onlyLetters) {
            case 'D':
                dataRef = ref(database, `/Drinks/${itemId}`);
                dataStorage = "Drinks";
                break;
            case 'F':
                dataRef = ref(database, `/Foods/${itemId}`);
                dataStorage = "Foods";
                break;
            case 'T':
                dataRef = ref(database, `/Toppings/${itemId}`);
                dataStorage = "Toppings";
                break;
            case 'G':
                dataRef = ref(database, `/Games/${itemId}`);
                dataStorage = "Games";
                break;
            case 'DD':
                dataRef = ref(database, `/Drink2ND/${itemId}`);
                dataStorage = "Drink2ND";
                break;
            case 'F':
                dataRef = ref(database, `/FoodBonus/${itemId}`);
                dataStorage = "FoodBonus";
                break;
            default:
                console.error("Invalid item category.");
                return;
        }
        const imageRef = storageRef(storage, `${dataStorage}/${ImageName}`);
        // Xóa item từ Firebase
        remove(dataRef)
        .then(() => {
            console.log("Item removed successfully from Firebase");

            // Xóa ảnh từ Firebase Storage
            deleteObject(imageRef)
                .then(() => {
                    console.log("Image removed successfully from Firebase Storage");
                    // Nếu muốn cập nhật lại danh sách hiển thị, bạn có thể thêm code ở đây
                })
                .catch((error) => {
                    console.error("Error removing image from Firebase Storage: ", error);
                });
        })
        .catch((error) => {
            console.error("Error removing item from Firebase: ", error);
        });
    };
    const deleteItemFromFirebaseWithConfirmation = (itemId, itemName, imageName) => {
        // Hiển thị cửa sổ xác nhận
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có muốn xóa ${itemName} không?`,
            [
                {
                    text: "Hủy",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: () => deleteItemFromFirebase(itemId, imageName),
                }
            ],
            { cancelable: false }
        );
    };
    // const deleteItem = (itemId) => {
    //     // Xóa item từ Firebase
    //     deleteItemFromFirebase(itemId);
    
    //     // Tạo một bản sao của danh sách filteredOrders
    //     const updatedOrders = [...filteredOrders];
    
    //     // Tìm vị trí của item cần xóa trong danh sách
    //     const index = updatedOrders.findIndex(item => item[0] === itemId);
    
    //     // Nếu tìm thấy vị trí của item, thực hiện xóa
    //     if (index !== -1) {
    //         updatedOrders.splice(index, 1); // Xóa item khỏi danh sách
    //         setFilteredOrders(updatedOrders); // Cập nhật lại danh sách filteredOrders
    //     }
    // };
    const handleSelectCategory = (key) => {
        setSelectedCategory(key);
    };
    useEffect(() => {
        setFilteredOrders(getFilteredData());
    }, [selectedCategory, dataDrinks, dataDrink2ND, dataFoods, dataToppings, dataFoodBonus, dataGames]);
    useEffect(() => {
        // Chạy lại handleSearch khi searchQuery hoặc selectedCategory thay đổi
        setFilteredOrders(getFilteredData());
        handleSearch();
    }, [searchQuery, selectedCategory]);
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
            backgroundColor: "#ffffff",
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
        main_admin:{
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
        // Add web specific styles here if needed
    });

    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : { ...commonStyles, ...mobileStyles };
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <View style={finalStyles.main_admin}>
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
                        const price = data.Price;
                        const img = data.Image;
                        const category = data.IdCategory;
                        const note = data.Note;
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

                                                <TouchableOpacity onPress={()=> navigation.navigate('AdminCreateAndUpdateFood',{adminRole:"Cập nhật",key:key,name:name,price:price,image:img,note:note,category:category})}>
                                                    <IconAnt name="edit" size={24} color="#667080" />
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity onPress={() => deleteItemFromFirebaseWithConfirmation(key, name, img)} style={{paddingLeft:20}}>
                                                    <IconAnt name="delete" size={24} color="#667080" />
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
            </View>
        </SafeAreaView>
    );
}
