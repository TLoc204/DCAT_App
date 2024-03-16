import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, get, set } from 'firebase/database';
// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');


export default function Statistics() {
  const database = getDatabase(FIREBASE_APP);
  const [paymentData, setPaymentData] = useState([])
  const [orderData, setOrderData] = useState([])
  const [chartData, setChartData] = useState([]);
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
      const orderData = snapshot.val();0
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
  const commonStyles = {
    container_statistics: {
      justifyContent: 'center',
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
  };
  const mobileStyles = StyleSheet.create({
    container_statistics: {
      flex: 1,
      paddingTop: "15%",
    },
  });
  const webStyles = StyleSheet.create({
    container_order: {
      flex: 1,
    },
  });
  const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
  return (
    <View style={finalStyles.container_statistics}>
      <LineChart
        data={{
          labels: ["January", "February", "March", "April", "May", "June"],
          datasets: [
            {
              data: [
                693.000,70.000
              ]
            }
          ]
        }}
        width={Dimensions.get("window").width}
        height={220}
        yAxisLabel=""
        yAxisSuffix="k"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#ffa900",
          backgroundGradientFrom: "#FFE599",
          backgroundGradientTo: "#FFE700",
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 159, ${opacity})`,
          labelColor: (opacity = 1) => `black`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );

}
