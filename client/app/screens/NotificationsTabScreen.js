import React from "react";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TabBar from "./TabBarScreen";

export default function NotificationsTabScreen() {
    // Reviews and Ratings mock data
  const reviews = [
    {
      hotelName: "Sai Hotel (3 Star Hotel)",
      description: "ssssssegegegwegg",
      rating: 5,
      status: "Excellent",
    },
    {
      hotelName: "Kamat Hotel",
      description: "asdafewqfewqc",
      rating: 5,
      status: "Excellent",
    },
    {
      hotelName: "Udupi Kitchen Hotel",
      description: "gafsvgregerqverqgrqegqergewg",
      rating: 5,
      status: "Excellent",
    },
  ];
  // Placeholder for Notifications tab UI
  return (
    <View style={styles.container}>
  <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <TouchableOpacity style={styles.filterIcon}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={24}
                color="#6c63b5"
              />
            </TouchableOpacity>
            <Text style={styles.reviewsTitle}>Reviews and Ratings</Text>
          </View>

          {/* Main Star */}
          <View style={styles.mainStarContainer}>
            <MaterialCommunityIcons
              name="star"
              size={80}
              color="#FFD700"
              style={styles.mainStar}
            />
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={styles.reviewHotelName}>{review.hotelName}</Text>
                </View>
                <Text style={styles.reviewDescription}>
                  {review.description}
                </Text>
                <View style={styles.reviewFooter}>
                  <View style={styles.reviewStars}>
                    {[...Array(review.rating)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name="star"
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewStatus}>{review.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <TabBar></TabBar>
      </View>
  );
}

  const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#a6a6e7',
          borderTopLeftRadius: 48,
          borderTopRightRadius: 48,
          paddingTop: 0,
          paddingBottom: 0,
        },
        reviewsContainer: {
          flex: 1,
          paddingHorizontal: 0,
          paddingTop: 0,
          backgroundColor: 'transparent',
        },
        reviewsHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 32,
          marginBottom: 12,
        },
        filterIcon: {
          position: 'absolute',
          left: 24,
          top: 0,
          padding: 8,
          zIndex: 2,
        },
        reviewsTitle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          textShadowColor: '#888',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        mainStarContainer: {
          alignItems: 'center',
          marginBottom: 12,
        },
        mainStar: {
          textShadowColor: '#888',
          textShadowOffset: { width: 4, height: 6 },
          textShadowRadius: 8,
        },
        reviewsList: {
          width: '100%',
          flex: 1,
        },
        reviewCard: {
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 0,
          borderBottomWidth: 2,
          borderColor: '#8883d8',
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 0,
          minHeight: 80,
          shadowColor: '#888',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        },
        reviewLeft: {
          alignItems: 'center',
          marginRight: 12,
          width: 48,
        },
        reviewHotelName: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#222',
          marginBottom: 2,
        },
        reviewDescription: {
          fontSize: 14,
          color: '#222',
          marginBottom: 6,
          lineHeight: 18,
        },
        reviewContent: {
          flex: 1,
          justifyContent: 'center',
        },
        reviewFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 2,
        },
        reviewStars: {
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 8,
          marginTop: 2,
          textShadowColor: '#888',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        reviewStatus: {
          fontSize: 15,
          color: '#222',
          fontWeight: 'bold',
          alignSelf: 'flex-end',
          marginLeft: 'auto',
        },
      });
