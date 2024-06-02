import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Platform, Image, Keyboard } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { getDatabase, ref, onValue, get, set, update, remove } from 'firebase/database';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { useImageAllFolder } from "../Order/FoodOrder";
import { createResizedImage } from 'react-native-image-resizer';
import { showMessage, hideMessage } from "react-native-flash-message";
import IconAnt from 'react-native-vector-icons/AntDesign';
import { NavigationContainer, useIsFocused, useNavigation } from '@react-navigation/native';
import {
    getStorage,
    ref as storageRef,
    listAll,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject
} from "firebase/storage";

export default function AdminCreateAndUpdateFood({ route }) {
    const navigation = useNavigation();
    const database = getDatabase(FIREBASE_APP);
    const storage = getStorage(FIREBASE_APP);
    const { imageAllFolder, setShouldFetch } = useImageAllFolder();
    const [categoryDropdownData, setCategoryDropdownData] = useState([]);
    const [dataCategory, setDataCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [photoUpdate, setPhotoUpdate] = useState();
    const [photo, setPhoto] = useState();
    const [imageName, setImageName] = useState();
    const [key, setKey] = useState();
    const [resizedUri, setResizedUri] = useState(null);
    const [name, setName] = useState();
    const [price, setPrice] = useState();
    const [note, setNote] = useState();
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [displayPhoto, setDisplayPhoto] = useState(true);
    useEffect(() => {
        if (photo) {
            setDisplayPhoto(true); // Đặt biến displayPhoto thành false nếu có dữ liệu từ photoUpdate
        } else {
            setDisplayPhoto(false);
        }
    }, [photoUpdate, displayPhoto]);
    useEffect(() => {
        const categoryRef = ref(database, 'Categories');
        const unsubscribeCategories = onValue(categoryRef, (snapshot) => {
            const categoryData = snapshot.val();
            if (categoryData) {
                setDataCategory(categoryData);
            }
        });
        return () => {
            unsubscribeCategories();
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
    useEffect(() => {
        const categoryOptions = Object.keys(dataCategory).map((key) => {
            return { label: dataCategory[key].Name, value: key };
        });
        setCategoryDropdownData(categoryOptions);
    }, [dataCategory]);
    const handleCategoryChange = (selectedValue) => {
        setSelectedCategory(selectedValue);
    };

    const handleChoosePhoto = async () => {
        try {
            const options = {
                mediaType: ImagePicker.MediaTypeOptions.All,
                quality: 1,
            };
            const image = await ImagePicker.launchImageLibraryAsync(options);
            if (!image.canceled) {
                setPhoto(image);
            }
            else {
                setPhoto();
            }
            setDisplayPhoto(true);
        } catch (error) {
            console.error('Error choosing photo:', error);
        }
    };
    const getLastKeyFromDatabase = async (ref) => {
        let lastKey = '';
        const snapshot = await get(ref);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const keys = Object.keys(data);
            lastKey = keys.length.toString();
        } else {
            console.log("No data available");
        }
        return lastKey;
    };
    useEffect(() => {
        if (route.params?.adminRole === "Cập nhật") {
            setSelectedCategory(route.params?.category)
            setName(route.params?.name)
            setPrice(String(route.params?.price))
            setNote(route.params?.note)
            setPhotoUpdate(route.params?.image)
            setImageName(route.params?.imageName)
            setKey(route.params?.key)
        }
    }, [])
    const CustomMessageComponent = ({ message, description, icon }) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: -30, marginTop: 10 }}>
                    <IconAnt name={icon} size={24} color={'#ffffff'} />
                    <Text style={{ marginLeft: 10, color: '#ffffff' }}>{message}</Text>
                </View>
                <Text style={{ marginLeft: 5, color: '#ffffff' }}>{description}</Text>
            </View>
        );
    };
    const handleSubmit = async () => {
        try {
            if (route.params?.adminRole === "Thêm mới") {
                let uriParts = '';
                let nameImage = '';
                let response = '';
                let blob = ''
                if (photo) {
                    uriParts = photo.assets[0]?.uri.split('/');
                    nameImage = uriParts[uriParts.length - 1];
                    response = await fetch(photo.assets[0]?.uri);
                }

                if (response) { // Kiểm tra xem response có tồn tại không trước khi gọi response.blob()
                    blob = await response.blob();
                    // Tiếp tục xử lý với blob ở đây
                }
                // Chọn thư mục dựa vào selectedCategory
                let folderName = '';
                let keys = '';
                let idCate = '';
                switch (selectedCategory.value) {
                    case 'C1':
                        const drinkRef = ref(database, "Drinks");
                        const lastDrinkKey = await getLastKeyFromDatabase(drinkRef);
                        keys = 'D' + (parseInt(lastDrinkKey) + 1);
                        folderName = 'Drinks';
                        idCate = 'C1'
                        break;
                    case 'C2':
                        const drink2ndRef = ref(database, "Drink2ND");
                        const lastDrink2NDKey = await getLastKeyFromDatabase(drink2ndRef);
                        keys = 'DD' + (parseInt(lastDrink2NDKey) + 1);
                        folderName = 'Drink2ND';
                        idCate = 'C2'
                        break;
                    case 'C3':
                        const foodRef = ref(database, "Foods");
                        const lastFoodKey = await getLastKeyFromDatabase(foodRef);
                        keys = 'F' + (parseInt(lastFoodKey) + 1);
                        folderName = 'Foods';
                        idCate = 'C3'
                        break;
                    case 'C4':
                        const toppingRef = ref(database, "Topping");
                        const lastToppingKey = await getLastKeyFromDatabase(toppingRef);
                        keys = 'Tp' + (parseInt(lastToppingKey) + 1);
                        folderName = 'Topping';
                        idCate = 'C4'
                        break;
                    case 'C5':
                        const foodBonusRef = ref(database, "FoodBonus");
                        const lastFoodBonusKey = await getLastKeyFromDatabase(foodBonusRef);
                        keys = 'Fb' + (parseInt(lastFoodBonusKey) + 1);
                        folderName = 'FoodBonus';
                        idCate = 'C5'
                        break;
                    case 'C6':
                        const gamesRef = ref(database, "Games");
                        const lastGamesKey = await getLastKeyFromDatabase(gamesRef);
                        keys = 'G' + (parseInt(lastGamesKey) + 1);
                        folderName = 'Games';
                        idCate = 'C6'
                        break;

                    default:
                        return;
                }
                const storageReference = storageRef(storage, `${folderName}/${nameImage}`);
                const uploadTask = uploadBytesResumable(storageReference, blob);
                const snapshot = uploadTask;
                const now = new Date();
                const date = now.toISOString().split('T')[0]; // Ngày
                const time = now.toTimeString().split(' ')[0]; // Thời gian
                const newCategoriesData = {
                    "CreatedDate": `${date} ${time}`,
                    "UpdatedDate": `${date} ${time}`,
                    "IdCategory": idCate,
                    "Name": name,
                    "Note": note ? note : '',
                    "Price": parseInt(price),
                    "Image": photo ? nameImage : ''
                };

                await set(ref(database, `${folderName}/${keys}`), newCategoriesData)
                    .then(() => {

                    })
                    .catch((error) => {
                        console.error('Failed to save order: ', error);
                    });
                showMessage({
                    message: "Tạo món thành công",
                    type: "success",
                    icon: { icon: "success", position: "left" }, // Use the built-in icon
                    // Here you can pass your custom component
                    renderCustomContent: () => (
                        <CustomMessageComponent
                            message="Tạo món thành công"
                            description={`Món ${name} được thêm thành công`}
                            icon="checkcircle"
                        />
                    ),
                });
                setTimeout(() => {
                    hideMessage();
                }, 2000);
                setName('');
                setPhoto('');
                setNote('');
                setPrice('');
                setSelectedCategory('');
                setShouldFetch(true);
                navigation.navigate('Admin');
            }
            else {
                if (photo) {
                    const itemTypePrefix = key.match(/[A-Za-z]+/)[0];
                    let uriParts = photo.assets[0]?.uri.split('/'); // Sử dụng let thay vì const
                    let nameImage = uriParts[uriParts.length - 1];
                    let response = '';
                    let blob = '';
                    
                    if (photo) {
                        uriParts = photo.assets[0]?.uri.split('/'); // Gán lại giá trị cho uriParts
                        nameImage = uriParts[uriParts.length - 1];
                        response = (await fetch(photo.assets[0]?.uri)).hasOwnProperty();
                    }
                    
                    if (response) {
                        blob = await response.blob();
                        // Tiếp tục xử lý với blob ở đây
                    }
                    const storageReference = storageRef(storage, `${itemType}/${nameImage}`);
                    const uploadTask = uploadBytesResumable(storageReference, blob);
                    const snapshot = uploadTask;
                    let itemType = '';
                    

                    switch (itemTypePrefix) {
                        case 'D':
                            itemType = 'Drinks';
                            break;
                        case 'F':
                            itemType = 'Foods';
                            break;
                        case 'DD':
                            itemType = 'Drink2ND';
                            break;
                        case 'Tp':
                            itemType = 'Topping';
                            break;
                        case 'Fb':
                            itemType = 'FoodBonus';
                            break;
                        case 'G':
                            itemType = 'Games';
                            break;
                        default:
                            return;
                    }
                    const Ref = ref(database, `${itemType}/${key}`);
                    const now = new Date();
                    const date = now.toISOString().split('T')[0]; // Ngày
                    const time = now.toTimeString().split(' ')[0]; // Thời gian
                    try {
                        await update(Ref, {
                            "Price": parseInt(price),
                            "Name": name,
                            "Note": note,
                            "Image": nameImage,
                            "UpdatedDate": `${date} ${time}`,
                        });
                    } catch (error) {
                        console.error("Lỗi khi cập nhật:", error);
                    }
                    showMessage({
                        message: "Cập nhật món thành công",
                        type: "success",
                        icon: { icon: "success", position: "left" }, // Use the built-in icon
                        // Here you can pass your custom component
                        renderCustomContent: () => (
                            <CustomMessageComponent
                                message="Cập nhật món thành công"
                                description={`Món ${name} đã được cập nhật thành công`}
                                icon="checkcircle"
                            />
                        ),
                    });
                    setTimeout(() => {
                        hideMessage();
                    }, 2000);
                    setName('');
                    setPhoto('');
                    setNote('');
                    setPrice('');
                    setSelectedCategory('');
                    setShouldFetch(true);
                    navigation.navigate('Admin');

                } else {
                    const itemTypePrefix = key.match(/[A-Za-z]+/)[0];
                    let itemType = '';

                    switch (itemTypePrefix) {
                        case 'D':
                            itemType = 'Drinks';
                            break;
                        case 'F':
                            itemType = 'Foods';
                            break;
                        case 'DD':
                            itemType = 'Drink2ND';
                            break;
                        case 'Tp':
                            itemType = 'Topping';
                            break;
                        case 'Fb':
                            itemType = 'FoodBonus';
                            break;
                        case 'G':
                            itemType = 'Games';
                            break;
                        default:
                            return;
                    }
                    const Ref = ref(database, `${itemType}/${key}`);
                    const now = new Date();
                    const date = now.toISOString().split('T')[0]; // Ngày
                    const time = now.toTimeString().split(' ')[0]; // Thời gian
                    try {
                        await update(Ref, {
                            "Price": parseInt(price),
                            "Name": name,
                            "Note": note,
                            "UpdatedDate": `${date} ${time}`,
                        });
                    } catch (error) {
                        console.error("Lỗi khi cập nhật:", error);
                    }
                    showMessage({
                        message: "Cập nhật món thành công",
                        type: "success",
                        icon: { icon: "success", position: "left" }, // Use the built-in icon
                        // Here you can pass your custom component
                        renderCustomContent: () => (
                            <CustomMessageComponent
                                message="Cập nhật món thành công"
                                description={`Món ${name} được cập nhật thành công`}
                                icon="checkcircle"
                            />
                        ),
                    });
                    setTimeout(() => {
                        hideMessage();
                    }, 2000);
                    setName('');
                    setPhoto('');
                    setNote('');
                    setPrice('');
                    setSelectedCategory('');
                    navigation.navigate('Admin');
                }
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };
    const deleteItemFromFirebase = (itemId, ImageName) => {
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
        // Xóa ảnh từ Firebase Storage
        deleteObject(imageRef)
            .then(() => {

                // Nếu muốn cập nhật lại danh sách hiển thị, bạn có thể thêm code ở đây
            })
            .catch((error) => {
                console.error("Error removing image from Firebase Storage: ", error);
            });
    };
    const commonStyles = {
        container_order: {
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#FFFFFF",
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
        input: {
            fontSize: 16
        },
        placeholderStyle: {
            fontSize: 16,
        },
    };

    const mobileStyles = StyleSheet.create({
        container_order: {
            flex: 1,
            paddingTop: 20,
        },
        uploadText: {
            color: "blue",
        },
        uploadTextUpdate: {
            color: "blue",
            marginTop: 10
        },
        image: {
            flex: 1,
            height: '100%',
            width: '100%',
            objectFit: 'contain',
        }
    });

    const webStyles = StyleSheet.create({
        // Add web specific styles here if needed
    });

    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : { ...commonStyles, ...mobileStyles };
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <ScrollView>
                <View style={{ marginBottom: '20%' }}>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Danh mục</Text>
                    <View style={finalStyles.input_cus}>
                        <Dropdown
                            style={finalStyles.dropdown}
                            placeholderStyle={finalStyles.placeholderStyle}
                            data={categoryDropdownData}
                            placeholder="Chọn danh mục"
                            value={selectedCategory}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            onChange={handleCategoryChange}
                        />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Tên món</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} value={name} onChangeText={(text) => { setName(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Ảnh món</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, overflow: 'hidden' }}>
                        {!photo && !photoUpdate ? (
                            <TouchableOpacity onPress={handleChoosePhoto}>
                                <Text style={finalStyles.uploadText}>Tải ảnh lên</Text>
                            </TouchableOpacity>
                        ) : (
                            displayPhoto ? (
                                <View style={{ width: '90%', height: 200, alignItems: 'center' }}>
                                    <Image source={{ uri: photo.assets[0].uri }} style={finalStyles.image} resizeMode="cover" />
                                    <TouchableOpacity onPress={handleChoosePhoto}>
                                        <Text style={finalStyles.uploadTextUpdate}>Thay đổi</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ width: '90%', height: 200, alignItems: 'center' }}>
                                    <Image source={{ uri: photoUpdate }} style={finalStyles.image} resizeMode="cover" />
                                    <TouchableOpacity onPress={handleChoosePhoto}>
                                        <Text style={finalStyles.uploadTextUpdate}>Thay đổi</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                    </View>

                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Giá</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} inputMode="numeric" value={price} onChangeText={(text) => { setPrice(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Ghi chú</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} value={note} onChangeText={(text) => { setNote(text) }} />
                    </View>
                    <View>
                        <TouchableOpacity style={{
                            alignItems: "center",
                            backgroundColor: "#667080",
                            borderRadius: 15,
                            paddingVertical: 15,
                            marginHorizontal: 5,
                            marginLeft: 20,
                            marginRight: 20,
                            marginTop: 15
                        }} onPress={handleSubmit}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                <Text style={{ color: '#ffffff' }}>{route.params?.adminRole === "Thêm mới" ? "Thêm" : "Cập nhật"}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
