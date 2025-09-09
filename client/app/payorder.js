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
} from "react-native";
import { orderData } from "../app/Mock/CustomerHome";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { wp, hp, responsiveStyles } from "./styles/responsive";
const { width, height } = Dimensions.get("window");

export default function OrderSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderItems, setOrderItems] = useState(orderData);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load order data from parameters if available
  useEffect(() => {
    console.log("Params received:", params);
    console.log("Has order data flag:", params.hasOrderData);

    if (params.orderData && params.hasOrderData === "true") {
      try {
        const parsedOrderData = JSON.parse(params.orderData);
        console.log("Parsed order data:", parsedOrderData);

        // Validate and ensure proper data structure
        if (Array.isArray(parsedOrderData) && parsedOrderData.length > 0) {
          const validatedData = parsedOrderData.map((item, index) => ({
            id: item.id || index + 1,
            item: item.item || item.name || "Unknown Item",
            qty: parseInt(item.qty || item.quantity || 1),
            price: parseInt(item.price || 0),
            status: item.status || "Waiting",
          }));
          setOrderItems(validatedData);
        } else {
          console.log("Invalid order data structure, using default");
        }
      } catch (error) {
        console.error("Error parsing order data:", error);
        console.log("Using default order data due to error");
      }
    } else {
      console.log("No order data found, using default data");
    }
  }, [params.orderData, params.hasOrderData]);

  const totalAmount = orderItems.reduce((sum, item) => {
    const qty = parseInt(item.qty) || 0;
    const price = parseInt(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push({
        pathname: "/menu-list",
        params: {
          orderData: params.orderData,
          totalAmount: totalAmount.toString(),
        },
      }); // 👈 fallback route
    }
  };
  useEffect(() => {
    if (totalAmount == 0) {
      router.push({
        pathname: "/menu-list",
      }); //
    }
  }, [totalAmount]);

  const handleStarPress = (rating) => {
    setUserRating(rating);
    setHasRated(true);
  };

  const handleEditPress = (itemId) => {
    setEditingItem(editingItem === itemId ? null : itemId);
  };

  const handleQuantityChange = (itemId, change) => {
    setOrderItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId
          ? { ...item, qty: Math.max(0, item.qty + change) }
          : item
      );
      // Remove items with quantity 0
      return updatedItems.filter((item) => item.qty > 0);
    });
    // Don't close edit mode when changing quantity - only close on blur
  };
  return (
    <ScrollView
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
            <Text style={[styles.hcell, styles.editColumn]}></Text>
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
                {order.item}
              </Text>
              <Text style={[styles.cell, styles.qtyColumn]}>{order.qty}</Text>
              <Text style={[styles.cell, styles.priceColumn]}>
                {order.price}
              </Text>
              <Text style={[styles.cell, styles.totalColumn]}>
                {order.qty * order.price}
              </Text>
              {/* Edit icon or quantity controls */}
              <View style={styles.editColumn}>
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
              </View>
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
          <View style={styles.editColumn} />
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
                  color={star <= userRating ? "#FFD700" : "#DDD"}
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
        <TouchableOpacity style={[styles.payButton, responsiveStyles.bg1]}>
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#f2f0ff",
  //   padding: 16,
  // },
  contentWrapper: {
    flex: 1,
    marginTop: 30,
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
    fontSize: 22,
    fontWeight: "bold",
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
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f2f0ff",
//     padding: wp(20),
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: hp(16),
//     paddingTop: hp(8),
//   },
//   backButton: {
//     marginRight: wp(20),
//     padding: wp(8),
//   },
//   headerContent: {
//     flex: 1,
//     alignItems: "center",
//   },
//   headerTitle: {
//     ...responsiveStyles.headerText,
//     fontWeight: "bold",
//     textAlign: "center",
//     color: "#333",
//   },
//   tableHeader: {
//     flexDirection: "row",
//     paddingVertical: hp(8),
//     marginBottom: hp(4),
//     backgroundColor: "transparent",
//   },
//   tableRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: hp(8),
//     minHeight: hp(40),
//   },
//   hcell: {
//     ...responsiveStyles.bodyText,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   cell: {
//     ...responsiveStyles.bodyText,
//     color: "#333",
//   },
//   // Column styles for proper alignment
//   statusColumn: {
//     width: wp(60),
//     textAlign: "left",
//     paddingLeft: wp(4),
//   },
//   orderColumn: {
//     flex: 1,
//     paddingLeft: wp(8),
//     textAlign: "left",
//   },
//   qtyColumn: {
//     width: wp(40),
//     textAlign: "right",
//     paddingRight: wp(8),
//   },
//   priceColumn: {
//     width: wp(48),
//     textAlign: "right",
//     paddingRight: wp(8),
//   },
//   totalColumn: {
//     width: wp(60),
//     textAlign: "right",
//     paddingRight: wp(8),
//   },
//   editColumn: {
//     width: wp(48),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   quantityControls: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: wp(4),
//   },
//   quantityButton: {
//     width: wp(16),
//     height: wp(16),
//     borderRadius: wp(4),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   quantityButtonText: {
//     color: "#fff",
//     fontSize: wp(12),
//     fontWeight: "bold",
//   },
//   // Total row styles - matching image
//   totalRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: hp(8),
//     backgroundColor: "transparent",
//     marginTop: hp(4),
//   },
//   ratingSection: {
//     backgroundColor: "transparent",
//     padding: wp(20),
//     marginVertical: hp(24),
//   },
//   feedback: {
//     textAlign: "center",
//     marginBottom: hp(16),
//     fontSize: wp(20),
//     fontWeight: "500",
//     color: "#333",
//   },
//   stars: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: hp(8),
//   },
//   starButton: {
//     padding: wp(4),
//     marginHorizontal: wp(2),
//   },
//   stampContainer: {
//     position: "relative",
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: hp(40),
//     height: hp(160),
//   },
//   paidStamp: {
//     position: "absolute",
//     fontSize: wp(32),
//     fontWeight: "bold",
//     color: "#DC143C",
//     transform: [{ rotate: "-15deg" }],
//     textShadowColor: "rgba(0, 0, 0, 0.3)",
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 4,
//     letterSpacing: wp(2),
//     zIndex: 2,
//   },
//   thankYouText: {
//     position: "absolute",
//     fontSize: wp(48),
//     fontWeight: "300",
//     color: "rgba(0, 0, 0, 0.4)",
//     fontStyle: "italic",
//     transform: [{ rotate: "-15deg" }],
//     marginTop: hp(24),
//     marginLeft: wp(8),
//     zIndex: 1,
//   },
//   payButton: {
//     backgroundColor: "#6A5ACD",
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginBottom: 20,
//   },
//   tableContainer: {
//     marginTop: hp(16),
//     backgroundColor: "transparent",
//   },
//   payText: {
//     color: "#fff",
//     fontSize: wp(16),
//     fontWeight: "bold",
//   },
// });
