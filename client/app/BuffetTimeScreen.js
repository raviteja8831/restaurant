import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buffetData } from "./Mock/CustomerHome";
import { router, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

const BuffetTimeScreen = () => {
  // Get the params passed from MenuListScreen
  const params = useLocalSearchParams();

  // Using the first buffet (breakfast) from the mock data
  const currentBuffet = buffetData[0];

  const handlePay = () => {
    Alert.alert("Payment", `Proceeding to pay ${currentBuffet.price} Rs.`);
  };

  const handleBack = () => {
    router.push({
      pathname: "/menu-list",
      params: {
        hotelName: params.hotelName,
        hotelId: params.hotelId,
        ishotel: params.ishotel,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buffet Time</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Clock */}
      <Image
        source={require("../assets/images/hotel-buffet-time.png")}
        style={styles.clockImage}
      />

      {/* Buffet Table */}
      <Image
        source={require("../assets/images/hotel-buffet-table.png")}
        style={styles.buffetImage}
      />

      {/* Buffet Info */}
      <View style={{ height: 12 }} />
      <Text style={styles.buffetType}>{currentBuffet.type}</Text>
      <Text style={styles.buffetDescription}>{currentBuffet.description}</Text>
      <Text style={styles.buffetPrice}>
        Buffet Price Per Person {currentBuffet.price} Rs
      </Text>

      {/* Pay Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Pay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E7FF",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  clockImage: {
    width: width * 0.9,
    height: width * 0.9,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20, // reduced margin
  },
  buffetImage: {
    width: 132,
    height: 132,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10, // reduced margin
    opacity: 1,
    transform: [{ rotate: "0deg" }],
  },
  buffetType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    marginBottom: 6, // reduced margin
  },
  buffetDescription: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 15, // reduced margin
  },
  buffetPrice: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 20,
    letterSpacing: 0,
  },
  buffetTime: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 30,
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFF",
  },
});

export default BuffetTimeScreen;
