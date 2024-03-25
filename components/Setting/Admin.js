import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Platform, Image } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { createResizedImage } from 'react-native-image-resizer';
export default function CreateOrder() {
    const database = getDatabase(FIREBASE_APP);
    const [categoryDropdownData, setCategoryDropdownData] = useState([]);
    const [dataCategory, setDataCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [resizedUri, setResizedUri] = useState(null);
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
            if (!image.cancelled) {
                const uriParts = image.assets[0].uri.split('/');
                const name = uriParts[uriParts.length - 1];
                const newName = 'D3.jpg';
                const newPath = image.assets[0].uri.replace(name, newName);
                const updatedAssets = photo ? photo.assets.map(asset => {
                    return { ...asset, uri: newPath };
                }) : [];
                const updatedImage = { ...image, assets: updatedAssets };
                console.log(updatedImage);
                setPhoto(updatedImage);
            }
        } catch (error) {
            console.error('Error choosing photo:', error);
        }
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
        uploadTextUpdate:{
            color: "blue",
            marginTop:10
        },
        image: {
            flex: 1,
            height: '100%',
            width: '100%',
            objectFit: 'contain',
        }
        // Add other mobile styles here if needed
    });

    const webStyles = StyleSheet.create({
        // Add web specific styles here if needed
    });
    console.log(photo?.assets[0].uri)
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
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            onChange={handleCategoryChange}
                        />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Tên món</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Ảnh món</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, overflow: 'hidden' }}>
                        {photo
                            ? (
                                <View style={{ width: '90%', height: 200,alignItems:'center' }}>
                                    <Image source={{ uri: photo ? photo?.assets[0].uri : '' }} style={finalStyles.image} resizeMode="cover" />
                                    <TouchableOpacity onPress={handleChoosePhoto}>
                                    <Text style={finalStyles.uploadTextUpdate}>Thay đổi</Text>
                                </TouchableOpacity>
                                </View>
                            )
                            : (
                                <TouchableOpacity onPress={handleChoosePhoto}>
                                    <Text style={finalStyles.uploadText}>Tải lên ảnh</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Giá</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Ghi chú</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
