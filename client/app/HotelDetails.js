import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
// import Tooltip from "react-native-walkthrough-tooltip";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { hotelDetailsData } from "./Mock/CustomerHome";
import { hoteldetailsstyles, responsiveStyles } from "./styles/responsive";

const HotelDetails = () => {
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(-1);

  const handleBackPress = () => {
    /*    if (router.canGoBack()) {
      router.back();
    } else { */
    router.push({ pathname: "/customer-home" });
    //}
  };

  // Using the first hotel from mock data
  const hotelData = hotelDetailsData[0];

  const handleOptionPress = (option) => {
    if (option.route) {
      router.push({
        pathname: option.route,
        params: {
          hotelName: hotelData.name,
          hotelId: hotelData.id,
          ishotel: true,
        },
      });
    } else if (option.label.includes("Booking")) {
      Alert.alert("Booking", "Table booking feature coming soon!");
    }
  };
  return (
    <SafeAreaView style={hoteldetailsstyles.container}>
      <ScrollView>
        {/* Header Image */}
        <Image
          source={{ uri: hotelData.image }}
          style={hoteldetailsstyles.headerImage}
        />

        {/* Header Top: Back arrow + floating icons */}
        <View style={hoteldetailsstyles.headerTop}>
          <TouchableOpacity
            style={hoteldetailsstyles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={hoteldetailsstyles.topIcons}>
            <TouchableOpacity style={hoteldetailsstyles.iconCircle}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={hoteldetailsstyles.iconCircle}>
              <Ionicons name="share-social-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={hoteldetailsstyles.card}>
          <Text style={hoteldetailsstyles.hotelName}>
            {hotelData.name} ({hotelData.starRating} Star Hotel)
          </Text>
          <Text style={hoteldetailsstyles.address}>{hotelData.address}</Text>

          {/* Options */}
          <View style={hoteldetailsstyles.optionsRow}>
            {hotelData.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={hoteldetailsstyles.option}
                onPress={() => handleOptionPress(opt)}
              >
                <Ionicons name={opt.icon} size={28} color="black" />
                <Text style={hoteldetailsstyles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hotel Star Rating */}
          <View style={hoteldetailsstyles.ratingRow}>
            {[...Array(hotelData.starRating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={28} color="#FFD700" />
            ))}
          </View>
        </View>

        <View style={hoteldetailsstyles.borderContainer}></View>

        {/* Reviews */}
        {hotelData.reviews.map((review, index) => (
          <View key={index} style={hoteldetailsstyles.reviewCard}>
            <View style={hoteldetailsstyles.reviewHeader}>
              <Ionicons name="person-circle" size={22} color="black" />
              <View style={hoteldetailsstyles.reviewStars}>
                {[...Array(review.stars)].map((_, i) => (
                  <FontAwesome key={i} name="star" size={14} color="#FFD700" />
                ))}
              </View>
            </View>
            {/*  <Tooltip
              isVisible={tooltipVisible === index}
              content={
                <Text style={hoteldetailsstyles.tooltipText}>
                  {review.text}
                </Text>
              }
              placement="top"
              onClose={() => setTooltipVisible(-1)}
              contentStyle={hoteldetailsstyles.tooltipContent}
            >
              <TouchableOpacity
                onMouseEnter={() => setTooltipVisible(index)}
                onMouseLeave={() => setTooltipVisible(-1)}
                activeOpacity={0.7}
              >
                <Text
                  style={hoteldetailsstyles.reviewText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {review.text}
                </Text>
              </TouchableOpacity>
            </Tooltip> */}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HotelDetails;
