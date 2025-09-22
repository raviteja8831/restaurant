import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { fetchManagerDashboard, addUserByManager } from "../api/managerApi";
import { fetchChefStats } from "../api/chefApi";
import axios from "axios";

import { HEADINGS } from "../constants/headings";
import ProfileModal from "../components/ProfileModal";
import BuffetModal from "./BuffetModal";
import { LineChart } from "react-native-chart-kit";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Switch } from "react-native";
import { Appbar, Surface } from "react-native-paper";
import TabBar from "./TabBarScreen";

export default function ManagerDashboardScreenNew() {
  // Tab state management
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [ordersPeriodLabel, setOrdersPeriodLabel] = useState("Year");

  // QR Code states
  const [showNewQRModal, setShowNewQRModal] = useState(false);
  const [showTableDetail, setShowTableDetail] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [qrFormData, setQrFormData] = useState({
    name: "",
  });

  // Demo values for each period (replace with real data as needed)
  const yearOrders = "365/345";
  const monthOrders = "34/12";
  const weekOrders = "7/2";
  const ordersPeriodValue =
    ordersPeriodLabel === "Year"
      ? yearOrders
      : ordersPeriodLabel === "Month"
      ? monthOrders
      : weekOrders;

  // State for API data
  const [dashboard, setDashboard] = useState(null);
  const [managerName, setManagerName] = useState("");
  const [restaurantName, setRestaurantName] = useState(
    HEADINGS.ManagerDashboardScreen
  );
  const [today, setToday] = useState("");
  const [date, setDate] = useState("");
  const [orders, setOrders] = useState(0);
  const [tablesServed, setTablesServed] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [transactionAmt, setTransactionAmt] = useState("");
  const [reservedTables, setReservedTables] = useState(0);
  const [nonReservedTables, setNonReservedTables] = useState(0);
  const [chefLogins, setChefLogins] = useState(0);
  const [chefLogouts, setChefLogouts] = useState(0);
  const [totalChefLogins, setTotalChefLogins] = useState(0);
  const [buffet, setBuffet] = useState({ name: "", items: "", price: "" });
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [salesData, setSalesData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [buffetVisible, setBuffetVisible] = useState(false);
  const [buffetMenuVisible, setBuffetMenuVisible] = useState(false);
  const [buffetEnabled, setBuffetEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  // BuffetModal state for create/edit
  const [buffetModalVisible, setBuffetModalVisible] = useState(false);
  const [buffetModalType, setBuffetModalType] = useState("");
  // Fetch dashboard data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get user data from AsyncStorage
        const userStr = await AsyncStorage.getItem("user_profile");
        const token = await AsyncStorage.getItem("auth_token");
        let user = null;
        if (userStr) {
          user = JSON.parse(userStr);
          setManagerName(user.firstname || user.name || "");
          setProfile({
            name: user.firstname || user.name || "",
            phone: user.phone || "",
          });
        }
        // Pass restaurantId to dashboard API
        const restaurantId =
          user?.restaurantId || user?.restaurant_id || user?.id;
        const dash = await fetchManagerDashboard(restaurantId, token);
        setDashboard(dash);
        setRestaurantName(
          dash.restaurantName || HEADINGS.ManagerDashboardScreen
        );
        setToday(dash.today || "");
        setDate(dash.date || "");
        setOrders(dash.orders || 0);
        setTablesServed(dash.tablesServed || 0);
        setCustomers(dash.customers || 0);
        setTransactionAmt(dash.transactionAmt || "");
        setReservedTables(dash.reservedTables || 0);
        setNonReservedTables(dash.nonReservedTables || 0);
        setBuffet({
          name: dash.buffetName || "Breakfast Buffet",
          items:
            dash.buffetItems ||
            "Poori, All types of Dosa, Chow Chow Bath, Rice Bath",
          price: dash.buffetPrice || "800 Rs",
        });
        setSalesData(dash.salesData || []);
        setIncomeData(dash.incomeData || []);
        // Chef stats
        //const chefStats = await fetchChefStats();
        const chefStats = "";
        setChefLogins(dash.currentlyLoggedIn || 0);
        setChefLogouts(dash.chefLogouts || 0);
        setTotalChefLogins(dash.chefLogins || 0);
      } catch (e) {
        // fallback to static if needed
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Add User Modal state and config
  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: "",
    password: "",
    role: "Chef",
    phone: "",
    showRoleDropdown: false,
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const addUserFormConfig = [
    // Not used anymore, form fields are now custom below
  ];

  // Users tab mock data
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
    "Masala Dosa",
    "Plain Dosa",
    "Rava Dosa",
    "Paper Dosa",
    "Masala Paper Dosa",
    "Set Dosa",
    "Pesarttu",
    "Cheese Dosa",
    "Neer Dosa",
    "Adai Dosa",
    "Oats Dosa",
    "Masala Oats Dosa",
    "Moong Dal Dosa",
    "Jower Dosa",
    "Butter Dosa",
    "Masala Butter Dosa",
    "Paneer Dosa",
    "Masala Paneer Dosa",
    "Poori",
  ];
  const todayLoginTime = "8:00 AM";
  const totalOrders = 65;
  const topOrders = [
    { name: "Masala Dosa", count: 20 },
    { name: "Set Dosa", count: 12 },
    { name: "Paper Dosa", count: 10 },
  ];
  const orderHistory = [
    { msg: "Masala Dosa 4 Nos to Table No 5", time: "9:20AM" },
    { msg: "Set Dosa 3 Nos to Table No 4", time: "9:15PM" },
    { msg: "Plain Dosa 6 Nos to Table No 7", time: "9:10AM" },
    { msg: "Oats Dosa 1 Nos to Table No 1", time: "9:08AM" },
    { msg: "Onion Dosa 6 Nos to Parcel Table", time: "9:00AM" },
  ];

  // Reviews and Ratings mock data
  const reviews = [
    {
      hotelName: "Sai Hotel (3 Star Hotel)",
      description: "ssssssegegegwegg",
      rating: 5,
      status: "Excellent",
    },
    {
      hotelName: "Kamat Hotel",
      description: "asdafewqfewqc",
      rating: 5,
      status: "Excellent",
    },
    {
      hotelName: "Udupi Kitchen Hotel",
      description: "gafsvgregerqverqgrqegqergewg",
      rating: 5,
      status: "Excellent",
    },
  ];

  // Mock transaction data for tables
  const tableTransactions = [
    {
      name: "Prakash",
      contact: "8660435235",
      time: "07:12:00 AM",
      amount: "600",
      status: "Pending",
    },
    {
      name: "Abhishek",
      contact: "9660435235",
      time: "07:12:00 AM",
      amount: "350",
      status: "Paid",
    },
    {
      name: "Karthick",
      contact: "7676869534",
      time: "07:12:00 AM",
      amount: "800",
      status: "Paid",
    },
    {
      name: "Amruth",
      contact: "9868785564",
      time: "07:12:00 AM",
      amount: "1200",
      status: "Paid",
    },
  ];

  const handleTableClick = (tableNum) => {
    setSelectedTable(tableNum);
    setShowTableDetail(true);
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_profile");
      router.replace("/login");
    } catch (e) {
      // Optionally handle error
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Appbar.Header style={styles.appbar}>
          {/* Food menu icon at top left instead of logout */}
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => router.replace("/menu")}
          >
            <MaterialCommunityIcons name="food" size={28} color="#6c63b5" />
          </TouchableOpacity>
          <Appbar.Content
            title={restaurantName}
            titleStyle={styles.appbarTitle}
          />
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Text style={styles.payBtnText}>Pay</Text>
          </TouchableOpacity>
        </Appbar.Header>

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.todayText}>Today</Text>
            <Text style={styles.dayText}>{today}</Text>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.greetText}>Welcome {managerName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileImg}
            onPress={() => setProfileVisible(true)}
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={60}
              color="#7b6eea"
            />
          </TouchableOpacity>
        </View>

        {/* Custom Info Card and Buffet Row */}
        <View style={styles.infoBuffetRow}>
          <Surface style={[styles.infoCard, { flex: 2, marginRight: 8 }]}>
            <Text style={styles.infoTitle}>Current Info</Text>
            <View style={{ width: "100%" }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No of Orders:</Text>
                <Text style={styles.infoValue}>{orders}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No of Tables Served:</Text>
                <Text style={styles.infoValue}>{tablesServed}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No of Customer:</Text>
                <Text style={styles.infoValue}>{customers}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction of Amt:</Text>
                <Text style={styles.infoValue}>{transactionAmt}</Text>
              </View>
            </View>
          </Surface>
          <View style={styles.verticalDivider} />
          <Surface
            style={[
              styles.buffetCard,
              {
                flex: 1,
                marginLeft: 8,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                position: "relative",
                backgroundColor: "transparent",
                boxShadow: "none",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text style={styles.buffetTitle}>Buffet</Text>
              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  onPress={() => setBuffetMenuVisible(!buffetMenuVisible)}
                  style={styles.buffetMenuIcon}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={28}
                    color="#222"
                  />
                </TouchableOpacity>
                {buffetMenuVisible && (
                  <View
                    style={[
                      styles.buffetMenuPopupNew,
                      { position: "absolute", top: -132, right: 0, zIndex: 100 },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.buffetMenuItemNew}
                      onPress={() => {
                        setBuffetMenuVisible(false);
                        setBuffetModalType("Complimentary");
                        setBuffetModalVisible(true);
                      }}
                    >
                      <Text style={styles.buffetMenuTextNew}>
                        Complimentary
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buffetMenuItemNew}
                      onPress={() => {
                        setBuffetMenuVisible(false);
                        setBuffetModalType("Pay the Price");
                        setBuffetModalVisible(true);
                      }}
                    >
                      <Text style={styles.buffetMenuTextNew}>
                        Pay the Price
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.buffetIcon}
              onPress={() => setBuffetVisible(true)}
            >
              <Image
                source={require("../../assets/images/buffet.png")}
                style={styles.buffetImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* Make buffet type clickable to open modal */}
            <TouchableOpacity
              onPress={() => setBuffetVisible(true)}
              style={{ marginTop: 8, alignItems: "center", width: "100%" }}
            >
              <Text
                style={{ color: "#1f1d1d", fontWeight: "bold", fontSize: 15 }}
              >
                {buffet.type || "Buffet Type"}
              </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 8, alignItems: "center", width: "100%" }}>
              <Switch
                value={buffetEnabled}
                onValueChange={async (val) => {
                  setBuffetEnabled(val);
                  try {
                    const userStr = await AsyncStorage.getItem("user_profile");
                    const user = userStr ? JSON.parse(userStr) : {};
                    const restaurantId =
                      user?.restaurantId || user?.restaurant_id || user?.id;
                    await axios.post(
                      "http://localhost:8080/api/buffetdetails/all-status",
                      {
                        restaurantId,
                        isActive: val,
                      }
                    );
                    // Optionally, refresh dashboard/buffet info here
                  } catch (err) {
                    // Optionally show error
                  }
                }}
                trackColor={{ false: "#ccc", true: "#6c63b5" }}
                thumbColor={buffetEnabled ? "#fff" : "#888"}
                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
              />
            </View>
          </Surface>

          {/* Buffet Create/Edit Modal */}
          <BuffetModal
            visible={buffetModalVisible}
            onClose={() => setBuffetModalVisible(false)}
            initialType={buffetModalType}
            buffet={buffet}
            setBuffet={setBuffet}
          />
        </View>
        {/* Buffet Modal */}
        <Modal
          visible={buffetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setBuffetVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#ece9fa",
                borderRadius: 20,
                padding: 20,
                width: 320,
                alignItems: "flex-start",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 10,
              }}
            >
              <TouchableOpacity
                style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
                onPress={() => setBuffetVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                  color: "#222",
                }}
              >
                Buffet Name :{" "}
                <Text style={{ color: "#6c63b5" }}>{buffet.name}</Text>
              </Text>
              <Text style={{ fontSize: 14, color: "#222", marginBottom: 8 }}>
                Items : <Text style={{ color: "#6c63b5" }}>{buffet.items}</Text>
              </Text>
              <Text style={{ fontSize: 14, color: "#222", marginBottom: 8 }}>
                Buffet Price:{" "}
                <Text style={{ color: "#6c63b5" }}>{buffet.price}</Text>
              </Text>
            </View>
          </View>
        </Modal>
        {/* Profile Modal */}
        <ProfileModal
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          managerName={profile.name}
          phone={profile.phone}
        />

        {/* Table Status Card */}
        <Surface style={styles.statusCard}>
          <Text style={styles.statusTitle}>Table status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Reserved Tables</Text>
              <Text style={styles.statusValue}>{reservedTables}</Text>
            </View>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Non Reserved Tables</Text>
              <Text style={styles.statusValue}>{nonReservedTables}</Text>
            </View>
          </View>
        </Surface>

        {/* Chef Status Card */}
        <Surface style={styles.chefCard}>
          <Text style={styles.chefTitle}>Chef Status</Text>
          <View style={styles.chefRow}>
            <View style={styles.chefBox}>
              <Text style={styles.chefLabel}>Login</Text>
              <Text style={styles.chefValue}>{chefLogins}</Text>
            </View>
            <View style={styles.chefBox}>
              <Text style={styles.chefLabel}>No of Logins :</Text>
              <Text style={styles.chefValue}>{totalChefLogins}</Text>
            </View>
            <View style={styles.chefBox}>
              <Text style={styles.chefLabel}>Logout</Text>
              <Text style={styles.chefValue}>{chefLogouts}</Text>
            </View>
          </View>
        </Surface>

        {/* Orders Chart */}
        <Surface style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Produce Sales</Text>
          </View>
          <LineChart
            data={{
              labels: salesData.map((d) => d.label),
              datasets: [
                {
                  data: salesData.map((d) => d.value),
                },
              ],
            }}
            width={Dimensions.get("window").width - 40}
            height={180}
            chartConfig={{
              backgroundColor: "#ece9fa",
              backgroundGradientFrom: "#ece9fa",
              backgroundGradientTo: "#ece9fa",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#6c63b5",
              },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </Surface>
        {/* Income Graph */}
        <Surface style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Income Graph</Text>
          </View>
          <LineChart
            data={{
              labels: incomeData.map((d) => d.label),
              datasets: [
                {
                  data: incomeData.map((d) => d.value),
                },
              ],
            }}
            width={Dimensions.get("window").width - 40}
            height={180}
            chartConfig={{
              backgroundColor: "#ece9fa",
              backgroundGradientFrom: "#ece9fa",
              backgroundGradientTo: "#ece9fa",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#6c63b5",
              },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </Surface>

        {/* Profile Modal */}
        <Modal
          visible={profileVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setProfileVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.profileCard}>
              {/* Close cross icon */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 20,
                }}
                onPress={() => setProfileVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <View style={styles.profileCircle}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#7b6eea"
                />
              </View>
              <Text style={styles.profileName}>{managerName}</Text>
              <Text style={styles.profilePhone}>Ph no: {profile.phone}</Text>
              <TouchableOpacity
                style={styles.profileCloseBtn}
                onPress={() => setProfileVisible(false)}
              >
                <MaterialCommunityIcons
                  name="power"
                  size={28}
                  color="#6c63b5"
                />
                <Text style={styles.logoutText} onPress={() => handleLogout()}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  infoBuffetRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  infoBuffetCard: {
    minHeight: 180,
    borderRadius: 24,
    backgroundColor: "#e3dbfa",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  buffetImg: {
    width: 60,
    height: 60,
    marginTop: 8,
    marginBottom: 4,
  },
  buffetMenuPopupNew: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
    minWidth: 160,
    alignItems: "flex-start",
  },
  buffetMenuItemNew: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
  },
  buffetMenuTextNew: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },

  verticalDivider: {
    width: 8,
  },
  buffetCard: {
    backgroundColor: "#e3dbfa",
    borderRadius: 20,
    padding: 16,
    minWidth: 120,
    minHeight: 120,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  buffetTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 8,
  },
  buffetMenuIcon: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  buffetMenuPopup: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
  },
  buffetMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  buffetMenuText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },
  chefCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 2,
  },
  chefTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#6c63b5",
    marginBottom: 8,
  },
  chefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chefBox: {
    alignItems: "center",
    flex: 1,
  },
  chefLabel: {
    fontSize: 14,
    color: "#222",
    marginBottom: 4,
  },
  chefValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#6c63b5",
  },
  // QR Code Tab Styles
  qrContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#8D8BEA",
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  newQRButton: {
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newQRButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrStatsContainer: {
    width: "100%",
    alignItems: "center",
  },
  qrStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  qrPeriodButton: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrPeriodButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  qrCustomerCountContainer: {
    marginLeft: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCustomerCountText: {
    fontSize: 16,
    color: "#000",
  },
  qrTableButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  qrTableButton: {
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrTableButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  // New QR Modal Styles
  newQRModalCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 24,
    padding: 24,
    width: 300,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  newQRHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  smallQRCode: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadIcon: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  nameInputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  nameInputLabel: {
    fontSize: 14,
    color: "#6c63b5",
    marginBottom: 8,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  nameInput: {
    width: "100%",
    minHeight: 36,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  qrPlusButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  // Table Detail Modal Styles
  tableDetailCard: {
    backgroundColor: "#4a148c",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
  },
  tableDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  tableDetailTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#fff",
  },
  weekDropdown: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDropdownText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  transactionSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  transactionSummaryText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  transactionsTable: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    marginBottom: 8,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    alignItems: "center",
  },
  tableCellText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#8D8BEA",
    paddingTop: 0,
  },
  appbar: {
    backgroundColor: "#8D8BEA",
    elevation: 0,
  },
  appbarTitle: {
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "#7b6eea",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
    marginBottom: 8,
  },
  headerLeft: {},
  todayText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  greetText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#d1c4e9",
    overflow: "hidden",
  },
  infoCard: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#d1c4e9",
    elevation: 4,
    alignItems: "center",
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    width: "100%",
  },
  infoLabel: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#7b6eea",
    fontWeight: "bold",
  },
  statusCard: {
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#d1c4e9",
    elevation: 4,
    alignItems: "center",
  },
  statusTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statusBox: {
    alignItems: "center",
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7b6eea",
    textAlign: "center",
  },
  chartCard: {
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ece9fa",
    elevation: 4,
    alignItems: "center",
    position: "relative",
  },
  chartHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  chartTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  ordersPeriodPill: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    elevation: 2,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ordersPeriodPillText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
    textAlign: "center",
  },
  usersOrdersDropdownMenuPopupFixed: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 4,
    elevation: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
    minWidth: 70,
    paddingVertical: 0,
  },
  usersOrdersDropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  usersOrdersDropdownItemText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#ece9fa",
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: "center",
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d1c4e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
    color: "#6c63b5",
  },
  profilePhone: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  profileCloseBtn: {
    backgroundColor: "#a9a1e2",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#6c63b5",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Users Tab Styles
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
  usersListRow: {
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
  addUserModalCard: {
    backgroundColor: "#e3dbff",
    borderRadius: 24,
    padding: 24,
    width: 300,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 80,
    elevation: 8,
  },
  addUserModalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#6c63b5",
    textAlign: "center",
  },
  addUserInput: {
    width: 200,
    minHeight: 36,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  addUserLabel: {
    color: "#6c63b5",
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
  addUserSaveBtn: {
    backgroundColor: "#bcb3f7",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 28,
    marginTop: 8,
    alignItems: "center",
  },
  addUserSaveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    height: 350, // Increased height to match right side cards
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
  usersOrdersDropdownBtn: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    minWidth: 50,
  },
  usersMsgInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  usersMsgInputLabel: {
    fontSize: 15,
    color: "#ece9fa",
    marginRight: 8,
  },
  usersMsgInputBox: {
    flex: 1,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece9fa",
  },
  usersHistoryTitle: {
    fontSize: 15,
    color: "#ece9fa",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  usersHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ece9fa",
    borderRadius: 8,
    marginHorizontal: 18,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  usersHistoryMsg: {
    fontSize: 13,
    color: "#222",
    flex: 1,
  },
  usersHistoryTime: {
    fontSize: 13,
    color: "#6c63b5",
    marginLeft: 8,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
  },
  navBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  navBtnActive: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#6c63b5",
    backgroundColor: "rgba(108,99,181,0.08)",
  },
  notificationContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Reviews Tab Styles
  reviewsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#d8bfd8",
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  filterIcon: {
    padding: 8,
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  mainStarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainStar: {
    borderWidth: 3,
    borderColor: "#FF8C00",
  },
  reviewsList: {
    width: "100%",
  },
  reviewCard: {
    backgroundColor: "#c8a2c8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewHotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 8,
    flex: 1,
  },
  reviewDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewStatus: {
    fontSize: 14,
    color: "#6c63b5",
    fontWeight: "bold",
  },
});
