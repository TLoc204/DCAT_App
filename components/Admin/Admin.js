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

export default function Admin() {
    
}
