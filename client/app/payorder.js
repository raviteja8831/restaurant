import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getOrderItemList,
  deleteOrder,
  updateOrderStatus,
} from "./api/orderApi";
import { addReview } from "./api/reviewsApi";
import CommentModal from "./Modals/CommentModal";
import { useUserData } from "./services/getUserData";
import * as Linking from "expo-linking";

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

  // UTR modal state
  const [showUTRModal, setShowUTRModal] = useState(false);
  const [paymentUTR, setPaymentUTR] = useState("");
  const [paying, setPaying] = useState(false);

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
    try {
      await deleteOrder(orderId);
      router_call();
    } catch (error) {
      console.error("Failed to delete order:", error);
      Alert.alert("Error", "Failed to delete order. Please try again.");
    }
  };

  useEffect(() => {
    initializeData();
  }, [params.orderID, userId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      const menuItems = await getOrderItemList(params.orderID, userId);
      setOrderItems(menuItems.orderItems || []);
      setOrderDetails(menuItems.order_details || {});
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // NEW: Build UPI intent and open UPI app
  const payWithUPI = async () => {
    // Use UPI ID and name from orderDetails if available; otherwise fallback.
    const upiId = orderDetails.upiId || orderDetails.restaurantUpi || "receiver@upi";
    const receiverName = orderDetails.restaurantName || orderDetails.restaurant || "Receiver";
    const amount = Number(totalAmount) || 0;

    if (amount <= 0) {
      Alert.alert("Invalid amount", "Total amount must be greater than 0 to pay.");
      return;
    }

    // Create unique transaction reference
    const txnRef = `TXN${Date.now()}`;

    // Build UPI URI (common format)
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(receiverName)}&tr=${encodeURIComponent(
      txnRef
    )}&tn=${encodeURIComponent("Payment for order " + (params.orderID || ""))}&am=${encodeURIComponent(
      amount.toString()
    )}&cu=INR`;

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (!supported) {
        // On iOS canOpenURL might return false for custom schemes if not allowed.
        // Try fallback of using "https://pay.google.com/..."? But generally we alert the user.
        Alert.alert(
          "No UPI App",
          "No UPI app found or cannot open UPI on this device. Please install a UPI app (Google Pay, PhonePe, Paytm) and try again."
        );
        return;
      }

      // Open the UPI URL. This will switch user to their UPI app.
      await Linking.openURL(upiUrl);

      // After opening UPI app, show modal to collect UTR/Txn ID from user (manual verification)
      setShowUTRModal(true);
    } catch (err) {
      console.error("Error launching UPI app:", err);
      Alert.alert(
        "Payment Error",
        "Could not open UPI app. Please ensure you have a UPI app installed."
      );
    }
  };

  // NEW: Called when user submits UTR in modal
  const handleVerifyAndComplete = async () => {
    if (!paymentUTR || paymentUTR.trim().length === 0) {
      Alert.alert("Missing Transaction ID", "Please enter the transaction/UTR ID from your UPI app.");
      return;
    }
    try {
      setPaying(true);

      // Call your existing updateOrderStatus to mark Completed and pass payments details
      const response = await updateOrderStatus(params.orderID, {
        status: "Completed",
        updatedItems: orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        removedItems: removedItems.map((item) => ({
          id: item.id,
        })),
        // You may pass the txn id so backend can log it
        payment: {
          method: "UPI",
          txnId: paymentUTR,
        },
      });

      // Optionally update client state based on response
      if (response?.data?.order) {
        setTotalAmount(response.data.order.totalAmount || totalAmount);
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

      setShowUTRModal(false);
      setPaymentUTR("");
      router.push({
        pathname: "/customer-home",
      });
    } catch (err) {
      console.error("Failed to verify payment / complete order:", err);
      Alert.alert("Error", "Failed to complete order. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitAndPay = async () => {
    // Instead of directly marking order Completed, start UPI flow
    await payWithUPI();
  };

  const handleModalClose = () => {
    setEditingItem(null);
    initializeData();
  };

  const handleQuantityChange = async (itemId, change) => {
    const updatedItems = orderItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    );

    const itemsToRemove = updatedItems.filter((item) => item.quantity === 0);
    if (itemsToRemove.length > 0) {
      setRemovedItems((prev) => [...prev, ...itemsToRemove]);
    }

    const filteredItems = updatedItems.filter((item) => item.quantity > 0);

    const newTotal = filteredItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    setOrderItems(filteredItems);

    if (newTotal === 0) {
      setIsModalOpen(true);
    }
  };

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

        <TouchableOpacity
          style={styles.tableContainer}
          activeOpacity={1}
          onPress={() => setEditingItem(null)}
        >
          <View style={styles.tableHeader}>
            <Text style={[styles.hcell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.hcell, styles.orderColumn]}>Order</Text>
            <Text style={[styles.hcell, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.hcell, styles.priceColumn]}>Price</Text>
            <Text style={[styles.hcell, styles.totalColumn]}>Total</Text>
          </View>

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
            </View>
          ))}
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={[styles.cell, styles.statusColumn]} />
          <Text style={[styles.cell, styles.orderColumn]}>Total</Text>
          <Text style={[styles.cell, styles.qtyColumn]} />
          <Text style={[styles.cell, styles.priceColumn]} />
          <Text style={[styles.cell, styles.totalColumn]}>{totalAmount}</Text>
        </View>

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

        <View style={styles.stampContainer}>
          <Text style={styles.thankYouText}>Thank you!</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton]}
          onPress={handleSubmitAndPay}
        >
          <Text style={styles.payText}>Submit & Pay</Text>
        </TouchableOpacity>

        <CommentModal
          visible={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />

        {/* UTR / Transaction ID Modal */}
        <Modal
          visible={showUTRModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUTRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.utrModal}>
              <Text style={styles.modalTitle}>Enter Transaction ID</Text>
              <Text style={styles.modalSubtitle}>
                After completing the payment in your UPI app, paste/type the
                transaction ID / UTR here to confirm payment.
              </Text>
              <TextInput
                placeholder="Enter UPI Transaction ID (UTR)"
                value={paymentUTR}
                onChangeText={setPaymentUTR}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={Platform.OS === "ios" ? "default" : "visible-password"}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowUTRModal(false);
                    setPaymentUTR("");
                  }}
                  disabled={paying}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleVerifyAndComplete}
                  disabled={paying}
                >
                  {paying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Verify & Complete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
