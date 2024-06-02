import React, { createContext, useEffect, useState, useRef, useContext } from "react";
import { SafeAreaView, StyleSheet, Text, ImageBackground, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
export default function HomeDetail({ route }) {
    const ID = route.params?.idHomeDetail || {};
    const data = route.params?.dataHomeDetail || {};
    const image = route.params?.urlHomeDetail || {};
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{
                    backgroundColor: "#FFFFFF",
                    paddingTop: 28,
                    paddingBottom: 56,
                    paddingHorizontal: 28,
                }}>
                <View
                    style={{
                        marginBottom: 43,
                    }}>
                    <ImageBackground
                        source={{ uri: image }}
                        resizeMode={'stretch'}
                        imageStyle={{ borderRadius: 25, }}
                        style={{
                            height: 460,
                            paddingTop: 18,
                            paddingBottom: 29,
                            paddingHorizontal: 21,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 265,
                            }}>
                        </View>
                        <View
                            style={{
                                backgroundColor: "#1D1D1D4D",
                                borderRadius: 15,
                                paddingVertical: 23,
                                paddingHorizontal: 15,
                            }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 17,
                                }}>
                                <Text
                                    style={{
                                        color: "#FFFFFF",
                                        fontSize: 24,
                                        fontWeight: "bold",
                                        marginRight: 4,
                                        flex: 1,
                                    }}>
                                    {data.Name}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}>
                                <Text
                                    style={{
                                        color: "#C9C8C8",
                                        fontSize: 18,
                                    }}>
                                    {"Giá: " + data.Price.toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                
                <Text
                    style={{
                        color: "#A4A4A4",
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 23,
                        paddingBottom:20,
                        width: 374,
                    }}>
                    {data.Note !== ""?data.Note:"Không có dữ liệu chi tiết"}
                </Text>
            </ScrollView>


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

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

