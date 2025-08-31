import React, { useState } from "react";
import { router } from 'expo-router';
import { Alert } from "react-native";
import { addUserByManager } from "../api/managerApi";
import FormService from "../components/formService";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Appbar, Surface } from "react-native-paper";

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

  const renderQRCodeTab = () => {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>QR Code Generator / Statistics</Text>

          {/* Large QR Code */}
          <View style={styles.qrCodeBox}>
            <MaterialCommunityIcons name="qrcode" size={120} color="#000" />
          </View>

          {/* New QR Code Button */}
          <TouchableOpacity
            style={styles.newQRButton}
            onPress={() => setShowNewQRModal(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.newQRButtonText}>New QR Code</Text>
          </TouchableOpacity>

          {/* Customer Statistics Section */}
          <View style={styles.qrStatsContainer}>
            <View style={styles.qrStatsRow}>
              <TouchableOpacity style={styles.qrPeriodButton}>
                <Text style={styles.qrPeriodButtonText}>Today</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="#000"
                />
              </TouchableOpacity>
              <View style={styles.qrCustomerCountContainer}>
                <Text style={styles.qrCustomerCountText}>
                  No of Customers today : 50
                </Text>
              </View>
            </View>

            {/* Table Buttons */}
            <View style={styles.qrTableButtons}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.qrTableButton}
                  onPress={() => handleTableClick(num)}
                >
                  <Text style={styles.qrTableButtonText}>Table {num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderNewQRModal = () => {
    return (
      <Modal
        visible={showNewQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newQRModalCard}>
            {/* Close cross icon */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
              onPress={() => setShowNewQRModal(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#222" />
            </TouchableOpacity>
            {/* Small QR Code and Download Icon */}
            <View style={styles.newQRHeader}>
              <View style={styles.smallQRCode}>
                <MaterialCommunityIcons name="qrcode" size={60} color="#000" />
              </View>
              <TouchableOpacity style={styles.downloadIcon}>
                <MaterialCommunityIcons
                  name="download"
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameInputLabel}>Name:</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Table No/ Room No"
                placeholderTextColor="#999"
                value={qrFormData.name}
                onChangeText={(text) =>
                  setQrFormData({ ...qrFormData, name: text })
                }
              />
            </View>

            {/* Plus Button */}
            <TouchableOpacity style={styles.qrPlusButton}>
              <MaterialCommunityIcons name="plus" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTableDetailModal = () => {
    if (!selectedTable) return null;

    return (
      <Modal
        visible={showTableDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTableDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tableDetailCard}>
            {/* Header */}
            <View style={styles.tableDetailHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowTableDetail(false)}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={styles.tableDetailTitle}>Table {selectedTable}</Text>
              <TouchableOpacity style={styles.weekDropdown}>
                <Text style={styles.weekDropdownText}>Week</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Transaction Summary */}
            <View style={styles.transactionSummary}>
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              <Text style={styles.transactionSummaryText}>
                Total Transaction Week : 12566
              </Text>
            </View>

            {/* Transactions Table */}
            <View style={styles.transactionsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
                  Name
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Contact
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Time</Text>
                <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  Statues
                </Text>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={20}
                  color="#fff"
                  style={{ flex: 0.5 }}
                />
              </View>

              <ScrollView
                style={styles.tableBody}
                showsVerticalScrollIndicator={false}
              >
                {tableTransactions.map((transaction, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCellText, { flex: 1.2 }]}>
                      {transaction.name}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1.5 }]}>
                      {transaction.contact}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1 }]}>
                      {transaction.time}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 0.8 }]}>
                      {transaction.amount}
                    </Text>
                    <Text
                      style={[
                        styles.tableCellText,
                        {
                          color:
                            transaction.status === "Paid"
                              ? "#90EE90"
                              : "#FFD700",
                          flex: 1,
                        },
                      ]}
                    >
                      {transaction.status}
                    </Text>
                  </View>
                ))}
                {/* Repeat data for scrolling effect */}
                {tableTransactions.map((transaction, index) => (
                  <View key={`repeat-${index}`} style={styles.tableRow}>
                    <Text style={[styles.tableCellText, { flex: 1.2 }]}>
                      {transaction.name}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1.5 }]}>
                      {transaction.contact}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1 }]}>
                      {transaction.time}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 0.8 }]}>
                      {transaction.amount}
                    </Text>
                    <Text
                      style={[
                        styles.tableCellText,
                        {
                          color:
                            transaction.status === "Paid"
                              ? "#90EE90"
                              : "#FFD700",
                          flex: 1,
                        },
                      ]}
                    >
                      {transaction.status}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {activeTab === "Dashboard" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Appbar.Header style={styles.appbar}>
            {/* Logout (power) icon at top left, like ChefHomeScreen */}
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => router.replace('/login')}>
              <MaterialCommunityIcons name="power" size={28} color="#6c63b5" />
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
              <Text style={styles.chartTitle}>Produce Sales</Text>
              {/*  <TouchableOpacity
                style={styles.ordersPeriodPill}
                onPress={() => setShowOrdersDropdown(!showOrdersDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.ordersPeriodPillText}>
                  {ordersPeriodLabel}
                </Text>
              </TouchableOpacity> */}
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
                {/* Close cross icon */}
                <TouchableOpacity
                  style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
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
      ) : activeTab === "Users" ? (
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
              <View style={[styles.addUserModalCard, { backgroundColor: '#bcb3f7' }]}> {/* purple background */}
                {/* Close cross icon */}
                <TouchableOpacity
                  style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
                  onPress={() => setAddUserModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={28} color="#222" />
                </TouchableOpacity>
                <Text style={[styles.addUserModalTitle, { color: '#222', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }]}>New Profile</Text>
                {/* Name Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: '#222', fontSize: 15, width: 80 }}>Name:</Text>
                  <TextInput
                    style={[styles.addUserInput, { backgroundColor: '#fff', flex: 1, marginBottom: 0 }]}
                    value={addUserForm.name}
                    onChangeText={text => setAddUserForm({ ...addUserForm, name: text })}
                    placeholder="Enter name"
                    placeholderTextColor="#888"
                  />
                </View>
                {/* Password Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: '#222', fontSize: 15, width: 80 }}>Password:</Text>
                  <TextInput
                    style={[styles.addUserInput, { backgroundColor: '#fff', flex: 1, marginBottom: 0 }]}
                    value={addUserForm.password}
                    onChangeText={text => setAddUserForm({ ...addUserForm, password: text })}
                    placeholder="Enter password"
                    placeholderTextColor="#888"
                    secureTextEntry
                  />
                </View>
                {/* Role Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: '#222', fontSize: 15, width: 80 }}>Role:</Text>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 6, height: 40, justifyContent: 'center' }}>
                      <TouchableOpacity
                        style={{ paddingHorizontal: 10, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        onPress={() => setAddUserForm({ ...addUserForm, showRoleDropdown: !addUserForm.showRoleDropdown })}
                      >
                        <Text style={{ color: '#222', fontSize: 15 }}>{addUserForm.role}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#222" />
                      </TouchableOpacity>
                      {addUserForm.showRoleDropdown && (
                        <View style={{ backgroundColor: '#fff', borderRadius: 6, position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10, elevation: 10 }}>
                          {['Chef', 'Manager'].map(role => (
                            <TouchableOpacity
                              key={role}
                              style={{ padding: 10 }}
                              onPress={() => setAddUserForm({ ...addUserForm, role, showRoleDropdown: false })}
                            >
                              <Text style={{ color: '#222', fontSize: 15 }}>{role}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {/* Phone Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                  <Text style={{ color: '#222', fontSize: 15, width: 80 }}>Phone No:</Text>
                  <TextInput
                    style={[styles.addUserInput, { backgroundColor: '#fff', flex: 1, marginBottom: 0 }]}
                    value={addUserForm.phone}
                    onChangeText={text => setAddUserForm({ ...addUserForm, phone: text })}
                    placeholder="Enter phone number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                  />
                </View>
                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.addUserSaveBtn, { backgroundColor: '#a9a1e2', width: 80, alignSelf: 'flex-start' }]}
                  onPress={async () => {
                    setAddUserLoading(true);
                    try {
                      const payload = {
                        firstname: addUserForm.name,
                        lastname: "",
                        password: addUserForm.password,
                        role_id: addUserForm.role === "Chef" ? 2 : 1,
                        phone: addUserForm.phone,
                        restaurant_id: '33', // Assuming restaurant_id is 1 for demo
                      };
                      await addUserByManager(payload);
                      setAddUserModal(false);
                      setAddUserForm({ name: "", password: "", role: "Chef", phone: "", showRoleDropdown: false });
                      Alert.alert("Success", "User added successfully");
                    } catch (err) {
                      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to add user");
                    }
                    setAddUserLoading(false);
                  }}
                  disabled={addUserLoading}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{addUserLoading ? "Saving..." : "Save"}</Text>
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
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                >
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={[styles.usersOrdersSmallValue, { fontSize: 20 }]}
                    >
                      {ordersPeriodValue}
                    </Text>
                    <View style={{ position: "relative", marginLeft: 8 }}>
                      <TouchableOpacity
                        style={[
                          styles.usersOrdersDropdownBtn,
                          { backgroundColor: "#e8e8e8", minWidth: 70 },
                        ]}
                        onPress={() =>
                          setShowOrdersDropdown(!showOrdersDropdown)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.usersOrdersSmallLabel,
                            { color: "#666" },
                          ]}
                        >
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
      ) : (
        renderQRCodeTab()
      )}

      {renderNewQRModal()}
      {renderTableDetailModal()}

      {/* Bottom navigation bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={activeTab === "Dashboard" ? styles.navBtnActive : styles.navBtn}
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
        <TouchableOpacity
          style={activeTab === "QRCode" ? styles.navBtnActive : styles.navBtn}
          onPress={() => setActiveTab("QRCode")}
        >
          <MaterialCommunityIcons
            name="qrcode"
            size={32}
            color={activeTab === "QRCode" ? "#6c63b5" : "#222"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "Notifications" ? styles.navBtnActive : styles.navBtn}
          onPress={() => setActiveTab("Notifications")}
        >
          <View style={styles.notificationContainer}>
            <MaterialCommunityIcons name="bell" size={32} color={activeTab === "Notifications" ? "#6c63b5" : "#222"} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>1</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // QR Code Tab Styles
  qrContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#a6a6e7",
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
});
