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
import { useLocalSearchParams, useRouter } from "expo-router";
import { hotelDetailsData } from "./Mock/CustomerHome";
import { hoteldetailsstyles, responsiveStyles } from "./styles/responsive";
import { useEffect } from "react";
import { getRestaurantById } from "./api/restaurantApi";

const HotelDetails = () => {
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(-1);
  const params = useLocalSearchParams();
  const [hotelData, setHotelData] = useState(null);
  const handleBackPress = () => {
    router.push({ pathname: "/customer-home" });
  };
  const options = [
    {
      icon: "book-outline",
      label: "Menu",
      route: "/menu-list",
    },
    {
      icon: "restaurant-outline",
      label: "Booking table\n(3 TA)",
      route: "/TableDiningScreen",
    },
    {
      icon: "time-outline",
      label: "Avg Waiting time.\n15Min",
    },
  ];
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        if (params.id) {
          const data = await getRestaurantById(params.id);
          console.log("Fetched restaurant data:", data);
          setHotelData(data);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        Alert.alert("Error", "Failed to load restaurant details");
      }
    };

    fetchRestaurantData();
  }, [params.id]);

  // Using the first hotel from mock data
  // const hotelData = hotelDetailsData[0];

  const handleOptionPress = (option) => {
    if (option.route) {
      router.push({
        pathname: option.route,
        params: {
          // hotelName: hotelData.name,
          hotelId: hotelData.id,
          ishotel: true,
          // isbuffet: hotelData.enableBuffet,
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
        {hotelData?.logoImage && (
          <Image
            source={{ uri: hotelData?.logoImage }}
            style={hoteldetailsstyles.headerImage}
            defaultSource={require("../assets/images/logo.png")}
          />
        )}

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
            {hotelData?.name} ({hotelData?.starRating} Star Hotel)
          </Text>
          <Text style={hoteldetailsstyles.address}>{hotelData?.address}</Text>

          {/* Options */}
          <View style={hoteldetailsstyles.optionsRow}>
            {options?.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={hoteldetailsstyles.option}
                onPress={() => handleOptionPress(opt)}
              >
                <Ionicons name={opt.icon} size={28} color="black" />
                <Text style={hoteldetailsstyles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            )) || []}
          </View>

          {/* Hotel Star Rating */}
          <View style={hoteldetailsstyles.ratingRow}>
            {[...Array(hotelData?.starRating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={28} color="#FFD700" />
            ))}
          </View>
        </View>

        <View style={hoteldetailsstyles.borderContainer}></View>

        {/* Reviews */}
        {hotelData?.restaurantReviews?.map((review, index) => (
          <View key={index} style={hoteldetailsstyles.reviewCard}>
            <View style={hoteldetailsstyles.reviewHeader}>
              <Ionicons name="person-circle" size={22} color="black" />
              <View style={hoteldetailsstyles.reviewStars}>
                {[...Array(review.rating || 0)].map((_, i) => (
                  <FontAwesome key={i} name="star" size={14} color="#FFD700" />
                ))}
              </View>
              {/* <Text style={hoteldetailsstyles.reviewText}>{review.review}</Text> */}
              {/*  <Text style={hoteldetailsstyles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text> */}
            </View>
            {review.review && (
              <View /* style={hoteldetailsstyles.reviewContent} */>
                <Text style={hoteldetailsstyles.reviewText}>
                  {review.review}
                </Text>
                <Text style={hoteldetailsstyles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {/*   {review.review && (
              <View style={hoteldetailsstyles.reviewContent}>
                <Text style={hoteldetailsstyles.reviewText}>
                  {review.review}
                </Text>
                <Text style={hoteldetailsstyles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )} */}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HotelDetails;
