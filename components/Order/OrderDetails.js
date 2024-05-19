import React, { useEffect, useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, SafeAreaView, ScrollView, TextInput, FlatList, Keyboard } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { Dropdown } from 'react-native-element-dropdown';
import { getStorage, ref as storageRef } from "firebase/storage";
import { useImageAllFolder } from "./FoodOrder"
import IconAnt from 'react-native-vector-icons/AntDesign';
import { showMessage, hideMessage, } from "react-native-flash-message";
import { Canvas } from 'react-native-canvas';
// Lấy kích thước màn hình để hỗ trợ responsive
import TcpSocket from 'react-native-tcp-socket';

export default function OrderDetails({ route }) {
    const database = getDatabase(FIREBASE_APP); 
    const { Orders } = route.params;
    const { OrderID } = route.params;
    // const IDOrder = "O" + titleOrderId
    const iconv = require('iconv-lite');
    const [dataRoom, setDataRoom] = useState([]);
    const [roomDropdownData, setRoomDropdownData] = useState([]);
    const navigation = useNavigation();
    let [selectedRoom, setSelectedRoom] = useState(Object.values(Orders[3])[1] || '');
    const [customerName, setCustomerName] = useState(Object.values(Orders[4][1])[0]["CustomerName"] || '');
    const { imageAllFolder } = useImageAllFolder();
    const [discountTotal, setDiscountTotal] = useState('');
    const foods = route.params?.Foods || {};
    const [discount, setDiscount] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [defaultImageUrl, setDefaultImageUrl] = useState('https://firebasestorage.googleapis.com/v0/b/dcat-c09a4.appspot.com/o/MacDinh.jpg?alt=media&token=d66af2a0-9be6-44cb-9eda-504f04c1763c');
    const [selectedPayment, setSelectedPayment] = useState('Cash');
    const [printing, setPrinting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (Object.keys(foods).length > 0) {
            setCartItems(foods);
        } else {
            const initialData = Object.values(Orders[4][1]);
            const transformedData = {};

            initialData.forEach((item) => {
                const idMap = new Map(); // Sử dụng Map để theo dõi các id đã xuất hiện

                for (const key in item) {
                    if (key !== "CustomerName" && key.startsWith("OD")) {
                        const subItem = item[key];

                        const idType = Object.keys(subItem)[1]; // Loại Id (IdDrink, IdDrink2ND, IdGame, IdFoodBonus, IdFood)

                        let idValue = subItem[idType]; // Giá trị Id cụ thể

                        const name = subItem.Name || ""; // Lấy tên từ danh mục tương ứng
                        const price = subItem.Price || 0; // Lấy giá từ danh mục tương ứng
                        const discount = subItem.Discount;
                        const quantity = subItem.Quantity;
                        const totalPrice = price * quantity;
                        const image = subItem.Image;
                        // Tạo một key duy nhất cho mỗi sản phẩm dựa trên id và discount
                        let uniqueKey = `${idValue}_${discount}`;

                        // Kiểm tra và cập nhật số lượng sản phẩm với key duy nhất
                        if (idMap.has(uniqueKey)) {
                            let count = idMap.get(uniqueKey) + 1;
                            uniqueKey = `${idValue}_${discount}_${count}`;
                            idMap.set(uniqueKey, 1); // Cập nhật count cho uniqueKey
                        } else {
                            idMap.set(uniqueKey, 1);
                        }

                        // Chỉ định mỗi key ánh xạ trực tiếp tới một object chứa thông tin sản phẩm
                        transformedData[uniqueKey] = {
                            discount,
                            key: uniqueKey,
                            name,
                            price,
                            quantity,
                            totalPrice,
                            image
                        };

                    }
                }
            });

            // Trực tiếp cập nhật cartItems với object đã được biến đổi 
            setCartItems(transformedData);
        }
    }, [route.params]);



    useEffect(() => {
        const roomRef = ref(database, 'Rooms');
        // Tạo một biến để giữ các hàm hủy đăng ký
        const unsubscribeRooms = onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                setDataRoom(roomData);
            }
        });

        // Khi component bị unmount, gọi các hàm hủy đăng ký
        return () => {
            unsubscribeRooms();
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
    //-----------------------------------------------------------Room-----------------------------------------------------------------
    const roomNames = {};
    // Duyệt qua dataTables và lưu tên của các bàn vào tableNames
    Object.keys(dataRoom).forEach((roomKey) => {
        const room = dataRoom[roomKey];
        roomNames[roomKey] = room.Name;
    });
    const handleSearchChange = (query) => {
        if (query !== '') {
            setSearchQuery(query);
        }
    };
    useEffect(() => {
        // Chuyển đổi dataRoom thành mảng cho Dropdown
        const roomOptions = Object.keys(dataRoom).map((key) => {
            return { label: dataRoom[key].Name, value: key };
        });
        setRoomDropdownData(roomOptions);
    }, [dataRoom]);
    const handleRoomChange = (selectedValue) => {
        setSelectedRoom(selectedValue);
    };


    const updateDiscount = (key, discountValue) => {
        setCartItems((prevCartItems) => {
            const newCartItems = { ...prevCartItems };

            if (newCartItems[key]) {
                const price = newCartItems[key].price; // Lấy giá của món hàng
                newCartItems[key].discount = discountValue; // Cập nhật giảm giá

                // Tính toán và cập nhật discountPrice
                newCartItems[key].discountPrice = calculateTotalPrice(newCartItems[key]);
            }

            return newCartItems;
        });
    };

    const calculateTotalPrice = (item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        const discount = item.discount || 0;

        // Tính giá trị sau giảm giá
        const discountedPrice = price * (1 - discount / 100);

        return discountedPrice * quantity;
    };

    const totalCartPrice = Object.values(cartItems).reduce(
        (total, item) => total + item.totalPrice,
        0
    );
    const totalCartDiscountPrice = Object.values(cartItems).reduce(
        (total, item) => total + (item.totalPrice - (item.totalPrice * item.discount / 100 || 0)),
        0
    );
    const checkInput = () => {
        if (!selectedRoom || !Object.values(selectedRoom)[1]) {
            selectedRoom = ''; // Gán giá trị mặc định là chuỗi rỗng
        }
        if (customerName.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng nhập tên khách."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }
        if (selectedRoom.length === 0) {
            showMessage({
                message: "Tạo đơn thất bại",
                type: "danger",
                icon: { icon: "danger", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Tạo đơn thất bại"
                        description="Vui lòng chọn phòng."
                        icon="closecircle"
                    />
                ),
            });
            return; // Dừng việc thực hiện tiếp theo
        }



    }


    let data = '\x0a';
    data += '                     DCAT\n';
    data += "              Hoa don thanh toan\n\n";
    data += '----------------------------------------------\n\n';
    data += 'Stt  Ten mon            SL   Gia    Thanh tien\n';
    
    let stt = 1;
    let totalPrice = 0;
    let totalPriceDiscount = 0;
    
    function formatTextWrap(text, width) {
        // Hàm loại bỏ dấu từ mỗi từ
        function removeAccents(word) {
            const accentsMap = {
                'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
                'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
                'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
                'đ': 'd',
                'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
                'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
                'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
                'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
                'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
                'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
                'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
                'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
                'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
                'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
                'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
                'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
                'Đ': 'D',
                'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
                'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
                'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
                'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
                'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
                'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
                'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
                'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
                'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
            };
    
            let newWord = '';
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const replacement = accentsMap[char];
                newWord += replacement || char;
            }
            return newWord;
        }
    
        let result = [];
        let line = '';
    
        for (const word of text.split(' ')) {
            const sanitizedWord = removeAccents(word); // Loại bỏ dấu từ mỗi từ
            if (line.length + sanitizedWord.length + 1 > width) {
                result.push(line.trim());
                line = '';
            }
            line += sanitizedWord + ' ';
        }
        if (line.trim().length > 0) {
            result.push(line.trim());
        }
    
        return result;
    }
    
    
    for (const key in cartItems) {
        if (cartItems.hasOwnProperty(key)) {
            const item = cartItems[key];
            const itemNameWrapped = formatTextWrap(item.name, 16); // Sử dụng hàm formatTextWrap
            const itemPrice = item.price
            const itemQuantity = item.quantity;
            const itemTotalPrice = item.totalPrice;
    
            // Dòng đầu tiên của itemName
            data += ` ${stt.toString().padEnd(3)} ${itemNameWrapped[0].padEnd(16)}   ${itemQuantity.toString().padEnd(2)}   ${itemPrice.toLocaleString('vi-VN').toString().padEnd(6)}   ${itemTotalPrice.toLocaleString('vi-VN').toString().padStart(8)}\n`;
    
            // Các dòng tiếp theo của itemName
            for (let i = 1; i < itemNameWrapped.length; i++) {
                data += `     ${itemNameWrapped[i].padEnd(16)}\n`;
            }
    
            stt++;
            totalPrice += item.totalPrice;
            totalPriceDiscount += item.totalPrice * (1 - item.discount / 100);
        }
    }
    
    data += '----------------------------------------------\n';
    if(totalPriceDiscount<totalPrice){ 
        data += `Tong${totalPrice.toLocaleString('vi-VN').toString().padStart(42)}\n`;
    }else{
        data += `Tong cong${totalPrice.toLocaleString('vi-VN').toString().padStart(37)}\n`;
    }
    let discountPrint = (totalPriceDiscount - totalPrice).toLocaleString('vi-VN').toString();
    if(totalPriceDiscount<totalPrice){
        data += `Giam gia${discountPrint.padStart(38)}\n`;
    }
    if(totalPriceDiscount<totalPrice){
        data += `Tong cong${totalPriceDiscount.toLocaleString('vi-VN').toString().padStart(37)}\n`;
    }
    data += `\n`;
    data += `         Cam on quy khach, hen gap lai!`;
    data += `\n`;
    data += `\n`;
    data += `\n`;
    data += `\n`;
    data += `\n`;
    data += `\n`;
    data += `\n`;
    console.log(data)
    console.log(totalPriceDiscount)
    // Hàm in hóa đơn
    const utf8Text = iconv.encode(data, 'utf8').toString();
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Thiết lập thời gian hủy bỏ sau 5 giây
    setTimeout(() => controller.abort(), 5000);
    const printBill = async () => {
        try {
            const url = 'http://192.168.1.251:9100'; // Thay đổi địa chỉ URL theo địa chỉ của máy in và cổng
    
            const data = `${utf8Text}\x1b\x4f \x1B\x69` // Thay đổi dữ liệu in tùy thuộc vào định dạng yêu cầu bởi máy in
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                signal,
                mode:"no-cors",
                body: data, // Dữ liệu cần in
            });
    
            if (response.ok) {
                console.log('Dữ liệu đã được gửi thành công đến máy in');
            } else {
                console.error('Đã xảy ra lỗi khi gửi dữ liệu đến máy in:', response.statusText);
            }
        } catch (error) {
            
        }
    };


    //-----------------------------------------------------------End Room-------------------------------------------------------------
    const handleSubmit = async () => {
        // Lấy OrderID từ route.params
        const { OrderID } = route.params;

        // Kiểm tra xem OrderID có tồn tại không
        if (OrderID) {
            const orderRef = ref(database, `Orders/${OrderID}`);
            let orderDetailsData = {};
            Object.values(cartItems).forEach((item, index) => {
                const orderKey = 'OD1';
                const formattedIndex = (index + 1).toString().padStart(2, '0');
                const itemKey = `${orderKey}_${formattedIndex}`;
                const itemId = item.key.split('_')[0];
                const itemTypePrefix = itemId.match(/[A-Za-z]+/)[0];
                let itemType = '';

                switch (itemTypePrefix) {
                    case 'D':
                        itemType = 'IdDrink';
                        break;
                    case 'F':
                        itemType = 'IdFood';
                        break;
                    case 'DD':
                        itemType = 'IdDrink2ND';
                        break;
                    case 'Tp':
                        itemType = 'IdTopping';
                        break;
                    case 'Fb':
                        itemType = 'IdFoodBonus';
                        break;
                    case 'G':
                        itemType = 'IdGame';
                        break;
                    default:
                        console.log("Unknown item type");
                }

                if (!orderDetailsData[orderKey]) {
                    orderDetailsData[orderKey] = {};
                }

                orderDetailsData[orderKey][itemKey] = {
                    [itemType]: itemId,
                    "Quantity": item.quantity,
                    "Name": item.name,
                    "Discount": item.discount,
                    "Price": item.price,
                    "Image": item.image
                };
            });

            orderDetailsData['OD1']['CustomerName'] = customerName || 'Khách hàng';
            try {
                await update(orderRef, {
                    "IdRoom": selectedRoom.value,
                    "OrderDetails": orderDetailsData,
                    "TotalAmount": totalCartPrice,
                    "TotalDiscountPrice": totalCartDiscountPrice,
                    "DiscountTotal": discountTotal || 0
                });
                console.log("Cập nhật thành công!");
            } catch (error) {
                console.error("Lỗi khi cập nhật:", error);
            }
        } else {
            console.log('OrderID is missing');
            // Xử lý khi không có OrderID
        }
        navigation.navigate('Order')
    };
    const handleSubmitPaid = async () => {
        // Lấy OrderID từ route.params
        const { OrderID } = route.params;

        // Kiểm tra xem OrderID có tồn tại không
        if (OrderID) {
            const orderRef = ref(database, `Orders/${OrderID}`);
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Ngày
            const time = now.toTimeString().split(' ')[0]; // Thời gian
            try {
                await update(orderRef, {
                    Delete: true,
                    PaidDate: `${date} ${time}`,
                    PaymentMethods: selectedPayment
                });
                console.log("Cập nhật thành công!");
            } catch (error) {
                console.error("Lỗi khi cập nhật:", error);
            }
        } else {
            console.log('OrderID is missing');
        }
        navigation.navigate('Order')
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
    const handleEditOrder = () => {
        if (Object.values(cartItems).length > 0 &&
            selectedRoom &&
            customerName.length > 0) {
            handleSubmit();
            showMessage({
                message: "Sửa đơn thành công",
                type: "success",
                icon: { icon: "success", position: "left" },
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message="Sửa đơn thành công"
                        description="Đơn hàng của bạn đã được sửa thành công."
                        icon="checkcircle"
                    />
                ),
            });
            setTimeout(() => {
                hideMessage();
            }, 2000); // 2000 miliseconds = 2 giây
        } else {
            checkInput();
        }
    }
    const handlePaidOrder = () => {
        if (Object.values(cartItems).length > 0 &&
            selectedRoom &&
            customerName.length > 0) {
            handleSubmitPaid()
            showMessage({
                message: `Thanh toán đơn hàng ${OrderID} thành công`,
                type: "success",
                icon: { icon: "success", position: "left" }, // Use the built-in icon
                // Here you can pass your custom component
                renderCustomContent: () => (
                    <CustomMessageComponent
                        message={`Thanh toán đơn hàng ${OrderID} thành công`}
                        description={`Đơn hàng ${OrderID} đã được thanh toán thành công.`}
                        icon="checkcircle"
                    />
                ),
            });
            setTimeout(() => {
                hideMessage();
            }, 2000); // 2000 miliseconds = 2 giây
        } else {
            checkInput();
        }
    }
    const paymentOptions = [
        { label: 'Tiền mặt', value: 'Cash' },
        { label: 'Momo', value: 'Momo' },
        { label: 'Ngân hàng', value: 'Bank' },
    ];
    const handlePaymentChange = (option) => {
        setSelectedPayment(option.value);
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
            paddingTop: 20,
        },
        main_order: {
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
        main_order_item: {
            flexDirection: "row",
            alignItems: "center",
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
        },
        icon: {
            marginLeft: -2
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
        },
        container_sheet: {
            backgroundColor: "#f8f8f8",
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            shadowRadius: 104,
            elevation: 104,
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
        inputStyleDD: {
            fontSize: 16
        },
        input: {
            fontSize: 16
        },
        placeholderStyle: {
            fontSize: 16
        },
        //------------------------------- Css Món Ăn----------------------------------

        listContainer: {
            paddingHorizontal: 0,
            alignItems: 'flex-start',
        },
        gridTotal: {
            width: '100%',
            height: 'auto'
        },
        // CSS cho gridItem
        gridItem: {
            width: Dimensions.get('window').width - 40,

            paddingTop: 10,
            paddingBottom: 10,
            flexDirection: 'row',
            marginLeft: 5,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
        },

        // CSS cho ảnh
        image: {
            width: 80,
            height: 80,
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

        },

        // CSS cho giá sản phẩm
        itemPrice: {
            color: '#667080',
        },
        orderlist: {
            flex: 1,
            backgroundColor: "#ffffff",
            padding: 10,
            paddingLeft: 10,
            paddingTop: Object.values(cartItems).length > 0 ? 5 : 10,
            paddingRight: 10,
            paddingBottom: 10,
            borderRadius: 10,
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            marginLeft: 20,
            marginRight: 20,
        }
    });

    const webStyles = StyleSheet.create({
        container_order: {
            flex: 1,
        },
        main_order: {
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
        main_order_item: {
            flexDirection: "row",
            alignItems: "center",
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
        },
        icon: {
            marginLeft: -2
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
        },
        container_sheet: {
            backgroundColor: "#f8f8f8",
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            shadowRadius: 104,
            elevation: 104,
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
        inputStyleDD: {
            fontSize: 16
        },
        input: {
            fontSize: 16
        },
        placeholderStyle: {
            fontSize: 16
        },
        //------------------------------- Css Món Ăn----------------------------------

        listContainer: {
            paddingHorizontal: 0,
            alignItems: 'flex-start',
        },
        gridTotal: {
            width: '100%',
            height: 'auto'
        },
        // CSS cho gridItem
        gridItem: {
            width: Dimensions.get('window').width - 40,

            paddingTop: 10,
            paddingBottom: 10,
            flexDirection: 'row',
            marginLeft: 5,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
        },

        // CSS cho ảnh
        image: {
            width: 80,
            height: 80,
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

        },

        // CSS cho giá sản phẩm
        itemPrice: {
            color: '#667080',
        },
        orderlist: {
            flex: 1,
            backgroundColor: "#ffffff",
            padding: 10,
            paddingLeft: 10,
            paddingTop: Object.values(cartItems).length > 0 ? 5 : 10,
            paddingRight: 10,
            paddingBottom: 10,
            borderRadius: 10,
            shadowColor: "#0000001A",
            shadowOpacity: 0.1,
            shadowOffset: {
                width: 0,
                height: 20
            },
            marginLeft: 20,
            marginRight: 20,
        }
    });
    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    // ...
    // ...
    return (
        <SafeAreaView style={finalStyles.container_order}>
            <ScrollView>
                <View style={{ marginBottom: '20%' }}>
                    <Text style={{ marginLeft: 20, marginBottom: 5 }}>Tên khách hàng</Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} value={customerName} onChangeText={(text) => { setCustomerName(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Phòng</Text>
                    <View style={finalStyles.input_cus}>
                        <View style={finalStyles.pickerContainer}>
                            <Dropdown
                                style={finalStyles.dropdown}
                                placeholderStyle={finalStyles.placeholderStyle}
                                selectedTextStyle={finalStyles.selectedTextStyle}
                                inputSearchStyle={finalStyles.inputSearchStyle}
                                itemTextStyle={finalStyles.inputStyleDD}
                                iconStyle={finalStyles.iconStyle}
                                data={roomDropdownData}
                                placeholder="Chọn phòng"
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                value={selectedRoom}
                                onChange={handleRoomChange}
                            />
                        </View>
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Danh sách món</Text>
                    <View style={finalStyles.orderlist}>
                        <FlatList
                            data={Object.entries(cartItems)}
                            renderItem={({ item, index }) => {
                                const [key, data] = item;
                                const name = data.name;
                                const price = data.price;
                                const img = data.image;
                                const quantity = data.quantity;
                                const totalPrice = price * quantity || 0;
                                const discountPrice = totalPrice * (data.discount / 100) || 0;


                                const imageArray = imageAllFolder || [];


                                const url = imageArray.find((item) => item.name === img)?.url || defaultImageUrl;
                                return (
                                    <View style={[finalStyles.gridTotal]}>
                                        <View
                                            style={[
                                                finalStyles.gridItem,
                                                index === Object.entries(cartItems).length - 1
                                                    ? { borderBottomWidth: 0 }
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
                                                    {cartItems[key].discount !== undefined ? ( // Kiểm tra nếu có giá trị discount thì hiển thị nó
                                                        <Text>{cartItems[key].discount}%</Text>
                                                    ) : ( // Nếu không có giá trị discount thì cho phép người dùng nhập
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <TextInput
                                                                value={discount[key] || ''}
                                                                inputMode="decimal"
                                                                onChangeText={(text) => {

                                                                    setDiscount((prevDiscount) => ({
                                                                        ...prevDiscount,
                                                                        [key]: text,
                                                                    }));
                                                                }}
                                                                onEndEditing={() => {

                                                                    updateDiscount(key, discount[key]);

                                                                    setDiscount((prevDiscount) => ({
                                                                        ...prevDiscount,
                                                                        [key]: '',
                                                                    }));
                                                                }}
                                                            />
                                                            <Text>%</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View>
                                                        {cartItems[key].discount !== 0 ? (
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Text style={[finalStyles.itemPrice, { justifyContent: 'flex-start', textDecorationLine: 'line-through' }]}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                                <Text style={[finalStyles.itemPrice, { marginLeft: 5 }]}>{`${(totalPrice - discountPrice).toLocaleString('vi-VN')}đ`}</Text>
                                                            </View>
                                                        ) : (
                                                            <Text style={finalStyles.itemPrice}>{`${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
                                                        )}
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 50 }}>

                                                        <Text style={{ marginLeft: 8, marginRight: 8 }}>SL: {quantity}</Text>

                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                            numColumns={1}
                            keyExtractor={(item) => item[0]}
                            contentContainerStyle={[finalStyles.listContainer]}
                        />
                        <View>
                            <TouchableOpacity style={{
                                alignItems: "center",
                                backgroundColor: "#667080",
                                borderRadius: 15,
                                paddingVertical: 15,
                                marginHorizontal: 5,
                            }} onPress={() => navigation.navigate('FoodOrder', { Foods: cartItems, origin: 'OrderDetails', Orders: Orders, OrderID: OrderID })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                    <Text style={{ color: '#ffffff' }}>Thêm món</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 5 }}>Giảm giá </Text>
                    <View style={finalStyles.input_cus}>
                        <TextInput style={finalStyles.input} onChangeText={(text) => { setDiscountTotal(text) }} />
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Chi tiết thanh toán</Text>
                    <View style={finalStyles.orderlist}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'gray', }}>
                            <Text style={{ justifyContent: 'flex-start' }}>Tổng</Text>
                            <Text style={{ justifyContent: 'flex-end' }}>{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        <View style={{ justifyContent: 'space-between', paddingBottom: 10, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: 'gray', }}>
                            <Text style={{ justifyContent: 'flex-start' }}>Các món khuyến mãi</Text>
                            {Object.entries(cartItems).filter(([key, data]) => data.discount !== undefined && data.discount > 0).map(([key, data], index) => {
                                if (data.discount !== undefined && data.discount > 0) {
                                    return (

                                        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', justifyContent: 'flex-start' }}>
                                                <Text>{`${index + 1}. `}</Text>
                                                <Text style={{ justifyContent: 'flex-start' }}>{data.name}</Text>
                                            </View>
                                            <Text style={{ justifyContent: 'flex-end' }}>{`-${((data.price * data.quantity) * (data.discount / 100)).toLocaleString('vi-VN')}đ`}</Text>
                                        </View>

                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'gray' }}>
                            <Text style={{ justifyContent: 'flex-start' }}>Giảm giá tổng</Text>
                            <Text style={{ justifyContent: 'flex-end' }}>{`${(totalCartDiscountPrice * discountTotal / 100) > 0 ? '-' : ''}${(totalCartPrice * discountTotal / 100).toLocaleString('vi-VN')}đ`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={{ justifyContent: 'flex-start', fontWeight: 'bold' }}>Tổng cộng</Text>
                            <Text style={{ justifyContent: 'flex-end', fontWeight: 'bold' }}>{(discountTotal ? (totalCartDiscountPrice - (totalCartPrice * discountTotal / 100)) : totalCartDiscountPrice).toLocaleString('vi-VN')}đ</Text>
                        </View>
                    </View>
                    <Text style={{ marginLeft: 20, marginBottom: 5, marginTop: 10 }}>Phương thức thanh toán</Text>
                    <View style={finalStyles.input_cus}>
                        <View style={finalStyles.pickerContainer}>
                            <Dropdown
                                style={finalStyles.dropdown}
                                placeholderStyle={finalStyles.placeholderStyle}
                                selectedTextStyle={finalStyles.selectedTextStyle}
                                inputSearchStyle={finalStyles.inputSearchStyle}
                                itemTextStyle={finalStyles.inputStyleDD}
                                iconStyle={finalStyles.iconStyle}
                                data={paymentOptions}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                value={selectedPayment}
                                onChange={handlePaymentChange}
                            />
                        </View>
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
                        }} onPress={() => {
                            printBill()
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                <Text style={{ color: '#ffffff' }}>Thanh toán</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
            {!isKeyboardVisible ?
                (<View style={{
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
                    justifyContent: 'space-between',
                }}>
                    {/* Left Component */}
                    <TouchableOpacity style={{ justifyContent: 'flex-start' }}>
                        <View style={{ flexDirection: 'row', position: 'relative', paddingLeft: 20 }}>
                            {/* Add any content for the left component here */}
                        </View>
                    </TouchableOpacity>

                    {/* Right Component */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginRight: 10 }}>{totalCartDiscountPrice.toLocaleString('vi-VN')}đ</Text>
                        <TouchableOpacity
                            style={{
                                alignItems: "center",
                                backgroundColor: "#667080",
                                width: 120,
                                height: 55,
                                top: 0,
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                handleEditOrder()
                            }}
                        >
                            <Text style={{
                                color: "#ffffff",
                                fontSize: 14,
                            }}>Sửa đơn</Text>
                        </TouchableOpacity>
                    </View>
                </View>)
                : null}

        </SafeAreaView>
    );
}
