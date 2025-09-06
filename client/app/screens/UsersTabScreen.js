import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, ActivityIndicator, Alert, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TabBar from "./TabBarScreen";
import AddMenuItemModal from "../Modals/AddMenuItemModal";
import { getUserDashboard, sendMessageToUser, getMessagesForUser, getUserAllottedMenuItems } from "../api/userApi";
import { getMenusWithItems, saveUserMenuItems } from "../api/menuApi";

const userList = [
  { id: 2, name: "Kiran", role: "Chef" },
  { id: 3, name: "Anil", role: "Chef" },
  { id: 4, name: "Anoop", role: "Chef" },
  { id: 5, name: "Vishal", role: "Chef" },
  { id: 6, name: "Anthony", role: "Chef" },
  { id: 1, name: "Mohan", role: "Manager" },
];

const periodOptions = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export default function UsersTabScreen() {
  const [selectedUser, setSelectedUser] = useState(userList[0]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("week");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menusWithItems, setMenusWithItems] = useState([]);
  const [allottedMenuItemIds, setAllottedMenuItemIds] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchDashboard(selectedUser.id, period);
    fetchMessages(selectedUser.id);
    fetchMenus();
    fetchAllottedMenuItems(selectedUser.id);
  }, [selectedUser, period]);

  const fetchAllottedMenuItems = async (userId) => {
    try {
      const items = await getUserAllottedMenuItems(userId);
      setAllottedMenuItemIds(items.map(i => i.id));
    } catch (err) {
      setAllottedMenuItemIds([]);
    }
  };

  const fetchMenus = async () => {
    try {
      const data = await getMenusWithItems();
      setMenusWithItems(data);
    } catch (err) {
      // Optionally show error
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await getMessagesForUser(userId);
      setMessages(res.messages || []);
    } catch {}
  };
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendMessageToUser(selectedUser.id, message, "Manager");
      setMessage("");
      fetchMessages(selectedUser.id);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to send message");
    }
    setSending(false);
  };

  const fetchDashboard = async (userId, period) => {
    setLoading(true);
    try {
      const data = await getUserDashboard(userId, period);
      setDashboard(data);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to load dashboard");
    }
    setLoading(false);
  };

  const handleAddMenuItem = async (menuitemId) => {
    try {
      await saveUserMenuItems(selectedUser.id, [menuitemId]);
      setShowAddMenuModal(false);
      fetchDashboard(selectedUser.id, period);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to add menu item");
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Users Avatars Row (Horizontally scrollable) */}
        <View style={styles.usersHeader}>
          <Text style={styles.usersTitle}>Users</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 4 }}>
            {userList.map((user, idx) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userAvatarCol, selectedUser.id === user.id && { borderColor: '#6c63b5', borderWidth: 2 }]}
                onPress={() => setSelectedUser(user)}
              >
                <View style={styles.userAvatarCircle}>
                  <MaterialCommunityIcons name="account" size={32} color="#6c63b5" />
                </View>
                <Text style={styles.userAvatarName}>{user.name}</Text>
                <Text style={styles.userAvatarRole}>{user.role}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* + Button below avatars */}
          <View style={{ alignItems: 'center', marginTop: 4 }}>
            <TouchableOpacity style={styles.userAddBtn} onPress={() => Alert.alert('Add user pressed')}>
              <MaterialCommunityIcons name="plus" size={32} color="#6c63b5" />
            </TouchableOpacity>
            <Text style={styles.userAddText}>Add</Text>
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
              <Text style={styles.usersLoginTime}>Login: {dashboard?.todayLoginTime || '--'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.usersProfileSettingsBtn}>
            <MaterialCommunityIcons name="cog" size={28} color="#6c63b5" />
          </TouchableOpacity>
        </View>


        {/* Allotted Dishes & Orders Count Row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginHorizontal: 18, marginBottom: 8, marginTop: 8 }}>
          {/* Allotted Dishes Card */}
          <View style={[styles.usersAllottedCard, { flex: 1.2, marginRight: 8, minHeight: 220 }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.usersAllottedTitle}>Allotted Dishes</Text>
              <TouchableOpacity onPress={() => setShowAddMenuModal(true)}>
                <MaterialCommunityIcons name="plus" size={22} color="#6c63b5" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {dashboard?.user?.allottedMenuItems?.map((dish, idx) => (
                <Text key={dish.id} style={styles.usersAllottedDish}>{dish.name}</Text>
              ))}
            </ScrollView>
          </View>
          {/* Orders Count Card with Period Dropdown */}
          <View style={{ flex: 1.1, minWidth: 180, backgroundColor: '#ece9fa', borderRadius: 16, padding: 18, alignItems: 'center', position: 'relative' }}>
            <Text style={{ color: '#6c63b5', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Total Orders Completed</Text>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#222' }}>{dashboard?.totalOrders ?? '--'}</Text>
            <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16, marginTop: 2 }}>{dashboard?.totalOrders}/{dashboard?.totalOrdersAll}</Text>
            {/* Floating Period Dropdown */}
            <View style={{ position: 'absolute', top: 12, right: 12 }}>
              <TouchableOpacity style={{ backgroundColor: '#d1c4e9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: '#6c63b5', fontWeight: 'bold', fontSize: 15 }}>{periodOptions.find(p => p.value === period)?.label}</Text>
              </TouchableOpacity>
              <View style={{ position: 'absolute', top: 36, right: 0, backgroundColor: '#ece9fa', borderRadius: 8, zIndex: 10, minWidth: 80 }}>
                {periodOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={{ padding: 10, backgroundColor: period === opt.value ? '#d1c4e9' : 'transparent' }}
                    onPress={() => setPeriod(opt.value)}
                  >
                    <Text style={{ color: '#6c63b5', fontWeight: 'bold' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
        {/* Message Section */}
        <View style={{ marginHorizontal: 18, marginBottom: 12 }}>
          <Text style={{ color: '#6c63b5', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Message</Text>
          <View style={{ backgroundColor: '#ece9fa', borderRadius: 12, padding: 10, marginBottom: 6 }}>
            {messages.length ? (
              <Text style={{ color: '#333', fontSize: 14 }}>{messages[messages.length - 1].message}</Text>
            ) : (
              <Text style={{ color: '#888', fontSize: 14 }}>No messages yet</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: '#222', padding: 6 }}
              placeholder="Message..."
              value={message}
              onChangeText={setMessage}
              editable={!sending}
            />
            <TouchableOpacity onPress={handleSendMessage} disabled={sending || !message.trim()} style={{ marginLeft: 8 }}>
              <MaterialCommunityIcons name="send" size={24} color={sending || !message.trim() ? '#ccc' : '#6c63b5'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Orders Card (below Allotted/Orders row) */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginHorizontal: 18, marginBottom: 8 }}>
          <View style={{ backgroundColor: '#d1c4e9', borderRadius: 16, padding: 14, minWidth: 180, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#222', marginBottom: 2 }}>Top three Orders of the Day</Text>
            {dashboard?.topOrders?.map((order, idx) => (
              <Text key={idx} style={{ color: '#333', fontSize: 14 }}>{order.name}: <Text style={{ fontWeight: 'bold' }}>{order.count}</Text></Text>
            ))}
          </View>
        </View>

        {/* Today's Orders List */}
        <View style={{ marginHorizontal: 18, marginTop: 12 }}>
          <Text style={{ fontWeight: 'bold', color: '#6c63b5', fontSize: 16, marginBottom: 6 }}>Today</Text>
          {dashboard?.todaysOrders?.length ? dashboard.todaysOrders.map((order, idx) => {
            // Combine all items into a single string, e.g. "Masala Dosa 4 Nos to Table No 5"
            // If you have table info, append it; else, just show items
            const orderText = order.items.map(item => `${item.name} ${item.qty} Nos`).join(', ');
            // If you have table info, add here: + ' to Table No X'
            return (
              <View key={order.id} style={{ backgroundColor: '#e6e6fa', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#222', fontSize: 15 }}>{orderText}</Text>
                <Text style={{ color: '#555', fontSize: 13, marginLeft: 12, minWidth: 54, textAlign: 'right' }}>{new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            );
          }) : <Text style={{ color: '#fff' }}>No orders today</Text>}
        </View>

        {loading && <ActivityIndicator size="large" color="#6c63b5" style={{ marginTop: 24 }} />}
      </ScrollView>
      <AddMenuItemModal
        visible={showAddMenuModal}
        onClose={() => setShowAddMenuModal(false)}
        menus={menusWithItems}
        allottedMenuItemIds={allottedMenuItemIds}
        onAdd={handleAddMenuItem}
      />
      <TabBar />
    </>
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
