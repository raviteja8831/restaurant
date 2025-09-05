import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UsersTabScreen({ onAddUserPress }) {
  // Mock data (move to props or context as needed)
  const users = [
    { name: "Mohan", role: "Manager" },
    { name: "Kiran", role: "Chef" },
    { name: "Anil", role: "Chef" },
    { name: "Anoop", role: "Chef" },
    { name: "Vishal", role: "Chef" },
    { name: "Anthony", role: "Chef" },
  ];
  const selectedUser = users[1];
  const allottedDishes = [
    "Masala Dosa", "Plain Dosa", "Rava Dosa", "Paper Dosa", "Masala Paper Dosa",
    "Set Dosa", "Pesarttu", "Cheese Dosa", "Neer Dosa", "Adai Dosa", "Oats Dosa",
    "Masala Oats Dosa", "Moong Dal Dosa", "Jower Dosa", "Butter Dosa", "Masala Butter Dosa",
    "Paneer Dosa", "Masala Paneer Dosa", "Poori"
  ];
  const todayLoginTime = "8:00 AM";
  const totalOrders = 65;
  const topOrders = [
    { name: "Masala Dosa", count: 20 },
    { name: "Set Dosa", count: 12 },
    { name: "Paper Dosa", count: 10 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Users Avatars Row */}
      <View style={styles.usersHeader}>
        <Text style={styles.usersTitle}>Users</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {users.map((user, idx) => (
            <View key={idx} style={styles.userAvatarCol}>
              <View style={styles.userAvatarCircle}>
                <MaterialCommunityIcons name="account" size={32} color="#6c63b5" />
              </View>
              <Text style={styles.userAvatarName}>{user.name}</Text>
              <Text style={styles.userAvatarRole}>{user.role}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.userAddCol} onPress={onAddUserPress}>
            <View style={styles.userAddBtn}>
              <MaterialCommunityIcons name="plus" size={32} color="#6c63b5" />
            </View>
            <Text style={styles.userAddText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected User Profile Row */}
      <View style={styles.usersProfileRow}>
        <View style={styles.usersProfileColLeft}>
          <View style={styles.usersProfileAvatarCircle}>
            <MaterialCommunityIcons name="account" size={48} color="#6c63b5" />
          </View>
          <View>
            <Text style={styles.usersProfileName}>{selectedUser.name}</Text>
            <Text style={styles.usersProfileRole}>{selectedUser.role}</Text>
            <Text style={styles.usersLoginTime}>Login: {todayLoginTime}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.usersProfileSettingsBtn}>
          <MaterialCommunityIcons name="cog" size={28} color="#6c63b5" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.usersStatsRow}>
        <View style={styles.usersStatsColLeft}>
          <View style={styles.usersAllottedCard}>
            <Text style={styles.usersAllottedTitle}>Allotted Dishes</Text>
            <ScrollView>
              {allottedDishes.map((dish, idx) => (
                <Text key={idx} style={styles.usersAllottedDish}>{dish}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.usersStatsColRightImage2}>
          <View style={styles.usersOrdersCardImage2}>
            <Text style={styles.usersOrdersTitle}>Total Orders</Text>
            <Text style={styles.usersOrdersBig}>{totalOrders}</Text>
          </View>
          <View style={styles.usersOrdersCardSmallImage2}>
            <Text style={styles.usersOrdersTitle}>Top Orders</Text>
            {topOrders.map((order, idx) => (
              <Text key={idx} style={styles.usersOrdersSmallLabel}>{order.name}: <Text style={styles.usersOrdersSmallValue}>{order.count}</Text></Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a6a6e7" },
  usersHeader: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },
  usersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  userAvatarCol: {
    alignItems: "center",
    marginRight: 16,
  },
  userAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  userAvatarName: {
    fontSize: 13,
    color: "#222",
    fontWeight: "bold",
  },
  userAvatarRole: {
    fontSize: 11,
    color: "#6c63b5",
    marginBottom: 2,
  },
  userAddCol: {
    alignItems: "center",
    marginRight: 8,
    marginLeft: 4,
  },
  userAddBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: 4,
    marginBottom: 8,
  },
  userAddText: {
    fontSize: 13,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
  },
  usersProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersProfileColLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  usersProfileAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ece9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  usersProfileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  usersProfileRole: {
    fontSize: 15,
    color: "#ece9fa",
    marginBottom: 2,
    textAlign: "center",
  },
  usersProfileSettingsBtn: {
    backgroundColor: "#ece9fa",
    borderRadius: 20,
    padding: 8,
  },
  usersLoginTime: {
    fontSize: 13,
    color: "#ece9fa",
    textAlign: "center",
    marginBottom: 8,
  },
  usersStatsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersStatsColLeft: {
    flex: 1.2,
    marginRight: 8,
  },
  usersStatsColRightImage2: {
    flex: 1.5,
    alignItems: "center",
  },
  usersAllottedCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    height: 350,
  },
  usersAllottedTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#6c63b5",
    marginBottom: 6,
  },
  usersAllottedDish: {
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
  },
  usersOrdersCardImage2: {
    backgroundColor: "#d1c4e9",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    minHeight: 100,
    elevation: 4,
    shadowColor: "#b0aee7",
  },
  usersOrdersCardSmallImage2: {
    backgroundColor: "#d1c4e9",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
    width: 180,
    elevation: 2,
    shadowColor: "#b0aee7",
  },
  usersOrdersTitle: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  usersOrdersBig: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    textShadowColor: "#b0aee7",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  usersOrdersSmallLabel: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#222",
    textAlign: "center",
  },
  usersOrdersSmallValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginRight: 4,
  },
});
