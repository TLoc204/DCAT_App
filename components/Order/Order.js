import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, Dimensions, Platform, StyleSheet, AsyncStorage, Alert, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';

// Lấy kích thước màn hình để hỗ trợ responsive
const { width, height } = Dimensions.get('window');

export default function Order() {

    const handleSubmit = async () => {

    };
    const commonStyles = {
        container: {
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
    };
    const mobileStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#FFFFFF",
        }
    });
    const webStyles = StyleSheet.create({

    });

    const finalStyles = Platform.OS === 'web' ? { ...commonStyles, ...webStyles } : mobileStyles;
    return (
        <SafeAreaView
            style={finalStyles.container}>
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: "#f8f8f8",
                    borderRadius: 50,
                    paddingTop: 68,
                    shadowColor: "#0000001A",
                    shadowOpacity: 0.1,
                    shadowOffset: {
                        width: 0,
                        height: 20
                    },
                    shadowRadius: 104,
                    elevation: 104,
                }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 54,
                        marginHorizontal: 28,
                    }}>
                    <Image
                        source={{ uri: "https://i.imgur.com/1tMFzp8.png" }}
                        resizeMode={"stretch"}
                        style={{
                            width: 8,
                            height: 17,
                        }}
                    />
                    <Image
                        source={{ uri: "https://i.imgur.com/1tMFzp8.png" }}
                        resizeMode={"stretch"}
                        style={{
                            width: 29,
                            height: 29,
                        }}
                    />
                </View>
                <View
                    style={{
                        marginBottom: 40,
                        marginHorizontal: 24,
                    }}>
                    <View
                        style={{
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
                        }}>
                        <View
                            style={{
                                flex: 1,
                            }}>
                            <Text
                                style={{
                                    color: "#201a25",
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    marginBottom: 10,
                                    marginLeft: 1,
                                }}>
                                {"Lorem"}
                            </Text>
                            <Text
                                style={{
                                    color: "#c3c6c9",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    marginBottom: 15,
                                }}>
                                {"$225.00"}
                            </Text>
                            <Text
                                style={{
                                    color: "#201a25",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                }}>
                                {"Size: US 7"}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            position: "absolute",
                            bottom: -20,
                            right: -1,
                            width: 66,
                            height: 66,
                            backgroundColor: "#eef1f4",
                            borderRadius: 20,
                            paddingHorizontal: 20,
                        }}>
                        <Image
                            source={{ uri: "https://i.imgur.com/1tMFzp8.png" }}
                            resizeMode={"stretch"}
                            style={{
                                height: 4,
                                marginTop: 31,
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
