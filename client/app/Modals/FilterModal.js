import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CustomerHome } from "../Mock/CustomerHome";

const { height } = Dimensions.get("window");

export default function FilterModal({ visible, onClose, onFilterSelect }) {
  const filterOptions = CustomerHome;

  const handleFilterOptionPress = (option) => {
    onFilterSelect?.(option);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* full background click area */}
      <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />

      {/* popup */}
      <View style={styles.filterContent}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.filterList}
          showsVerticalScrollIndicator={false}
        >
          {filterOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.filterOption}
              onPress={() => handleFilterOptionPress(option)}
            >
              <Text style={styles.filterOptionText}>
                {option.name} ({option.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    zIndex: 2,
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterContent: {
    marginTop: 70,
    backgroundColor: "#BBBAEF",
    borderRadius: 20,
    padding: 20,
    width: "50%",
    height: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    left: 20,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 28,
  },
  filterList: {
    flex: 1,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#000",
    textAlign: "left",
  },
});
