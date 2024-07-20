import React, { createContext, useEffect, useState, useRef, useContext } from "react";
import { SafeAreaView, StyleSheet, Text, ImageBackground, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { FIREBASE_APP } from '../../FirebaseConfig';
import {
  getDatabase,
  ref,
  onValue
} from 'firebase/database';
import { useImageAllFolder } from "../Order/FoodOrder"
import { useNavigation } from '@react-navigation/native';
const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const database = getDatabase(FIREBASE_APP);
  const [dataFoods, setDataFoods] = useState([]);
  const [dataCategories, setDataCategories] = useState([]);
  const [dataFoodBonus, setDataFoodBonus] = useState([]);
  const [dataDrinks, setDataDrinks] = useState([]);
  const [dataDrink2ND, setDataDrink2ND] = useState([]);
  const [dataToppings, setDataToppings] = useState([]);
  const [dataGames, setDataGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const { imageAllFolder } = useImageAllFolder();
  const [defaultImageUrl, setDefaultImageUrl] = useState('https://firebasestorage.googleapis.com/v0/b/dcat-c09a4.appspot.com/o/logoDCAT_Trang.jpg?alt=media&token=a0caf069-f241-42bb-91e2-849c1817cada');
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
  useEffect(() => {
    setFilteredOrders(getFilteredData());
  }, [selectedCategory, dataDrinks, dataDrink2ND, dataFoods, dataToppings, dataFoodBonus, dataGames]);
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
  const handleSelectCategory = (key) => {
    setSelectedCategory(key);
  };
  const commonStyles = {
    container_order: {
      justifyContent: 'center',
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
  };
  const mobileStyles = StyleSheet.create({
    container_foodorder: {
      flex: 1,
      backgroundColor: "#ffffff",
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
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
      width: 136,
      alignItems: "center",
      backgroundColor: "#2E2E2E",
      borderRadius: 20,
      paddingVertical: 21,
      shadowColor: "#00000026",
      shadowOpacity: 0.2,
      shadowOffset: {
        width: 0,
        height: 9
      },
      shadowRadius: 19,
      elevation: 19,
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
    scrollView: {
      flexDirection: "row",
      marginBottom: 20,
      marginTop: 20,
      marginHorizontal: 15,
    },
    card: {
      width: 270,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      marginRight: 22,
    },
    cardInner: {
      flex: 1,
    },
    image: {
      borderRadius: 30,
    },
    imageBackground: {
      height: 405,
      paddingTop: 14,
      paddingBottom: 25,
      paddingRight: 17,
    },
    textContainer: {
      backgroundColor: "#1D1D1D66",
      borderRadius: 15,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginTop: 280,
      marginLeft: 20,
    },
    nameText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      width: 13,
      height: 16,
      marginRight: 14,
    },
    priceText: {
      color: "#C9C8C8",
      fontSize: 14,
    },
  });


  const webStyles = StyleSheet.create({

  });
  const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 29,
        }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 33,
            marginHorizontal: 15,
          }}>
          <View
            style={{
              width: 174,
            }}>
            <Text
              style={{
                color: "#2E2E2E",
                fontSize: 30,
                fontWeight: "bold",
                marginBottom: 19,
              }}>
              {"DCAT 👋"}
            </Text>
            <Text
              style={{
                color: "#888888",
                fontSize: 20,
                fontWeight: "bold",
              }}>
              {" "}
            </Text>
          </View>
          <ImageBackground
            source={require('../../assets/logoDCAT_Trang.png')}
            resizeMode={"cover"}
            style={{
              width: 80,
              height: 80,
            }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 20, height: 'auto', width: 'auto' }}>
          <TouchableOpacity onPress={() => handleSelectCategory('')} style={[finalStyles.categoryButton, selectedCategory === '' && finalStyles.categoryButtonSelected]}>
            <View >
              <Text style={[finalStyles.categoryButtonText, selectedCategory === '' && finalStyles.categoryButtonTextSelected]}>Tất cả</Text>
            </View>
          </TouchableOpacity>
          {Object.keys(dataCategories).map((key) => (
            <TouchableOpacity key={key} onPress={() => handleSelectCategory(key)} style={[finalStyles.categoryButton, selectedCategory === key && finalStyles.categoryButtonSelected]}>
              <Text style={[finalStyles.categoryButtonText, selectedCategory === key && finalStyles.categoryButtonTextSelected]}>{dataCategories[key].Name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal style={styles.scrollView} showsHorizontalScrollIndicator={false}>
          {filteredOrders.map(([id, data]) => {
            const name = data.Name;
            const imageArray = Array.isArray(imageAllFolder) ? imageAllFolder : [{ name: "", url: defaultImageUrl }];
            const url = imageArray.find((item) => item.name === data.Image)?.url || defaultImageUrl;

            const navigation = useNavigation();

            const handleCardPress = () => {
              // Navigate to a different screen with ID and data
              navigation.navigate('HomeDetail', {
                idHomeDetail: id,
                dataHomeDetail: data,
                urlHomeDetail:url
              });
            };

            return (
              <TouchableOpacity key={id} style={styles.card} onPress={handleCardPress}>
                <View style={styles.cardInner}>
                  <ImageBackground
                    source={{ uri: url }} // Update the base URL accordingly
                    resizeMode={'stretch'}
                    imageStyle={styles.image}
                    style={styles.imageBackground}
                  >
                    <View style={styles.textContainer}>
                      <Text style={styles.nameText}>{name}</Text>
                      <View style={styles.row}>
                        <Text style={styles.priceText}>Giá: {data.Price.toLocaleString('vi-VN')} VND</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>


      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',

  },
  text: {
    color: "#000000",
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 20,
    marginHorizontal: 15,
  },
  card: {
    width: 270,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 22,
  },
  cardInner: {
    flex: 1,
  },
  image: {
    borderRadius: 30,
  },
  imageBackground: {
    height: 405,
    paddingTop: 14,
    paddingBottom: 25,
    paddingRight: 17,
  },
  textContainer: {
    backgroundColor: "#1D1D1D66",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 280,
    marginLeft: 20,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 13,
    height: 16,
    marginRight: 14,
  },
  priceText: {
    color: "#C9C8C8",
    fontSize: 14,
  },
});

export default App;
