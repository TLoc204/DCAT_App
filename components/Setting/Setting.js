import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Button, TextInput } from 'react-native-paper';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, push, get, set, query, orderByChild, equalTo } from 'firebase/database';
import SearchableDropdown from 'react-native-searchable-dropdown';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');
import { getStorage, ref as storageRef, listAll, getDownloadURL } from "firebase/storage";

export default function Setting() {
  // const storage = getStorage(); // Khởi tạo đối tượng storage

  // const listAllItemsInFolder = async (folderPath) => {
  //   const folderRef = storageRef(storage, folderPath);
  //   try {
  //     const items = await listAll(folderRef);
  //     const itemDetails = [];

  //     for (const item of items.items) {
  //       const itemUrl = await getDownloadURL(item);
  //       itemDetails.push({ name: item.name, url: itemUrl });
  //     }

  //     return itemDetails;
  //   } catch (error) {
  //     console.error("Error listing items in folder:", error);
  //     return [];
  //   }
  // };

  // const fetchAllItems = async () => {
  //   try {
  //     const folders = ["Topping", "Foods", "FoodBonus", "Drinks", "Drink2ND", "Games"];
  //     const allItems = {};

  //     for (const folder of folders) {
  //       const items = await listAllItemsInFolder(folder);
  //       allItems[folder] = items;
  //     }

  //     console.log("All items:", allItems);
  //     // Bạn có thể xử lý tất cả các item ở đây, hoặc lưu chúng vào đối tượng để sử dụng sau này.
  //   } catch (error) {
  //     console.error("Error fetching all items:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllItems();
  // }, []);

}
