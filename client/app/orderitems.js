import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  ImageBackground,
} from "react-native";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { menuItemsData } from "./Mock/CustomerHome";
import CommentModal from "./Modals/menueditModal"; // 👈 new component

export default function ItemsListScreen() {
  const router = useRouter();
  const { category, categoryName, ishotel } = useLocalSearchParams();
  console.log("ghgsd", useLocalSearchParams());

  // ✅ Initialize items state from menuItemsData
  const [items, setItems] = useState(
    menuItemsData.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        selected: false,
        quantity: 0,
        comment: "", // 👈 added comment field
      })),
    }))
  );

  const [selectedItems, setSelectedItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");

  // ✅ Handle checkbox toggle
  const handleItemSelect = (itemId) => {
    setItems((prevData) =>
      prevData.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                selected: !item.selected,
                quantity: item.selected ? 0 : 1,
              }
            : item
        ),
      }))
    );
  };

  // ✅ Handle edit
  const handleEdit = (itemId) => {
    let foundItem = null;
    setItems((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === itemId) {
            foundItem = {
              ...item,
              selected: true,
              quantity: item.quantity || 1,
            };
            return foundItem;
          }
          return item;
        }),
      }))
    );
    if (foundItem) {
      setSelectedItem(foundItem);
      setComment(foundItem.comment || "");
      setIsModalOpen(true);
    }
  };

  // ✅ Handle comment submit
  const handleCommentSubmit = () => {
    setItems((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.id === selectedItem.id ? { ...item, comment } : item
        ),
      }))
    );
    setIsModalOpen(false);
    setSelectedItem(null);
    setComment("");
  };

  // ✅ Handle quantity increment/decrement
  const handleQuantityChange = (itemId, increment) => {
    setItems((prevData) =>
      prevData.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === itemId) {
            const newQuantity = Math.max(0, item.quantity + increment);
            return {
              ...item,
              quantity: newQuantity,
              selected: newQuantity > 0,
            };
          }
          return item;
        }),
      }))
    );
  };

  // ✅ Recalculate selected items + total cost
  useEffect(() => {
    const selected = items.flatMap((section) =>
      section.items.filter((item) => item.selected)
    );
    setSelectedItems(selected);

    const total = selected.reduce((sum, item) => {
      const price = parseInt(item.price.replace("₹", ""));
      return sum + price * item.quantity;
    }, 0);
    setTotalCost(total);
  }, [items]);

  const handleConfirmOrder = () => {
    router.push({
      pathname: "/menu-list",
      params: {
        totalItems: selectedItems.length,
        totalCost: totalCost,
        orderDetails: JSON.stringify(selectedItems),
      },
    });
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push({ pathname: "/menu-list" }); // 👈 fallback route
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/menu-bg.png")}
        style={styles.backgroundImage}
        resizeMode="repeat"
      />
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="food-variant" size={24} color="#000" />
          <Text style={styles.title}>{categoryName}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {items.map((section) => (
          <View key={section.category}>
            <Text style={styles.category}>{section.category}</Text>

            {section.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {/* Checkbox */}
                {/* {ishotel} */}
                {ishotel == "false" && (
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleItemSelect(item.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.selected && styles.checkboxSelected,
                      ]}
                    >
                      {item.selected && (
                        <MaterialIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {/* Item Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.dottedLine} />
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>

                {/* Quantity + Edit */}
                {/*  {item.selected ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => handleEdit(item.id)}
                      style={{ marginHorizontal: 6 }}
                    >
                      <Feather name="edit-2" size={18} color="#000" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleEdit(item.id)}
                    style={{ marginHorizontal: 6 }}
                  >
                    <Feather name="edit-2" size={18} color="#000" />
                  </TouchableOpacity>
                )} */}
                {ishotel == "false" &&
                  (item.selected ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(item.id, -1)}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(item.id, 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleEdit(item.id)}
                        style={{ marginHorizontal: 6 }}
                      >
                        <Feather name="edit-2" size={18} color="#000" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEdit(item.id)}
                      style={{ marginHorizontal: 6 }}
                    >
                      <Feather name="edit-2" size={18} color="#000" />
                    </TouchableOpacity>
                  ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      {ishotel == "false" && (
        <View style={styles.orderSummary}>
          <Text style={styles.summaryText}>
            No of item Selected: {selectedItems.length}
          </Text>
          <Text style={styles.summaryText}>
            Total Cost of Selection = ₹{totalCost}
          </Text>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              selectedItems.length === 0 && styles.placeOrderButtonDisabled,
            ]}
            onPress={() => setShowOrderModal(true)}
            disabled={selectedItems.length === 0}
          >
            <Text
              style={styles.placeOrderButtonText}
              onPress={() => {
                // Redirect to menu page with number of orders and amount
                router.push({
                  pathname: "/menu-list",
                  params: {
                    totalItems: selectedItems.length,
                    totalCost: totalCost,
                    orderDetails: JSON.stringify(selectedItems),
                  },
                });
              }}
            >
              Place Order
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Modal */}
      <CommentModal
        visible={isModalOpen}
        item={selectedItem}
        comment={comment}
        onChange={setComment}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCommentSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E0FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  checkboxSelected: {
    backgroundColor: "#6B46C1",
    borderColor: "#6B46C1",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
    minWidth: 50,
    textAlign: "right",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  orderSummary: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    marginBottom: 5,
  },
  placeOrderButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#ccc",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#E8E0FF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  specialInstructionsInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoButton: {
    backgroundColor: "#6B46C1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  infoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: { padding: 16 },
  category: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
    textAlign: "center",
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  checkboxContainer: { marginRight: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#333" },
  itemInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  itemName: { fontSize: 15, color: "#333" },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: "dotted",
    borderColor: "#aaa",
    marginHorizontal: 4,
  },
  itemPrice: { fontSize: 15, fontWeight: "500" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: { fontSize: 16, fontWeight: "bold" },
  quantityText: { marginHorizontal: 6, fontSize: 14 },
});
