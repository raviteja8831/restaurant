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
import CommentModal from "./Modals/menueditModal"; // 👈 new component
import { orderitemsstyle, responsiveStyles } from "./styles/responsive";
import { AlertService } from "./services/alert.service";
import { getitemsbasedonmenu } from "./api/menuApi";
import { createOrder, getOrderItemList } from "./api/orderApi";

export default function ItemsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  /*  const { category, categoryName, restaurantId, userId, orderID, ishotel } =
    params; */
  // console.log("ghgsd", useLocalSearchParams());

  // ✅ Initialize items state from menuItemsData

  const [selectedItems, setSelectedItems] = useState([]);
  const [remove_list, setRemoveList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  var itemfirstcalling = false;

  useEffect(() => {
    initializeData();
  }, [params.category, params.orderID, params.userId]);
  const initializeData = async () => {
    try {
      setLoading(true);
      // First fetch the menu items
      const menuItems = await getitemsbasedonmenu(params.category);

      // Then fetch the order items
      var orderResponse = [];
      if (params.orderID) {
        const ord_res = await getOrderItemList(params.orderID, params.userId);
        if (ord_res.orderItems) {
          orderResponse = ord_res.orderItems;
        }
      }
      // Create a map of order items
      const orderItems = orderResponse.reduce((acc, orderItem) => {
        acc[orderItem.menuItemId] = orderItem;
        return acc;
      }, {});

      // Combine menu items with order data
      const combinedItems = menuItems.map((item) => ({
        ...item,
        selected: !!orderItems[item.id],
        quantity: orderItems[item.id]?.quantity || 0,
        comment: orderItems[item.id]?.comment || "",
        orderItemId: orderItems[item.id]?.id || null,
      }));

      setItems(combinedItems);
    } catch (error) {
      AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder_data = async (path_re, calling_source) => {
    const order = {
      userId: params.userId || 1,
      restaurantId: params.restaurantId,
      total: 0,
      status: "PENDING",
      orderItems: selectedItems || [],
      orderID: params.orderID || null,
      removedItems: remove_list,
    };
    // console.log("items", order);
    try {
      const response = await createOrder(order);
      initializeData();
      console.log("Order created successfully:", response);
    } catch (error) {
      // console.error("Error creating order:", error);
    }
    setShowOrderModal(true);
    if (path_re) {
      router.push({
        pathname: "/menu-list",
      });
    }
  };
  // ✅ Handle checkbox toggle
  /*  const handleItemSelect = (itemId) => {
    setItems((prevData) =>
      prevData.map((item) => {
        if (item.id === itemId) {
          // If item is being unselected, add it to remove_list
          if (item.selected) {
            setRemoveList((prev) => [...prev, item]);
          } else {
            // If item is being selected, remove it from remove_list if it exists
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
            );
          }
          return {
            ...item,
            selected: !item.selected,
            quantity: item.selected ? 0 : 1,
          };
        }
        return item;
      })
    );
  }; */
  const handleItemSelect = (itemId) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          if (item.selected) {
            // If item is being unselected, add it to remove_list
            setRemoveList((prev) => [...prev, item]);
          } else {
            // If item is being selected, remove it from remove_list if it exists
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
            );
          }

          return {
            ...item,
            selected: !item.selected,
            quantity: item.selected ? 0 : 1,
          };
        }
        return item;
      });

      // ✅ After update, check if any selected items left
      const selected = updatedItems.filter((i) => i.selected);
      if (selected.length === 0) {
        // params.orderID = null;
        createOrder_data(false, "calling_selected");
      }

      return updatedItems;
    });
  };

  useEffect(() => {
    console.log("remove_list:", remove_list);
  }, [remove_list]);

  // ✅ Handle edit
  const handleEdit = (itemId) => {
    let foundItem = null;
    setItems(
      (prevSections) =>
        prevSections.map((item) => {
          if (item.id === itemId) {
            foundItem = {
              ...item,
              selected: true,
              quantity: item.quantity || 1,
            };
            return foundItem;
          }
          return item;
        })
      // }))
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
  /*  const handleQuantityChange = (itemId, increment) => {
    setItems((prevData) =>
      prevData.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + increment);
          // Add to remove_list if quantity becomes 0
          if (newQuantity === 0 && item.orderItemId) {
            setRemoveList((prev) => [...prev, item]);
          } else if (newQuantity > 0) {
            // Remove from remove_list if quantity becomes > 0
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
            );
          }
          return {
            ...item,
            quantity: newQuantity,
            selected: newQuantity > 0,
          };
        }
        return item;
      })
    );
    
  }; */
  const handleQuantityChange = (itemId, increment) => {
    setItems((prevData) => {
      const updatedItems = prevData.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + increment);

          // Handle remove_list updates
          if (newQuantity === 0 && item.orderItemId) {
            setRemoveList((prev) => [...prev, item]);
          } else if (newQuantity > 0) {
            setRemoveList((prev) =>
              prev.filter((removedItem) => removedItem.id !== item.id)
            );
          }

          return {
            ...item,
            quantity: newQuantity,
            selected: newQuantity > 0,
          };
        }
        return item;
      });

      // ✅ After items updated, check selected count
      const selected = updatedItems.filter((i) => i.selected);

      if (selected.length === 0) {
        // 👇 Only call API here
        // params.orderID = null;
        createOrder_data(false, "calling_selected");
      }

      return updatedItems;
    });
  };

  // ✅ Recalculate selected items + total cost
  useEffect(() => {
    const selected = items.filter((item) => item.selected);
    setSelectedItems(selected);
    // itemfirstcalling = true;
    const total = selected.reduce((sum, item) => {
      const price = parseInt(item.price);
      return sum + price * item.quantity;
    }, 0);
    setTotalCost(total);
    /*  if (selected == 0) {
      createOrder_data(false, "calling_selected");
    } */
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
    var obj = { pathname: "/menu-list" };
    if (params.ishotel == "true") {
      obj.params = { hotelId: params.restaurantId, ishotel: "true" };
    } else {
      obj.params = { hotelId: params.restaurantId };
    }
    router.push(obj);
  };

  return (
    <SafeAreaView style={orderitemsstyle.container}>
      <ImageBackground
        source={require("../assets/images/menu-bg.png")}
        style={orderitemsstyle.backgroundImage}
        resizeMode="repeat"
      />
      <View style={orderitemsstyle.header}>
        {/* <TouchableOpacity
          style={orderitemsstyle.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={orderitemsstyle.backButton}
          onPress={handleBackPress}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={orderitemsstyle.headerContent}>
          <MaterialCommunityIcons name="food-variant" size={24} color="#000" />
          <Text style={orderitemsstyle.title}>{params.categoryName}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={orderitemsstyle.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/*         {items.map((section) => (
          <View key={section.name}>
            <Text style={orderitemsstyle.category}>{section.name}</Text> */}

        {items.map((item) => (
          <View key={item.id} style={orderitemsstyle.itemRow}>
            {/* Checkbox */}
            {/* {ishotel} */}
            {params.ishotel == "false" && (
              <TouchableOpacity
                style={orderitemsstyle.checkboxContainer}
                onPress={() => handleItemSelect(item.id)}
              >
                <View
                  style={[
                    orderitemsstyle.checkbox,
                    item.selected && orderitemsstyle.checkboxSelected,
                  ]}
                >
                  {item.selected && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Item Info */}
            <View style={orderitemsstyle.itemInfo}>
              <Text style={orderitemsstyle.itemName}>{item.name}</Text>
              <View style={orderitemsstyle.dottedLine} />
              <Text style={orderitemsstyle.itemPrice}>{item.price}</Text>
            </View>

            {params.ishotel == "false" &&
              (item.selected ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={orderitemsstyle.quantityContainer}>
                    <TouchableOpacity
                      style={orderitemsstyle.quantityButton}
                      onPress={() => handleQuantityChange(item.id, -1)}
                    >
                      <Text style={orderitemsstyle.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={orderitemsstyle.quantityText}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={orderitemsstyle.quantityButton}
                      onPress={() => handleQuantityChange(item.id, 1)}
                    >
                      <Text style={orderitemsstyle.quantityButtonText}>+</Text>
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
        {/*  </View>
        ))} */}
      </ScrollView>

      {/* Order Summary */}
      {params.ishotel == "false" && (
        <View style={orderitemsstyle.orderSummary}>
          <Text style={orderitemsstyle.summaryText}>
            No of item Selected: {selectedItems.length}
          </Text>
          <Text style={orderitemsstyle.summaryText}>
            Total Cost of Selection = ₹{totalCost}
          </Text>
          <TouchableOpacity
            style={[
              orderitemsstyle.placeOrderButton,
              responsiveStyles.bg1,
              selectedItems.length === 0 &&
                orderitemsstyle.placeOrderButtonDisabled,
            ]}
            onPress={() => createOrder_data(true)}
            disabled={selectedItems.length === 0}
          >
            <Text style={orderitemsstyle.placeOrderButtonText}>
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
