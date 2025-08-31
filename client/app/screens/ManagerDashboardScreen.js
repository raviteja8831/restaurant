import React, { useState } from "react";
import FormService from "../components/formService";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Appbar, Surface } from "react-native-paper";

export default function ManagerDashboardScreenNew() {
  // Dropdown state for orders period in Users tab
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [ordersPeriodLabel, setOrdersPeriodLabel] = useState("Year");

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

  // Static data for demonstration
  const restaurantName = "Hotel Sai (3 Star)";
  const managerName = "Mohan";
  const today = "Wednesday";
  const date = "21.02.2025";
  const orders = 25;
  const tablesServed = 15;
  const customers = 30;
  const transactionAmt = "17,637";
  const reservedTables = 16;
  const nonReservedTables = 4;
  const chefLogins = 6;
  const chefLogouts = 0;

  const [buffetVisible, setBuffetVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Add User Modal state and config
  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    firstname: "",
    lastname: "",
    restaurantName: "",
    restaurantAddress: "",
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const addUserFormConfig = [
    { label: "First Name", name: "firstname", type: "text" },
    { label: "Last Name", name: "lastname", type: "text" },
    { label: "Restaurant Name", name: "restaurantName", type: "text" },
    {
      label: "Restaurant Address",
      name: "restaurantAddress",
      type: "textarea",
      multiline: true,
    },
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

  return (
    <View style={styles.container}>
      {activeTab === "Dashboard" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Appbar.Header style={styles.appbar}>
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
              <Text style={styles.greetText}>Hi {managerName}</Text>
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

          {/* Custom Info Card */}
          <Surface style={styles.infoCard}>
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

          {/* Orders Chart */}
          <Surface style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Orders Graph</Text>
              <TouchableOpacity
                style={styles.ordersPeriodPill}
                onPress={() => setShowOrdersDropdown(!showOrdersDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.ordersPeriodPillText}>
                  {ordersPeriodLabel}
                </Text>
              </TouchableOpacity>
              {showOrdersDropdown && (
                <View style={styles.usersOrdersDropdownMenuPopupFixed}>
                  {["Year", "Month", "Week"].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={styles.usersOrdersDropdownItem}
                      onPress={() => {
                        setOrdersPeriodLabel(label);
                        setShowOrdersDropdown(false);
                      }}
                    >
                      <Text style={styles.usersOrdersDropdownItemText}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <LineChart
              data={{
                labels: [
                  "Oct",
                  "Nov",
                  "Dec",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                ],
                datasets: [
                  {
                    data: [40, 70, 50, 50, 40, 30, 50, 70, 90],
                    color: () => "#6c63b5",
                    strokeWidth: 3,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 48}
              height={200}
              yAxisSuffix="k"
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: "#e0e0e0",
                  strokeDasharray: "4 4",
                },
                propsForLabels: {
                  fontSize: 14,
                  fontWeight: "bold",
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "3",
                  stroke: "#fff",
                  fill: "#6c63b5",
                },
              }}
              bezier
              style={{ borderRadius: 16, marginVertical: 8 }}
            />
          </Surface>

          {/* Income Graph */}
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Income Graph</Text>
            <LineChart
              data={{
                labels: [
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                ],
                datasets: [
                  {
                    data: [10, 20, 15, 30, 40, 50, 60, 55, 65],
                    color: () => "#7b6eea",
                    strokeWidth: 3,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 48}
              height={200}
              yAxisSuffix="k"
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(123, 110, 234, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: "#e0e0e0",
                  strokeDasharray: "4 4",
                },
                propsForLabels: {
                  fontSize: 14,
                  fontWeight: "bold",
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "3",
                  stroke: "#fff",
                  fill: "#7b6eea",
                },
              }}
              bezier
              style={{ borderRadius: 16, marginVertical: 8 }}
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
                <View style={styles.profileCircle}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={80}
                    color="#7b6eea"
                  />
                </View>
                <Text style={styles.profileName}>{managerName}</Text>
                <Text style={styles.profilePhone}>Ph no: 9660435235</Text>
                <TouchableOpacity
                  style={styles.profileCloseBtn}
                  onPress={() => setProfileVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="power"
                    size={28}
                    color="#6c63b5"
                  />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      ) : (
        // USERS TAB UI
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.usersHeader}>
            <Text style={styles.usersTitle}>Users</Text>
            <View style={styles.usersListRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {users.map((user, idx) => (
                  <View key={user.name} style={styles.userAvatarCol}>
                    <View style={styles.userAvatarCircle}>
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={48}
                        color="#7b6eea"
                      />
                    </View>
                    <Text style={styles.userAvatarName}>{user.name}</Text>
                    <Text style={styles.userAvatarRole}>{user.role}</Text>
                  </View>
                ))}
                <View style={styles.userAddCol}>
                  <TouchableOpacity
                    style={styles.userAddBtn}
                    onPress={() => setAddUserModal(true)}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={32}
                      color="#222"
                    />
                  </TouchableOpacity>
                  <Text style={styles.userAddText}>Add</Text>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Add User Modal */}
          <Modal
            visible={addUserModal}
            transparent
            animationType="fade"
            onRequestClose={() => setAddUserModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.addUserModalCard}>
                <Text style={styles.addUserModalTitle}>New Profile</Text>
                <FormService
                  config={addUserFormConfig}
                  values={addUserForm}
                  setValues={setAddUserForm}
                  onSubmit={() => setAddUserModal(false)}
                  submitLabel={null}
                  loading={addUserLoading}
                  inputStyle={styles.addUserInput}
                  labelStyle={styles.addUserLabel}
                />
                <TouchableOpacity
                  style={styles.addUserSaveBtn}
                  onPress={() => setAddUserModal(false)}
                  disabled={addUserLoading}
                >
                  <Text style={styles.addUserSaveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.usersProfileRow}>
            <View style={styles.usersProfileColLeft}>
              <View style={styles.usersProfileAvatarCircle}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={64}
                  color="#7b6eea"
                />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.usersProfileName}>{selectedUser.name}</Text>
                <Text style={styles.usersProfileRole}>{selectedUser.role}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.usersProfileSettingsBtn}>
              <MaterialCommunityIcons name="cog" size={28} color="#222" />
            </TouchableOpacity>
          </View>

          <Text style={styles.usersLoginTime}>
            Today Login Time: {todayLoginTime}
          </Text>

          <View style={styles.usersStatsRow}>
            <View style={styles.usersStatsColLeft}>
              <View style={styles.usersAllottedCard}>
                <Text style={styles.usersAllottedTitle}>Allotted Dishes</Text>
                <ScrollView style={{ maxHeight: 180 }}>
                  {allottedDishes.map((dish, i) => (
                    <Text key={dish} style={styles.usersAllottedDish}>
                      • {dish}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.usersStatsColRightImage2}>
              <View style={styles.usersOrdersCardImage2}>
                <Text style={styles.usersOrdersTitle}>
                  Total Orders Completed
                </Text>
                <Text style={styles.usersOrdersBig}>{totalOrders}</Text>
              </View>
              <View style={styles.usersOrdersCardImage2}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <Text style={styles.usersOrdersSmallValue}>
                    {ordersPeriodValue}
                  </Text>
                  <View style={{ position: "relative" }}>
                    <TouchableOpacity
                      style={styles.usersOrdersDropdownBtn}
                      onPress={() => setShowOrdersDropdown(!showOrdersDropdown)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.usersOrdersSmallLabel}>
                        {ordersPeriodLabel}
                      </Text>
                    </TouchableOpacity>
                    {showOrdersDropdown && (
                      <View style={styles.usersOrdersDropdownMenuPopupFixed}>
                        {["Year", "Month", "Week"].map((label) => (
                          <TouchableOpacity
                            key={label}
                            style={styles.usersOrdersDropdownItem}
                            onPress={() => {
                              setOrdersPeriodLabel(label);
                              setShowOrdersDropdown(false);
                            }}
                          >
                            <Text style={styles.usersOrdersDropdownItemText}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.usersOrdersCardSmallImage2}>
                <Text style={styles.usersOrdersSmallLabel}>
                  Top three Orders of the Day
                </Text>
                {topOrders.map((o) => (
                  <Text key={o.name} style={styles.usersOrdersSmallValue}>
                    {o.name} : {o.count}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.usersMsgInputRow}>
            <Text style={styles.usersMsgInputLabel}>Message:</Text>
            <View style={styles.usersMsgInputBox} />
          </View>

          <Text style={styles.usersHistoryTitle}>Today</Text>
          {orderHistory.map((h, i) => (
            <View key={i} style={styles.usersHistoryRow}>
              <Text style={styles.usersHistoryMsg}>{h.msg}</Text>
              <Text style={styles.usersHistoryTime}>{h.time}</Text>
            </View>
          ))}
          <Text style={styles.usersHistoryTitle}>Yesterday</Text>
        </ScrollView>
      )}

      {/* Bottom navigation bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={
            activeTab === "Dashboard" ? styles.navBtnActive : styles.navBtn
          }
          onPress={() => setActiveTab("Dashboard")}
        >
          <MaterialCommunityIcons
            name="home"
            size={32}
            color={activeTab === "Dashboard" ? "#6c63b5" : "#222"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "Users" ? styles.navBtnActive : styles.navBtn}
          onPress={() => setActiveTab("Users")}
        >
          <MaterialCommunityIcons
            name="account"
            size={32}
            color={activeTab === "Users" ? "#6c63b5" : "#222"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}>
          <MaterialCommunityIcons name="qrcode-scan" size={32} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}>
          <MaterialCommunityIcons name="bell" size={32} color="#222" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a6a6e7",
    paddingTop: 0,
  },
  appbar: {
    backgroundColor: "#a6a6e7",
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
    top: 35,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
    minWidth: 90,
    paddingVertical: 4,
  },
  usersOrdersDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  usersOrdersDropdownItemText: {
    fontSize: 13,
    color: "#222",
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
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    width: 180,
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
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  usersOrdersSmallValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  usersOrdersDropdownBtn: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
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
    backgroundColor: "#a6a6e7",
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
});
