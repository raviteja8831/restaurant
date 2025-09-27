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
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

// PhonePe SDK import
import PhonePePaymentSDK from "react-native-phonepe-pg";
import UpiService from "./services/UpiService";
import { setApiAuthToken } from "./api/api";
import { getRestaurantById } from "./api/restaurantApi";

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
  const [paying, setPaying] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState({});

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
      params: {
        restaurantId: params.restaurantId || "",
        ishotel: params.ishotel,
      },
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
      /*  const response = await getRestaurantById(params.restaurantId);
      if (response) {
        setRestaurantDetails(response);
      } */
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

  // PhonePe SDK Payment integration
  const startPhonePePayment = async () => {
    if (totalAmount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Total amount must be greater than 0 to pay."
      );
      return;
    }

    setPaying(true);

    try {
      // Initialize PhonePe SDK
      // Use "SANDBOX" for testing or "PRODUCTION" for live
      const environment = "SANDBOX";

      // Replace with your actual PhonePe merchantId and appId
      const merchantId = "PGTESTPAYUAT";
      const appId = null; // can be null if not available

      // flowId could be user or order specific for tracking
      const flowId = userId ? userId.toString() : "flow";

      const initResult = await PhonePePaymentSDK.init(
        environment,
        merchantId,
        flowId,
        true // enable logging
      );

      console.log("PhonePe SDK Init Result: ", initResult);

      // Prepare transaction request
      // Generate transaction body and checksum from backend
      const transactionId = `TXN${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const paymentPayload = {
        merchantId: merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId?.toString() || "USER001",
        amount: totalAmount * 100, // PhonePe expects amount in paise
        mobileNumber: "9999999999", // Replace with actual user mobile
        callbackUrl: "https://webhook.site/callback-url",
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      // For testing, create a simple base64 encoded request
      const base64Payload = btoa(JSON.stringify(paymentPayload));
      const transactionRequestBody = base64Payload;

      // For testing, use a simple checksum (in production, this should come from your secure backend)
      const finalChecksum = `${base64Payload}###1`;

      // Call startTransaction on PhonePe SDK
      const response = await PhonePePaymentSDK.startTransaction(
        transactionRequestBody,
        checksum,
        Platform.OS === "android" ? "com.phonepe.app" : null,
        "yourapp" // your app schema for callback
      );

      console.log("Payment Response: ", response);

      if (response.status === "SUCCESS") {
        // Update order status in backend
        await updateOrderStatus(params.orderID, {
          status: "Completed",
          updatedItems: orderItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          totalAmount: totalAmount,
          removedItems: removedItems.map((item) => ({
            id: item.id,
          })),
          payment: {
            method: "PhonePe",
            txnId: response.txnId || "",
          },
        });

        // Submit review if rated
        if (userRating > 0) {
          await addReview({
            userId: userId,
            restaurantId: orderDetails.restaurantId,
            rating: userRating,
            orderId: params.orderID,
          });
        }

        Alert.alert("Payment Successful", "Payment completed successfully!");
        router.push({ pathname: "/customer-home" });
      } else if (response.status === "FAILURE") {
        Alert.alert("Payment Failed", "Payment failed or was declined.");
      } else if (response.status === "INTERRUPTED") {
        Alert.alert(
          "Payment Interrupted",
          "Payment was interrupted. Please try again."
        );
      }
    } catch (error) {
      console.error("PhonePe Payment Error:", error);
      Alert.alert(
        "Payment Error",
        "Could not complete payment. Ensure that PhonePe is installed or try again."
      );

      // As fallback for web or if SDK fails, use existing UPI intent (only on Android/iOS)
      if (Platform.OS !== "web") {
        payWithUPIFallback();
      }
    } finally {
      setPaying(false);
    }
  };

  // Fallback to existing UPI intent redirect for Android/iOS/web if SDK fails
  const payWithUPIFallback = async () => {
    const upiId = "8143575784@ybl"; // Static UPI ID - will be fetched from database later
    const receiverName =
      orderDetails.restaurantName || orderDetails.restaurant || "Restaurant";
    const amount = Number(totalAmount) || 0;

    if (amount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Total amount must be greater than 0 to pay."
      );
      return;
    }

    const txnRef = `TXN${Date.now()}`;

    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(receiverName)}&tr=${encodeURIComponent(
      txnRef
    )}&tn=${encodeURIComponent(
      "Payment for order " + (params.orderID || "")
    )}&am=${encodeURIComponent(amount.toString())}&cu=INR`;

    try {
      if (Platform.OS === "web") {
        // For web, show UPI details for manual payment
        Alert.alert(
          "Payment Details",
          `Please pay ₹${amount} to:\n\nUPI ID: ${upiId}\nAmount: ₹${amount}\nReference: ${txnRef}\n\nAfter payment, click 'Payment Completed' below.`,
          [
            {
              text: "Copy UPI ID",
              onPress: () => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(upiId);
                }
              },
            },
            {
              text: "Payment Completed",
              onPress: async () => {
                // Handle payment completion
                await handleWebPaymentComplete(txnRef, upiId, amount);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return;
      }

      const supported = await Linking.canOpenURL(upiUrl);
      if (!supported) {
        Alert.alert(
          "No UPI App",
          "No UPI app found. Please install a UPI app like PhonePe or Google Pay to continue."
        );
        return;
      }

      await Linking.openURL(upiUrl);

      // Show payment initiated message
      Alert.alert(
        "Payment Initiated",
        "Please complete the payment in your UPI app and return to this screen.",
        [
          {
            text: "Payment Completed",
            onPress: async () => {
              try {
                // Update order status
                await updateOrderStatus(params.orderID, {
                  status: "Completed",
                  updatedItems: orderItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                  })),
                  totalAmount: totalAmount,
                  removedItems: removedItems.map((item) => ({
                    id: item.id,
                  })),
                  payment: {
                    method: "UPI",
                    txnId: txnRef,
                    upiId: upiId,
                  },
                });

                // Submit review if rated
                if (userRating > 0) {
                  await addReview({
                    userId: userId,
                    restaurantId: orderDetails.restaurantId,
                    rating: userRating,
                    orderId: params.orderID,
                  });
                }

                Alert.alert("Success", "Payment completed successfully!");
                router.push({ pathname: "/customer-home" });
              } catch (error) {
                console.error("Error updating order:", error);
                Alert.alert("Error", "Failed to update order status.");
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (err) {
      console.error("UPI Intent Error:", err);
      Alert.alert("Payment Error", "Cannot open UPI app.");
    }
  };

  // Handle payment completion for web platform
  const handleWebPaymentComplete = async (txnRef, upiId, amount) => {
    try {
      setPaying(true);

      // Update order status
      await updateOrderStatus(params.orderID, {
        status: "Completed",
        updatedItems: orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        removedItems: removedItems.map((item) => ({
          id: item.id,
        })),
        payment: {
          method: "UPI",
          txnId: txnRef,
          upiId: upiId,
        },
      });

      // Submit review if rated
      if (userRating > 0) {
        await addReview({
          userId: userId,
          restaurantId: orderDetails.restaurantId,
          rating: userRating,
          orderId: params.orderID,
        });
      }

      Alert.alert("Success", "Payment completed successfully!");
      router.push({ pathname: "/customer-home" });
    } catch (error) {
      console.error("Error updating order:", error);
      Alert.alert("Error", "Failed to update order status.");
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitAndPay = async () => {
    i;
    if (totalAmount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Total amount must be greater than 0 to pay."
      );
      return;
    }
    if (totalAmount <= 30) {
      setTotalAmount(totalAmount + 1); // Minimum order amount is 30
    } else if (totalAmount > 30) {
      setTotalAmount(totalAmount + 3); // Minimum order amount is 30
    }
    const result = await UpiService.initiatePayment({
      restaurantId: params.restaurantId,
      name: "Menutha Payment",
      amount: totalAmount,
      transactionRef: "",
    });
    console.log("UPI Payment Result:", result);
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

  const handleModalClose = () => {
    setEditingItem(null);
    initializeData();
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
                  order.status == 1 && { color: "#F4962A" },
                  order.status == 2 && { color: "#F4EE2A" },
                  order.status == 3 && { color: "#2AF441" },
                  order.status == 4 && { color: "#809782" },
                ]}
              >
                {order.statusText}
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
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Submit & Pay</Text>
          )}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
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
    backgroundColor: "#8C8AEB",
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
  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
