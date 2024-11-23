import React, { useEffect, useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, SafeAreaView, ScrollView, TextInput, FlatList, Keyboard, Animated } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, get, set } from 'firebase/database';
import { showMessage, hideMessage, } from "react-native-flash-message";
import IconAnt from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { DataTable } from 'react-native-paper';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ExcelJS from 'exceljs';
// Lấy kích thước màn hình để hỗ trợ responsive

export default function CreateOrder({ route }) {
    const database = getDatabase(FIREBASE_APP);
    const [paymentData, setPaymentData] = useState([])
    const [paymentName, setPaymentName] = useState('')
    const [paymentPrice, setPaymentPrice] = useState('')
    const [paymentDescription, setPaymentDescription] = useState('')
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
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
        const paymentRef = ref(database, 'Payment');
        // Tạo một biến để giữ các hàm hủy đăng ký
        const unsubscribePayments = onValue(paymentRef, (snapshot) => {
            const payData = snapshot.val();
            if (payData) {
                setPaymentData(payData);
            }
        });
        // Khi component bị unmount, gọi các hàm hủy đăng ký
        return () => {
            unsubscribePayments();
        };
    }, []);

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
            paddingTop: "15%",
        },

        input_cus_payment: {
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

    });

    const webStyles = StyleSheet.create({

    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    const createExcel = async (paymentData) => {
        const paymentArray = Object.values(paymentData);
      
        // Kiểm tra xem paymentArray có phải là mảng không
        if (!Array.isArray(paymentArray)) {
          console.error("paymentArray is not an array:", paymentArray);
          return; // Dừng hàm nếu paymentArray không phải là mảng
        }
      
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PaymentData');
      
        // Thêm tiêu đề cột
        worksheet.columns = [
          { header: 'STT', key: 'stt', width: 10 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Created Date', key: 'createdDate', width: 20 },
          { header: 'Update Date', key: 'updateDate', width: 20 },
          { header: 'Price', key: 'price', width: 15, style: { numFmt: '#,##0' } }, // Định dạng tiền tệ cho cột Price
          { header: 'Description', key: 'description', width: 30 }
        ];
      
        // Tạo mảng dữ liệu từ paymentArray
        const rows = paymentArray.map((item, index) => ({
          stt: item.key ? item.key.substring(1) : index + 1, // STT là phần sau chữ P
          name: item.Name,
          createdDate: item.CreatedDate,
          updateDate: item.UpdateDate,
          description: item.Description || '',
          price: parseFloat(item.Price) || 0 // Đảm bảo giá là số
        }));
      
        // Thêm dữ liệu vào worksheet
        worksheet.addRows(rows);
      
        // Thêm dòng tổng cộng
        const totalRow = worksheet.addRow({});
        totalRow.getCell('E').value = 'Tổng cộng:';
        totalRow.getCell('F').value = {
          formula: `SUM(E2:E${rows.length + 1})`,
        };
      
        // Ghi file ra buffer
        const buffer = await workbook.xlsx.writeBuffer();
      
        // Lưu file vào hệ thống và chia sẻ
        const fileUri = FileSystem.documentDirectory + 'payment_data.xlsx';
        
        // Chuyển đổi buffer thành Base64
        const base64String = buffer.toString('base64');
        
        // Ghi vào file
        await FileSystem.writeAsStringAsync(fileUri, base64String, { encoding: FileSystem.EncodingType.Base64 });
      
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }
      };
      
      
      
      

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
        if (paymentName.length === 0) {
            showMessage({
                message: "Tạo phiếu chi thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" },

                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng nhập tên món hàng."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }
        if (paymentPrice.length === 0) {
            showMessage({
                message: "Tạo phiếu chi thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo phiếu chi thất bại"
                        description="Vui lòng nhập giá món hàng."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }
        if (paymentName || paymentPrice) {
            const paymentRef = ref(database, 'Payment');
            let lastPaymentKey = '';

            await get(paymentRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const paymentKeys = Object.keys(data);
                        const numericOrderKeys = paymentKeys
                            .map(key => parseInt(key.replace('P', '')))
                            .filter(num => !isNaN(num));
                        lastPaymentKey = Math.max(...numericOrderKeys);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            if (isNaN(parseInt(lastPaymentKey))) {
                lastPaymentKey = 0
            }
            const newPaymentKey = 'P' + (parseInt(lastPaymentKey) + 1);
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Ngày
            const time = now.toTimeString().split(' ')[0]; // Thời gian
            const newPaymentData = {
                "CreatedDate": `${date} ${time}`,
                "UpdateDate": `${date} ${time}`,
                "Name": paymentName,
                "Price": paymentPrice,
                "Description": paymentDescription
            };
            await set(ref(database, 'Payment/' + newPaymentKey), newPaymentData)
                .then(() => {
                    showMessage({
                        message: "Tạo đơn thành công",
                        type: "success",
                        icon: { icon: "success", position: "left" }, // Use the built-in icon
                        // Here you can pass your custom component
                        renderCustomContent: () => (
                            <CustomMessageComponent
                                message="Tạo phiếu chi thành công"
                                description="Phiếu chi của bạn đã được tạo thành công."
                                icon="checkcircle"
                            />
                        ),
                    });
                    setTimeout(() => {
                        hideMessage();
                    }, 2000); // 2000 miliseconds = 2 giây
                    setPaymentName('');
                    setPaymentPrice('');
                    setPaymentDescription('');
                })
                .catch((error) => {
                    console.error('Failed to save order: ', error);
                });
        }
    }
    const paymentArray = Object.entries(paymentData).map(([key, value]) => ({ ...value, key }));
    function formatCurrency(amount) {
        const formattedAmount = parseFloat(amount).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formattedAmount;
    }
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <View style={{ marginBottom: '5%' }}>
                <Text style={{ marginLeft: 20, marginBottom: 10 }}>Tên món hàng</Text>
                <View style={finalStyles.input_cus_payment}>
                    <TextInput style={finalStyles.input} value={paymentName} onChangeText={(text) => { setPaymentName(text) }} autoFocus={false} />
                </View>
                <Text style={{ marginLeft: 20, marginBottom: 10, marginTop: 10 }}>Giá</Text>
                <View style={finalStyles.input_cus_payment}>
                    <TextInput
                        inputMode="decimal"
                        style={finalStyles.input}
                        value={paymentPrice}
                        onChangeText={(text) => {
                            setPaymentPrice(text);
                        }}
                        autoFocus={false}
                    />
                </View>
                <Text style={{ marginLeft: 20, marginBottom: 10, marginTop: 10 }}>Chi tiết món hàng</Text>
                <View style={finalStyles.input_cus_payment}>
                    <TextInput style={finalStyles.input} value={paymentDescription} onChangeText={(text) => { setPaymentDescription(text) }} autoFocus={false} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>

                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: "center",
                        backgroundColor: "#667080",
                        borderRadius: 15,
                        paddingVertical: 15,
                        marginHorizontal: 5,
                        marginLeft: 20
                    }} onPress={handleSubmit}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                            <Text style={{ color: '#ffffff' }}>Thêm phiếu chi</Text>
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity style={{
                        flex: 0.2,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#667080",
                        borderRadius: 15,
                        paddingVertical: 15,
                        marginHorizontal: 5,
                        marginRight: 20
                    }} onPress={()=>createExcel(paymentData)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                            <FontAwesome5 name="file-excel" size={24} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <DataTable>
                    <DataTable.Header style={styles.tableHeader}>
                        <DataTable.Title style={[styles.leftText, { flex: 2, maxHeight: 60, overflow: 'hidden' }]}>Tên món hàng</DataTable.Title>
                        <DataTable.Title style={[styles.centerText, { flex: 3 }]}>Ngày</DataTable.Title>
                        <DataTable.Title style={[styles.rightText, { flex: 2 }]}>Giá</DataTable.Title>
                    </DataTable.Header>
                    {paymentArray
                        .sort((a, b) => new Date(a.CreatedDate) - new Date(b.CreatedDate))
                        .reverse()
                        .map((rowData, index) => (
                            <DataTable.Row key={index} style={styles.tableBody}>
                                <DataTable.Cell style={[styles.leftText, { flex: 2, flexWrap: 'wrap' }]}>
                                    <Text numberOfLines={2} style={{ flexWrap: 'wrap' }}>
                                        {`${rowData.key.substring(1)}.${rowData.Name}`}
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell style={[styles.centerText, { flex: 3 }]}>{rowData.CreatedDate}</DataTable.Cell>
                                <DataTable.Cell style={[styles.rightText, { flex: 2 }]}><MarqueeText text={formatCurrency(rowData.Price)} /></DataTable.Cell>
                            </DataTable.Row>
                        ))}
                </DataTable>

            </ScrollView>

        </SafeAreaView>
    );
}
const MarqueeText = ({ text }) => {
    return (
        <Animated.View style={{ flexDirection: 'row' }}>
            <Text>{text}</Text>
        </Animated.View>
    );
};
const styles = StyleSheet.create({

    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'lightgray',
        alignItems: 'center',
    },
    tableBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centerText: {
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 14,
    },
    leftText: {
        flex: 1,
        paddingLeft: 10,
        fontSize: 14,
    },
    rightText: {
        textAlign: 'right',
        flex: 1,
        paddingLeft: 10,
        fontSize: 14,
    },
    scrollContainer: {
        flexGrow: 1,
        marginTop: 10,
        marginBottom: 100,
        paddingBottom: 10
    },
});