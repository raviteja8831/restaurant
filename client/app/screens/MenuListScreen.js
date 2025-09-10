import React, { useState, useEffect, use } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { restaurantData } from "../Mock/CustomerHome";
import { LinearGradient } from "expo-linear-gradient";
import { menuliststyles, responsiveStyles } from "../styles/responsive";
import { getMenusWithItems } from "../api/menuApi";
import { AlertService } from "../services/alert.service";
import { getOrderItemCount } from "../api/orderApi";
import { getRestaurantById } from "../api/restaurantApi";

// Image mapping object
const categoryImages = {
  "bevereage.png": require("../../assets/images/bevereage.png"),
  "soup.png": require("../../assets/images/soup.png"),
  "breakfast.png": require("../../assets/images/breakfast.png"),
  "staters.png": require("../../assets/images/staters.png"),
  "indian-bread.png": require("../../assets/images/indian-bread.png"),
  "main-course.png": require("../../assets/images/main-course.png"),
  "salads.png": require("../../assets/images/salads.png"),
  "ice-cream-sesserts.png": require("../../assets/images/ice-cream-sesserts.png"),
};

const { width, height } = Dimensions.get("window");

export default function MenuListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [hoteldetails, setHoteldetails] = useState(false);
  const [restaurant, setRestaurant] = useState({});
  const [isbuffet, setIsBuffet] = useState(false);

  const [totalAmount, setTotalAmount] = useState();
  const [menuCategories, setMenuCategories] = useState();
  const [orderSummary, setOrderSummary] = useState({});
  useFocusEffect(
    React.useCallback(() => {
      // This will run when the screen comes into focus
      fetchselectedOrderCount();
      fetchMenuData();
    }, [])
  );
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      restaurant.id = 1;
      const response = await getMenusWithItems(restaurant.id);
      console.log("Fetched menu data:", response);
      setMenuCategories(response);
    } catch (error) {
      AlertService.error(error);
      console.error("Error fetching menu data:", error);
    } finally {
      console.log("Finished fetching menu data");
      setLoading(false);
    }
  };
  const fetchselectedOrderCount = async () => {
    try {
      setLoading(true);
      restaurant.id = 1;
      const response = await getOrderItemCount(
        restaurant.id,
        params.userId || 1
      );
      console.log("Fetched order item count:", response);
      setOrderSummary((prev) => ({
        ...prev,
        totalItems: response.totalOrders,
        totalCost: response.totalOrdersAmount,
        orderId: response.orderId,
      }));
    } catch (error) {
      AlertService.error(error);
      console.error("Error fetching order item count:", error);
    } finally {
      console.log("Finished fetching order item count");
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("Updated order summary:", isbuffet);
  }, [isbuffet]);
  const ishotel = params.ishotel || "false";
  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/orderitems",
      params: {
        category: category.id,
        categoryName: category.name,
        restaurantId: restaurant.id,
        userId: params.userId || 1,
        orderID: orderSummary.orderId || null,
        ishotel: ishotel,
      },
    });
  };
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        params.hotelId = params.hotelId || 1;
        const response = await getRestaurantById(params.hotelId);
        setIsBuffet(response.enableBuffet);
        setRestaurant(response);
        console.log("Fetched bff data:", response);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        AlertService.error("Failed to load restaurant details");
      }
    };

    fetchRestaurantData(); // Call the function here
  }, [params.hotelId]);

  const handleBackPress = () => {
    if (ishotel == "false") {
      router.push({ pathname: "/customer-home" });
    } else {
      router.push({
        pathname: "/HotelDetails",
        params: { id: params.hotelId },
      });
    }
  };

  const handleFinalOrder = () => {
    /*  const orderData = orderSummary.orderDetails.map((item, index) => ({
      id: index + 1,
      item: item.name,
      qty: item.quantity,
      price: parseInt(item.price),
      status: "Waiting",
    })); */
    router.push({
      pathname: "/payorder",
      params: {
        orderID: orderSummary.orderId,
        userId: params.userId || 1,
      },
    });
  };
  useEffect(() => {
    if (loading) {
      /* return (
        <ActivityIndicator
          size="large"
          color="#6c63b5"
          style={{ marginTop: 20 }}
        />
      ); */
    }
  }, [loading]);

  return (
    // <LinearGradient
    //     colors={['rgba(232, 224, 255, 0.6)', 'rgba(180, 170, 240, 0.6)']}
    //     style={menuliststyles.gradientOverlay}
    //     start={{ x: 0, y: 0 }}
    //     end={{ x: 1, y: 1 }}
    //   >

    <ImageBackground
      source={require("../../assets/images/menu-bg.png")}
      style={menuliststyles.backgroundImage}
      resizeMode="repeat"
    >
      <View style={menuliststyles.container}>
        <SafeAreaView style={menuliststyles.safeArea}>
          {/* Back Button - Outside ScrollView */}
          <TouchableOpacity
            style={menuliststyles.backButton}
            onPress={() => handleBackPress(ishotel)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>

          <ScrollView
            style={menuliststyles.mainScrollView}
            contentContainerStyle={menuliststyles.mainScrollViewContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          >
            {/* Header */}
            <View
              style={[
                menuliststyles.header,
                { marginTop: Math.min(height * 0.05, 40) },
              ]}
            >
              <View style={menuliststyles.headerContent}>
                <Text style={menuliststyles.hotelName}>
                  {restaurant.name}{" "}
                  {restaurant.restaurantType &&
                    `(${restaurant.restaurantType})`}
                </Text>
                <Text style={menuliststyles.title}>Menu</Text>
              </View>
            </View>
            {/* Menu Grid */}
            <View style={menuliststyles.gridContainer}>
              {menuCategories?.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={menuliststyles.menuCard}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Image
                    source={categoryImages[category.icon]}
                    style={menuliststyles.categoryImage}
                    resizeMode="contain"
                  />
                  <Text style={menuliststyles.name}>{category.name}</Text>
                  <Text style={menuliststyles.itemCount}>
                    ({category.menuItems.length} items)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Spacing View */}
            {/* <View style={{ height: 20 }} /> */}
            {/* Buffet Option */}
            {isbuffet}
            {ishotel == "true" && isbuffet && (
              <View style={menuliststyles.buffetSection}>
                <TouchableOpacity
                  style={[menuliststyles.buffetButton, responsiveStyles.bg1]}
                  onPress={() => {
                    router.push({
                      pathname: "/BuffetTimeScreen",
                      params: {
                        hotelName: params.hotelName || restaurant.name,
                        hotelId: params.hotelId || restaurant.id,
                        ishotel: params.ishotel,
                      },
                    });
                  }}
                >
                  <Text style={menuliststyles.buffetText}>
                    Buffet Available
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Total Amount */}
            {ishotel == "false" &&
              Object.keys(orderSummary).length > 0 &&
              orderSummary.totalItems > 0 && (
                <View style={menuliststyles.totalSection}>
                  <View style={menuliststyles.totalContainer}>
                    <Text style={menuliststyles.totalText}>
                      Total Amount = ₹{orderSummary.totalCost}/-
                    </Text>
                    <TouchableOpacity
                      style={[
                        menuliststyles.finalOrderButton,
                        responsiveStyles.bg1,
                      ]}
                      onPress={handleFinalOrder}
                    >
                      <Text style={menuliststyles.finalOrderButtonText}>
                        Final Order
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
    // </LinearGradient>
  );
}
