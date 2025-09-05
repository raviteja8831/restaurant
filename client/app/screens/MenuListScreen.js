import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { menuCategories, restaurantData } from "../Mock/CustomerHome";
import { LinearGradient } from "expo-linear-gradient";

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
  const [totalAmount, setTotalAmount] = useState();
  const [orderSummary, setOrderSummary] = useState({
   /*  totalItems: 3,
    totalCost: 855,
    orderDetails: [
      { name: "Coffee", quantity: 2, price: "₹50", total: "₹100" },
      { name: "Tomato Soup", quantity: 1, price: "₹80", total: "₹80" },
      { name: "Veg Biriyani", quantity: 1, price: "₹180", total: "₹180" },
    ], */
  });
  const [restaurant, setRestaurant] = useState(restaurantData);

  useEffect(() => {
    // Check if we're returning from an order
    if (params.totalItems && params.totalCost) {
      setOrderSummary({
        totalItems: parseInt(params.totalItems) || 0,
        totalCost: parseInt(params.totalCost) || 0,
        orderDetails: params.orderDetails
          ? JSON.parse(params.orderDetails)
          : [],
      });
      setTotalAmount(parseInt(params.totalCost));
    }
  }, [params.totalItems, params.totalCost, params.orderDetails]);

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/orderitems",
      params: {
        category: category.id,
        categoryName: category.name,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleFinalOrder = () => {
    // Transform order details to payorder format
    const orderData = orderSummary.orderDetails.map((item, index) => ({
      id: index + 1,
      item: item.name,
      qty: item.quantity,
      price: parseInt(item.price.replace("₹", "")),
      status: "Waiting", // Default status for new orders
    }));

    console.log('Order summary:', orderSummary);
    console.log('Transformed order data:', orderData);

    // Navigate to payorder screen with order data
    router.push({
      pathname: "/payorder",
      params: {
        orderData: JSON.stringify(orderData),
        totalAmount: orderSummary.totalCost.toString(),
        hasOrderData: "true",
      },
    });
  };

  return (
    // <LinearGradient
    //     colors={['rgba(232, 224, 255, 0.6)', 'rgba(180, 170, 240, 0.6)']}
    //     style={styles.gradientOverlay}
    //     start={{ x: 0, y: 0 }}
    //     end={{ x: 1, y: 1 }}
    //   >
    <ImageBackground
      source={require("../../assets/images/menu-bg.png")}
      style={styles.backgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.colorOverlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#000"
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.hotelName}>
                {restaurant.name} ({restaurant.type})
              </Text>
              <Text style={[styles.title, styles.rTopMenu, { top: 87 }]}>
                {" "}
                Menu
              </Text>
            </View>
          </View>

          {/* Menu Grid */}
          <View style={[styles.gridContainer, styles.rTopMenu, { top: 160 }]}>
            {menuCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.menuCard}
                onPress={() => handleCategoryPress(category)}
              >
                <Image
                  source={categoryImages[category.image]}
                  style={styles.categoryImage}
                  resizeMode="contain"
                />
                <Text style={styles.categoryLabel}>{category.name}</Text>
                <Text style={styles.itemCount}>({category.count} items)</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Total Amount */}
          <View style={[styles.totalContainer, styles.rTopMenu, { top: 750 }]}>
          
            {Object.keys(orderSummary).length > 0 && (
              <View style={styles.orderSummaryContainer}>
                <Text style={styles.totalText}>
                  Total Amount = ₹{totalAmount}/-
                </Text>
                {/*     <Text style={styles.orderSummaryText}>
                      Total Items: {orderSummary?.totalItems}
                    </Text> */}
                <TouchableOpacity
                  style={styles.finalOrderButton}
                  onPress={handleFinalOrder}
                >
                  <Text style={styles.finalOrderButtonText}>Final Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  colorOverlay: {
    flex: 1,
    backgroundColor: "BBBAEF", // Very light overlay to show image pattern clearly
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    position: "relative",
    paddingTop: 25,
  },
  backButton: {
    position: "absolute",
    top: 25,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    position: "relative",
  },
  hotelName: {
    position: "absolute",
    top: 25,
    left: 54,
    width: 342,
    height: 39,
    fontSize: 30,
    color: "#333",
    fontWeight: "500",
  },
  title: {
    position: "absolute",
    top: 140,
    left: 172,
    width: 95,
    height: 44,
    fontSize: 28,
    color: "#000",
    fontWeight: "bold",
  },
  gridContainer: {
    position: "absolute",
    top: 238,
    left: 51,
    width: 322,
    height: 617,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuCard: {
    width: (322 - 10) / 2,
    height: 130,
    backgroundColor: "transparent",
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: "transparent",
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 5,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  totalContainer: {
    position: "absolute",
    top: 885,
    left: 91,
    width: 258,
    // height: 29,
    alignItems: "center",
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    borderRadius: 15,
  },
  totalText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  orderSummaryContainer: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  orderSummaryText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginBottom: 10,
  },
  finalOrderButton: {
    backgroundColor: "#8C8AEB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 20,
  },
  finalOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
