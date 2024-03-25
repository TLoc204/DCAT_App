import React, { useEffect, useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, SafeAreaView, ScrollView, Button } from "react-native";
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, get, set } from 'firebase/database';
import { DatePicker } from 'expo';
import { BottomSheet } from 'react-native-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function Statistics() {
  const database = getDatabase(FIREBASE_APP);
  const [paymentData, setPaymentData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filterPaymentTotal, setFilterPaymentTotal] = useState();
  const [filterOrderTotal, setFilterOrderTotal] = useState();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const bottomSheetDate = useRef(null);
  const [currentDate, setCurrentDate] = useState('Hôm nay');
  const showStartDatePicker = async () => {
    const { year, month, day } = await DatePicker.showDatePickerAsync({
      currentDate: startDate,
    });

    if (year && month && day) {
      const selectedDate = new Date(year, month - 1, day);
      setStartDate(selectedDate);
    }
  };

  const showEndDatePicker = async () => {
    const { year, month, day } = await DatePicker.showDatePickerAsync({
      currentDate: endDate,
    });

    if (year && month && day) {
      const selectedDate = new Date(year, month - 1, day);
      setEndDate(selectedDate);
    }
  };
  useEffect(() => {
    const paymentRef = ref(database, 'Payment');
    const orderRef = ref(database, 'Orders');
    // Tạo một biến để giữ các hàm hủy đăng ký
    const unsubscribePayments = onValue(paymentRef, (snapshot) => {
      const payData = snapshot.val();
      if (payData) {
        setPaymentData(payData);
      }
    });
    const unsubscribeOrders = onValue(orderRef, (snapshot) => {
      const orderData = snapshot.val();
      if (orderData) {
        setOrderData(orderData);
      }
    });
    // Khi component bị unmount, gọi các hàm hủy đăng ký
    return () => {
      unsubscribePayments();
      unsubscribeOrders();
    };
  }, []);
  useEffect(() => {
    const orderArray = Object.entries(orderData).map(([key, value]) => ({
      ...value,
      key,
    }));

    const filteredData = orderArray.filter((data) => {
      const orderDate = data.CreatedDate.split(' ')[0];
      const orderTime = data.CreatedDate.split(' ')[1];
      const isTodayStart = orderDate >= startDate.toISOString().split('T')[0] && orderTime.split(':')[0] >= 6;
      const isTodayEnd = orderDate <= endDate.toISOString().split('T')[0] && orderTime.split(':')[0] < 6;
      if (data.Delete === false) {
        if (orderDate >= startDate.toISOString().split('T')[0] && isTodayStart && orderDate < (endDate.toISOString().split('T')[0])) {
          return true;
        } else if (orderDate >= startDate.toISOString().split('T')[0] && isTodayEnd && orderDate <= (endDate.toISOString().split('T')[0])) {
          return true;
        }
      }
      return false;
    });

    const total = filteredData.reduce((acc, curr) => {
      return acc + parseFloat(curr.TotalDiscountPrice); // Chuyển giá thành số và tính tổng
    }, 0);
    setFilterOrderTotal(total);
  }, [orderData, startDate, endDate]);


  useEffect(() => {
    const paymentArray = Object.entries(paymentData).map(([key, value]) => ({
      ...value,
      key,
    }));

    const filteredData = paymentArray.filter((data) => {
      const paymentDate = data.CreatedDate.split(' ')[0];
      const paymentTime = data.CreatedDate.split(' ')[1];
      const isTodayStart = paymentDate >= startDate.toISOString().split('T')[0] && paymentTime.split(':')[0] >= 6;
      const isTodayEnd = paymentDate <= endDate.toISOString().split('T')[0] && paymentTime.split(':')[0] < 6;
      if (paymentDate >= startDate.toISOString().split('T')[0] && isTodayStart && paymentDate < (endDate.toISOString().split('T')[0])) {
        return data
      } else if (paymentDate >= startDate.toISOString().split('T')[0] && isTodayEnd && paymentDate <= (endDate.toISOString().split('T')[0])) {
        return data
      }
    });
    const total = filteredData.reduce((acc, curr) => {
      return acc + parseFloat(curr.Price); // Chuyển giá thành số và tính tổng
    }, 0);
    setFilterPaymentTotal(total);
  }, [paymentData, startDate, endDate]);

  const openDropDate = () => {
    bottomSheetDate.current.show();
  };
  const handleSelectDate = (dateKey) => {
    setCurrentDate(dateKey); // Cập nhật phòng được chọn
    bottomSheetDate.current.hide(); // Ẩn BottomSheet sau khi lựa chọn

    const today = new Date();
    if (dateKey === 'Hôm nay') {
      // Đặt startDate và endDate là ngày hiện tại
      setStartDate(new Date(today)); // Tạo bản sao độc lập của today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEndDate(tomorrow);
    } else if (dateKey === 'Tháng này') {
      // Lấy ngày đầu tiên của tháng hiện tại
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      // Lấy ngày cuối cùng của tháng hiện tại
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      // Đặt startDate là ngày đầu tiên của tháng và endDate là ngày cuối cùng của tháng
      setStartDate(firstDayOfMonth);
      setEndDate(new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() + 1))); // Thêm 1 ngày
    } else if (dateKey === 'Tháng trước') {
      // Lấy ngày đầu tiên của tháng trước
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      // Lấy ngày cuối cùng của tháng trước
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      // Đặt startDate là ngày đầu tiên của tháng trước và endDate là ngày cuối cùng của tháng trước
      setStartDate(firstDayOfLastMonth);
      setEndDate(new Date(lastDayOfLastMonth.setDate(lastDayOfLastMonth.getDate() + 1))); // Thêm 1 ngày
    }
  };



  const totalRevenue = filterOrderTotal - filterPaymentTotal || 0

  const commonStyles = {
    container_statistics: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5FCFF",
      paddingTop: Platform.OS === "android" ? 45 : 0,
    },
  };

  const mobileStyles = StyleSheet.create({
    container_statistics: {
      flex: 1,
      backgroundColor: "#F5FCFF",
      paddingTop: Platform.OS === "android" ? "15%" : 0,
    },
    dropdownDate: {
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 10,
      paddingRight: 10,
      borderWidth: 1,
      borderRadius: 10,
      width: "65%"
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
      marginTop: 10
    },
    main_statistics_item: {
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
      width: "100%"
    },
    textTotal: {
      fontWeight: "bold",
      color: totalRevenue >= 0 ? 'green' : 'red',
      fontSize: 30,
    },
    text_DoanhThu: {
      width: '100%',
      textAlign: 'center'
    }
  });

  const webStyles = StyleSheet.create({
    container_order: {
      flex: 1,
    },
  });

  const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;

  return (
    <SafeAreaView style={finalStyles.container_statistics}>
      <View style={{ display: "flex", flexDirection: "row", marginBottom: 10, alignItems: 'center', width: "100%" }}>
        <Text style={{ marginLeft: 10, width: "30%" }}>Tổng doanh thu</Text>
        <TouchableOpacity style={finalStyles.dropdownDate} onPress={openDropDate}>
          <Text>{currentDate}</Text>
        </TouchableOpacity>
        <BottomSheet ref={bottomSheetDate} height={280}>
          <TouchableOpacity onPress={() => handleSelectDate('Hôm nay')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10,marginLeft:10, borderTopWidth: 1, borderColor: "#DCDCDC", paddingTop: 5 }}>
              <View style={finalStyles.checkIconContainer}>
                {currentDate === 'Hôm nay' && <Icon name="check" size={20} color="#667080" />}
              </View>
              <Text style={{ marginLeft: 10, marginTop: 10 }}>Hôm nay</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectDate('Tháng này')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10,marginLeft:10, borderTopWidth: 1, borderColor: "#DCDCDC", paddingTop: 5 }}>
              <View style={finalStyles.checkIconContainer}>
                {currentDate === 'Tháng này' && <Icon name="check" size={20} color="#667080" />}
              </View>
              <Text style={{ marginLeft: 10, marginTop: 10 }}>Tháng này</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectDate('Tháng trước')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10,marginLeft:10, borderTopWidth: 1, borderColor: "#DCDCDC", paddingTop: 5 }}>
              <View style={finalStyles.checkIconContainer}>
                {currentDate === 'Tháng trước' && <Icon name="check" size={20} color="#667080" />}
              </View>
              <Text style={{ marginLeft: 10, marginTop: 10 }}>Tháng trước</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10,marginLeft:10, borderTopWidth: 1, borderColor: "#DCDCDC", paddingTop: 5 }}>
              <View style={finalStyles.checkIconContainer}>
                {currentDate === 'Tùy chỉnh thời gian' && <Icon name="check" size={20} color="#667080" />}
              </View>
              <Text style={{ marginLeft: 10, marginTop: 10 }}>Tùy chỉnh thời gian</Text>
            </View>
          </TouchableOpacity>
        </BottomSheet>
      </View>
      <View style={finalStyles.main_statistics_item}>
        <View style={{ flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Doanh thu</Text>
          <Text style={[finalStyles.textTotal, { fontSize: 24 }]}>{totalRevenue ? totalRevenue.toLocaleString('vi-VN') : 0}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: 'space-around', width: '100%',marginTop:15 }}>
          <View style={{ flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'green' }}>{filterOrderTotal ? filterOrderTotal.toLocaleString('vi-VN') : 0}</Text>
            <Text style={{ fontSize: 14, color: 'gray' }}>Thu nhập</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{ fontSize: 16, color: 'red' }}>{filterPaymentTotal ? filterPaymentTotal.toLocaleString('vi-VN') : 0}</Text>
            <Text style={{ fontSize: 14, color: 'gray' }}>Chi phí</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
