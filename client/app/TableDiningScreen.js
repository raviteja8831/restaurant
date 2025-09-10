import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

const TableDiningScreen = () => {
  const params = useLocalSearchParams();
  const [tableCount, setTableCount] = useState(1);

  const handleBack = () => {
    router.push({
      pathname: "/HotelDetails",
      params: {
        // hotelName: params.hotelName,
        id: params.hotelId,
        // ishotel: params.ishotel,
      },
    });
  };

  const handlePay = () => {
    Alert.alert(
      "Confirm Reservation",
      `Reserve ${tableCount} table(s) for ₹${tableCount * 50}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay",
          onPress: () => Alert.alert("Success", "Table reserved successfully!"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Table Dining</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Table Image */}
      <Image
        source={require("../assets/images/hotel-dining-table.png")}
        style={styles.tableImage}
      />

      {/* Table Counter */}
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setTableCount(Math.max(1, tableCount - 1))}
        >
          <Image
            source={require("../assets/images/left-arrow.png")}
            style={styles.arrowImage}
          />
        </TouchableOpacity>

        <View style={styles.counterTextContainer}>
          <Text style={styles.counterNumber}>{tableCount}</Text>
          <Text style={styles.tableText}>Table</Text>
        </View>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setTableCount(tableCount + 1)}
        >
          <Image
            source={require("../assets/images/left-arrow.png")}
            style={[styles.arrowImage, styles.rightArrow]}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Info Container */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.reservationText}>
            Each Table will cost 50 Rs{"\n"}to Reserve
          </Text>
          <Text style={styles.disclaimerText}>(Once Reserved No Refund)</Text>
          <Text style={styles.autoCancelText}>
            (Automatic it will cancel after 45 Min)
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E7FF",
    paddingHorizontal: width * 0.05,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
    paddingTop: height * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  tableImage: {
    width: width * 0.85,
    height: height * 0.28,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: height * 0.02,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: height * 0.04,
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.1,
  },
  counterButton: {
    width: width * 0.12,
    height: width * 0.12,
    alignItems: "center",
    justifyContent: "center",
  },
  counterTextContainer: {
    alignItems: "center",
    width: width * 0.3,
  },
  counterNumber: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: "bold",
    color: "#000",
  },
  tableText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    marginTop: height * 0.01,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: width * 0.05,
    paddingBottom: height * 0.03,
  },
  bottomTextContainer: {
    marginBottom: height * 0.02,
  },
  reservationText: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.015,
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "red",
    textAlign: "center",
    marginBottom: height * 0.01,
  },
  autoCancelText: {
    fontSize: Math.min(width * 0.035, 14),
    color: "#000",
    textAlign: "center",
    marginBottom: height * 0.015,
  },
  payButton: {
    width: width * 0.9,
    height: height * 0.07,
    backgroundColor: "#6C63FF",
    borderRadius: width * 0.025,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: height * 0.02,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: "600",
  },
  arrowImage: {
    width: width * 0.08,
    height: width * 0.08,
    resizeMode: "contain",
  },
  rightArrow: {
    transform: [{ rotate: "-180deg" }],
  },
});

export default TableDiningScreen;
