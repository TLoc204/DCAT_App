import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

export default function Setting() {
  const database = getDatabase(FIREBASE_APP);
  const [loggedInUser, setLoggedInUser] = useState({ username: '', role: '' });
  const [dataRole, setDataRole] = useState({});
  const navigation = useNavigation();
  useEffect(() => {
    const roleRef = ref(database, 'Roles');
    const unsubscribeRole = onValue(roleRef, (snapshot) => {
      const roleData = snapshot.val();
      if (roleData) {
        setDataRole(roleData);
      }
    });
    return () => {
      unsubscribeRole();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem('name');
        const storedRole = await AsyncStorage.getItem('role');
        const role = storedRole && dataRole[storedRole] ? dataRole[storedRole].Name : 'Unknown';
        setLoggedInUser({ username, role });
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };
    fetchUserData();
  }, [dataRole]);

  const handleLogout = async () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Thông tin tài khoản */}
      <View style={[styles.userInfoContainer, { backgroundColor: '#ffffff' }]}>
        {/* Icon */}
        <MaterialIcons name="account-circle" size={60} color="#333" />

        {/* Thông tin tài khoản */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{loggedInUser.username}</Text>
          <Text style={styles.role}>{loggedInUser.role}</Text>
        </View>
      </View>

      {/* Container cho các nút */}
      <View style={styles.buttonContainer}>
        {/* Nút Admin */}
        {loggedInUser.role === 'Admin' && (
          <TouchableOpacity style={[styles.button, styles.adminButton]} onPress={()=>navigation.navigate('Admin')} >
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
        )}

        {/* Nút đăng xuất */}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  userInfoContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  userInfo: {
    marginLeft: 20,
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    width: '100%',
    padding: 10,
    marginTop:10,
    backgroundColor: '#667080',
    borderRadius: 5,
  },
  adminButton: {
    backgroundColor: '#667080',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});
