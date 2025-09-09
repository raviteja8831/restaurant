import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { buffetsimescreenstyles } from "./styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import { buffetData } from "./Mock/CustomerHome";
const BuffetTimeScreen = () => {
  const params = useLocalSearchParams();
  const currentBuffet = buffetData[0];
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
    <SafeAreaView style={buffetsimescreenstyles.container}>
      <TouchableOpacity
        style={buffetsimescreenstyles.backButton}
        onPress={handleBack}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={buffetsimescreenstyles.scrollContainer}
      >
        {/* Header */}

        <Text style={buffetsimescreenstyles.header}>Buffet Time</Text>

        {/* Clock Image */}
        <View style={buffetsimescreenstyles.centerContent}>
          <Image
            source={require("../assets/images/hotel-buffet-time.png")} // replace with your clock image
            style={buffetsimescreenstyles.clock}
            resizeMode="contain"
          />
        </View>

        {/* Buffet Table Image */}
        <Image
          source={require("../assets/images/hotel-buffet-table.png")} // replace with your buffet image
          style={buffetsimescreenstyles.buffet}
          resizeMode="contain"
        />

        {/* Buffet Info */}
        <View style={buffetsimescreenstyles.buffetInfo}>
          <Text style={buffetsimescreenstyles.buffetTitle}>
            {currentBuffet.type}
          </Text>
          <Text style={buffetsimescreenstyles.buffetItems}>
            {currentBuffet.description}
          </Text>
        </View>

        {/* Price */}
        <Text style={buffetsimescreenstyles.price}>
          Buffet Price Per Person {currentBuffet.price} Rs
        </Text>

        {/* Pay Button */}
        <TouchableOpacity
          style={buffetsimescreenstyles.payButton}
          onPress={() => alert("Payment started!")}
        >
          <Text style={buffetsimescreenstyles.payText}>Pay</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuffetTimeScreen;
