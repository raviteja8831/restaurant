
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AddMenuItemScreen from "./screens/AddMenuItemScreen";
import { addMenuItem, updateMenuItemsStatus } from "./api/menuApi";
import { useAlert } from "./services/alertService";
import AsyncStorage from "@react-native-async-storage/async-storage";
const menuCategories = [
  { label: "Hot & Cold beverages", icon: "cup" },
  { label: "Soups", icon: "music" },
  { label: "Breakfast", icon: "bread-slice" },
  { label: "Starters", icon: "star" },
  { label: "Indian Breads", icon: "food-variant" },
  { label: "Main Course", icon: "food" },
  { label: "Salads", icon: "leaf" },
  { label: "Ice creams & Desserts", icon: "ice-cream" },
];

export default function MenuScreen() {
  const [enableAll, setEnableAll] = useState(false);
  // Placeholder: Replace with real menu item IDs from state/store
  const [menuItemIds, setMenuItemIds] = useState([1, 2, 3]);
  const [showAddModal, setShowAddModal] = useState(false);
  const alert = useAlert();
  // TODO: Replace with real menuId from context/store/props

  // const handleAddSave = async (item) => {
  //   try {
  //     await addMenuItem({ ...item, menuId });
  //     alert.success('Menu item added successfully!');
  //     setShowAddModal(false);
  //   } catch (error) {
  //     alert.error(error?.response?.data?.message || error?.message || 'Failed to add menu item');
  //   }
  // };
  const handleAddSave = async (item) => {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      const parsedProfile = JSON.parse(userProfile);
      const restaurantId = parsedProfile?.restaurant?.id;
      await addMenuItem({ ...item, restaurantId });
      alert.success('Menu item added successfully!');
      setShowAddModal(false);
    } catch (error) {
      alert.error(error?.response?.data?.message || error?.message || 'Failed to add menu item');
    }
  };

  // Handler for Enable All switch
  const handleEnableAll = async (value) => {
    setEnableAll(value);
    try {
      await updateMenuItemsStatus(menuItemIds, value);
      alert.success(`All menu items ${value ? 'enabled' : 'disabled'}!`);
    } catch (error) {
      alert.error(error?.response?.data?.message || error?.message || 'Failed to update status');
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/dashboard')}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Menu</Text>
        </View>
        {/* Menu Grid */}
        <View style={styles.gridContainer}>
          {menuCategories.map((cat, idx) => (
            <TouchableOpacity key={cat.label} style={styles.menuCard}>
              <MaterialCommunityIcons name={cat.icon} size={36} color="#222" style={{ marginBottom: 8 }} />
              <Text style={styles.menuLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Enable All */}
        <View style={styles.enableAllRow}>
          <Switch value={enableAll} onValueChange={handleEnableAll} />
          <Text style={styles.enableAllText}>Enable All</Text>
        </View>
        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+Add</Text>
        </TouchableOpacity>
      </View>
      <AddMenuItemScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSave}
        // menuId={menuId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8D8BEA",
    paddingTop: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 0,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 20,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  menuCard: {
    width: Dimensions.get("window").width / 2 - 32,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuLabel: {
    color: "#222",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  enableAllRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  enableAllText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#7b6eea",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: Dimensions.get("window").width - 60,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});
