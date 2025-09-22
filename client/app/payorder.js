import React, { useState, useEffect, use } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ScrollViewBase,
  ActivityIndicator,
  Alert,
} from "react-native";
// import { orderData } from "../app/Mock/CustomerHome";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { wp, hp, responsiveStyles } from "./styles/responsive";
import { addReview } from "./api/reviewsApi";
import {
  getOrderItemList,
  deleteOrder,
  updateOrderStatus,
} from "./api/orderApi";
import CommentModal from "./Modals/CommentModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserData } from "./services/getUserData";
const { width, height } = Dimensions.get("window");

export default function OrderSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [removedItems, setRemovedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [userId, setUserId] = useState(null);
  const { userId, error } = useUserData();

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }
  function router_call() {
    router.push({
      pathname: "/menu-list",
    });
  }
  const handleDeleteOrder = async (orderId) => {
    // alert("Are you sure you want to delete this order?");
    try {
      await deleteOrder(orderId);
      router_call();
    } catch (error) {
      console.error("Failed to delete order:", error);
      Alert.alert("Error", "Failed to delete order. Please try again.");
    }
  };
  // useEffect(() => {
  //   const initializeProfile = async () => {
  //     try {
  //       const userProfile = await AsyncStorage.getItem("user_profile");
  //       if (userProfile) {
  //         const user = JSON.parse(userProfile);
  //         console.log("User Profile:", user); // Debug log
  //         setUserId(user.id);
  //         // Only fetch profile data if we have a userId
  //         if (user.id) {
  //           await fetchProfileData(user.id);
  //         }
  //       } else {
  //         console.log("No user profile found");
  //         router.push("/customer-login");
  //       }
  //     } catch (error) {
  //       console.error("Error initializing profile:", error);
  //       // AlertService.error("Error loading profile");
  //     }
  //   };

  //   initializeProfile();
  // }, []);
  useEffect(() => {
    initializeData();
  }, [params.orderID, userId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      // First fetch the menu items
      const menuItems = await getOrderItemList(params.orderID, userId);

      setOrderItems(menuItems.orderItems || []);
      setOrderDetails(menuItems.order_details || {});
    } catch (error) {
      // AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (loading) {
      /*   return (
        <ActivityIndicator
          size="large"
          color="#6c63b5"
          style={{ marginTop: 20 }}
        />
      ); */
    }
  }, [loading]);
  useEffect(() => {
    setTotalAmount(
      orderItems.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0;
        const price = parseInt(item.price) || 0;
        return sum + qty * price;
      }, 0)
    );
  }, [orderItems]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router_call();
      // 👈 fallback route
    }
  };

  const handleStarPress = (rating) => {
    setUserRating(rating);
    setHasRated(true);
  };

  const handleEditPress = (itemId) => {
    setEditingItem(editingItem === itemId ? null : itemId);
  };

  const handleModalSubmit = async () => {
    if (params.orderID) {
      await handleDeleteOrder(params.orderID);
    }
    setIsModalOpen(false);
  };

  const handleSubmitAndPay = async () => {
    try {
      setLoading(true);
      const response = await updateOrderStatus(params.orderID, {
        status: "Completed",
        // Send updated quantities for remaining items
        updatedItems: orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        // Send removed items for deletion
        removedItems: removedItems.map((item) => ({
          id: item.id,
        })),
      });

      // Update the total amount and status from the response
      if (response.data && response.data.order) {
        setTotalAmount(response.data.order.totalAmount);
        // Update order items with new status
        const updatedItems = orderItems.map((item) => ({
          ...item,
          status: "Completed",
        }));
        setOrderItems(updatedItems);
        initializeData();
      }
      if (userRating > 0) {
        await addReview({
          userId: userId,
          restaurantId: orderDetails.restaurantId,
          rating: userRating,
          orderId: params.orderID,
        });
      }
      router.push({
        pathname: "/customer-home",
      });
    } catch (error) {
      console.error("Failed to process order:", error);
      // Alert.alert("Error", "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    // setIsModalOpen(false);
    setEditingItem(null); // Reset edit state to show pencil icon
    initializeData(); // Refresh the data
  };

  const handleQuantityChange = async (itemId, change) => {
    const updatedItems = orderItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    );

    // Find items that now have quantity 0
    const itemsToRemove = updatedItems.filter((item) => item.quantity === 0);
    if (itemsToRemove.length > 0) {
      setRemovedItems((prev) => [...prev, ...itemsToRemove]);
    }

    // Remove items with quantity 0
    const filteredItems = updatedItems.filter((item) => item.quantity > 0);

    // Calculate new total after filtering
    const newTotal = filteredItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Update the items first
    setOrderItems(filteredItems);

    // Then check if total is 0 and show modal
    if (newTotal === 0) {
      setIsModalOpen(true);
    }
  };
  useEffect(() => {
    console.log("Order summary:", removedItems);
  }, [removedItems]);
  return (
    <ScrollView
      style={{ backgroundColor: "#EBEBFF", padding: 15 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainScrollViewContent}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Order</Text>
          </View>
        </View>

        {/* Table Container */}
        <TouchableOpacity
          style={styles.tableContainer}
          activeOpacity={1}
          onPress={() => setEditingItem(null)}
        >
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.hcell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.hcell, styles.orderColumn]}>Order</Text>
            <Text style={[styles.hcell, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.hcell, styles.priceColumn]}>Price</Text>
            <Text style={[styles.hcell, styles.totalColumn]}>Total</Text>
            {/* <Text style={[styles.hcell, styles.editColumn]}></Text> */}
          </View>

          {/* Order Rows */}
          {orderItems.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <Text
                style={[
                  styles.cell,
                  styles.statusColumn,
                  order.status === "Served" && { color: "green" },
                  order.status === "Ready" && { color: "limegreen" },
                  order.status === "Preparing" && { color: "orange" },
                  order.status === "Waiting" && { color: "red" },
                ]}
              >
                {order.status}
              </Text>
              <Text style={[styles.cell, styles.orderColumn]}>
                {order.menuItemName}
              </Text>
              <Text style={[styles.cell, styles.qtyColumn]}>
                {order.quantity}
              </Text>
              <Text style={[styles.cell, styles.priceColumn]}>
                {order.price}
              </Text>
              <Text style={[styles.cell, styles.totalColumn]}>
                {order.quantity * order.price}
              </Text>
              {/* Edit icon or quantity controls */}
              {/*      <View style={styles.editColumn}>
                {editingItem === order.id ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, responsiveStyles.bg1]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(order.id, -1);
                      }}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(order.id, 1);
                      }}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditPress(order.id);
                    }}
                  >
                    <Feather name="edit-2" size={14} color="#000" />
                  </TouchableOpacity>
                )}
              </View> */}
            </View>
          ))}
        </TouchableOpacity>

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={[styles.cell, styles.statusColumn]} />
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.qtyColumn]} />
          <Text style={[styles.cell, styles.priceColumn]} />
          <Text style={[styles.cell, styles.totalColumn]}>{totalAmount}</Text>
          {/* <View style={styles.editColumn} /> */}
        </View>
        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.feedback}>
            Please Rate this Restaurant as a Feedback
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starButton}
              >
                <MaterialCommunityIcons
                  name={star <= userRating ? "star" : "star-outline"}
                  size={28}
                  color={star <= userRating ? "#FFD700" : "#240d0dff"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PAID Stamp */}
        <View style={styles.stampContainer}>
          {/* <Text style={styles.paidStamp}>PAID</Text> */}
          <Text style={styles.thankYouText}>Thank you!</Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, responsiveStyles.bg1]}
          onPress={handleSubmitAndPay}
        >
          <Text style={styles.payText}>Submit & Pay</Text>
        </TouchableOpacity>
        <CommentModal
          visible={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EBEBFF",
    padding: 15,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollViewContent: {
    flexGrow: 1,
    // paddingBottom: Math.min(height * 0.02, 16), // Reduced bottom padding
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
    // position: "relative",
  },
  backButton: {
    zIndex: 1,
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    // alignItems: "center",

    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    minHeight: 35,
  },
  hcell: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  cell: {
    fontSize: 14,
    color: "#333",
  },
  // Column styles for proper alignment
  statusColumn: {
    width: 70,
    textAlign: "left",
    paddingLeft: 4,
  },
  orderColumn: {
    flex: 1,
    paddingLeft: 8,
    textAlign: "left",
  },
  qtyColumn: {
    width: 50,
    textAlign: "right",
    paddingRight: 8,
  },
  priceColumn: {
    width: 60,
    textAlign: "right",
    paddingRight: 8,
  },
  totalColumn: {
    width: 70,
    textAlign: "right",
    paddingRight: 8,
  },
  editColumn: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quantityButton: {
    width: 20,
    height: 20,
    backgroundColor: "#8C8AEB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Total row styles - matching image
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
    marginTop: 5,
  },
  ratingSection: {
    backgroundColor: "transparent",
    padding: 20,
    marginVertical: 15,
  },
  feedback: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  stampContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    height: 120,
  },
  paidStamp: {
    position: "absolute",
    fontSize: 48,
    fontWeight: "bold",
    color: "#DC143C",
    transform: [{ rotate: "-15deg" }],
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
    zIndex: 2,
  },
  thankYouText: {
    position: "absolute",
    fontSize: 80,
    fontWeight: "300",
    color: "rgba(0, 0, 0, 0.4)",
    fontStyle: "italic",
    transform: [{ rotate: "-15deg" }],
    marginTop: 20,
    marginLeft: 10,
    zIndex: 1,
  },
  payButton: {
    // backgroundColor: "#8C8AEB",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginTop: "auto",
    width: 350,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tableContainer: {
    marginTop: 10,
    backgroundColor: "transparent",
  },

  payText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
