import React from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Sample dynamic data

const HotelDetails = () => {
  const router = useRouter();
  const hotelData = {
    name: "Hotel Sai",
    starRating: 3,
    address:
      "No 45 Brigade Plaze First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    options: [
      {
        icon: "book-outline",
        label: "Menu",
        onPress: () => router.push("/menu-list"), // ✅ function that will run on click
      },
      {
        icon: "restaurant-outline",
        label: "Booking table\n(3 TA)",
        onPress: Alert.alert("Booking Clicked"),
      },
      {
        icon: "time-outline",
        label: "Avg Waiting time.\n15Min",
        onPress: null,
      },
    ],
    reviews: [
      {
        reviewer: "Person 1",
        stars: 5,
        text: "One of the best Restaurant in Bangalore Highly Recommended",
      },
      {
        reviewer: "Person 2",
        stars: 5,
        text: "If you want to try Biriyani this the Best Place in Bangalore",
      },
      {
        reviewer: "Person 3",
        stars: 5,
        text: "Best ambiance to chill out with friends and Family. And Food is Great.",
      },
    ],
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Image */}
        <Image source={{ uri: hotelData.image }} style={styles.headerImage} />

        {/* Header Top: Back arrow + floating icons */}
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Ionicons name="share-social-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={styles.card}>
          <Text style={styles.hotelName}>
            {hotelData.name} ({hotelData.starRating} Star Hotel)
          </Text>
          <Text style={styles.address}>{hotelData.address}</Text>

          {/* Options */}
          {/* <View style={styles.optionsRow}>
            {hotelData.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={opt.onPress}
              >
                <Ionicons name={opt.icon} size={28} color="black" />
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View> */}
          <View style={styles.optionsRow}>
            {hotelData.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={opt.onPress}
              >
                <Ionicons name={opt.icon} size={28} color="black" />
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hotel Star Rating */}
          <View style={styles.ratingRow}>
            {[...Array(hotelData.starRating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={28} color="#FFD700" />
            ))}
          </View>
        </View>

        <View style={styles.borderContainer}></View>

        {/* Reviews */}
        {hotelData.reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="person-circle" size={22} color="black" />
              <View style={styles.reviewStars}>
                {[...Array(review.stars)].map((_, i) => (
                  <FontAwesome key={i} name="star" size={14} color="#FFD700" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HotelDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B9A7F6",
  },
  headerImage: {
    width: "100%",
    height: 220,
  },
  headerTop: {
    position: "absolute",
    top: 30,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  topIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconCircle: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  card: {
    padding: 12,
    backgroundColor: "#B9A7F6",
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 13,
    color: "#222",
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  option: {
    alignItems: "center",
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 4,
  },
  borderContainer: {
    borderBottomWidth: 1,
    borderColor: "black",
  },
  reviewCard: {
    backgroundColor: "#B9A7F6",
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    marginLeft: 8,
    gap: 2,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 13,
    color: "#111",
  },
});
