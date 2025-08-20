import * as React from 'react';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CustomerRegisterScreen from '../screens/CustomerRegisterScreen';
import ManagerRegisterScreen from '../screens/ManagerRegisterScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import FilterScreen from '../screens/FilterScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
// import ManagerLoginScreen from '../screens/ManagerLoginScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import RestaurantPromoScreen from '../screens/RestaurantPromoScreen';
import UsersListScreen from '../screens/UsersListScreen';
import AddUserScreen from '../screens/AddUserScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import RatingsScreen from '../screens/RatingsScreen';
import ChefLoginScreen from '../screens/ChefLoginScreen';
import ChefHomeScreen from '../screens/ChefHomeScreen';
import ChefProfileScreen from '../screens/ChefProfileScreen';
import ChefMenuScreen from '../screens/ChefMenuScreen';
import AddMenuItemScreen from '../screens/AddMenuItemScreen';
import ChefQRCodeScreen from '../screens/ChefQRCodeScreen';
import ChefQRCodeListScreen from '../screens/ChefQRCodeListScreen';
import ChefTransactionScreen from '../screens/ChefTransactionScreen';
import BillingScreen from '../screens/BillingScreen';
import TrackingScreen from '../screens/TrackingScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Role selection screen
function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.roleContainer}>
      <Text style={styles.roleTitle}>Select Role</Text>
  <TouchableOpacity style={styles.roleBtn} onPress={() => navigation.replace('CustomerStack')}><Text style={styles.roleBtnText}>Customer</Text></TouchableOpacity>
  <TouchableOpacity style={styles.roleBtn} onPress={() => navigation.replace('ManagerStack')}><Text style={styles.roleBtnText}>Manager</Text></TouchableOpacity>
      <TouchableOpacity style={styles.roleBtn} onPress={() => navigation.replace('ChefStack')}><Text style={styles.roleBtnText}>Chef</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  roleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#b6a6e7' },
  roleTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, color: '#333' },
  roleBtn: { backgroundColor: '#7b6eea', borderRadius: 8, paddingVertical: 18, paddingHorizontal: 60, marginBottom: 20 },
  roleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
});

// Customer stack
const CustomerStackNav = createStackNavigator();
function CustomerStack() {
  return (
    <CustomerStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStackNav.Screen name="Login" component={LoginScreen} />
      <CustomerStackNav.Screen name="Register" component={RegisterScreen} />
      <CustomerStackNav.Screen name="Map" component={MapScreen} />
      <CustomerStackNav.Screen name="Profile" component={ProfileScreen} />
      <CustomerStackNav.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <CustomerStackNav.Screen name="Filter" component={FilterScreen} />
      <CustomerStackNav.Screen name="OrderSummary" component={OrderSummaryScreen} />
    </CustomerStackNav.Navigator>
  );
}

// Manager stack
const ManagerStackNav = createStackNavigator();
function ManagerStack() {
  return (
    <ManagerStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ManagerStackNav.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
      <ManagerStackNav.Screen name="RestaurantPromo" component={RestaurantPromoScreen} />
      <ManagerStackNav.Screen name="UsersList" component={UsersListScreen} />
      <ManagerStackNav.Screen name="AddUser" component={AddUserScreen} />
      <ManagerStackNav.Screen name="QRCode" component={QRCodeScreen} />
      <ManagerStackNav.Screen name="Ratings" component={RatingsScreen} />
    </ManagerStackNav.Navigator>
  );
}

// Chef stack
const ChefStackNav = createStackNavigator();
function ChefStack() {
  return (
    <ChefStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ChefStackNav.Screen name="ChefLogin" component={ChefLoginScreen} />
      <ChefStackNav.Screen name="ChefHome" component={ChefHomeScreen} />
      <ChefStackNav.Screen name="ChefProfile" component={ChefProfileScreen} />
      <ChefStackNav.Screen name="ChefMenu" component={ChefMenuScreen} />
      <ChefStackNav.Screen name="AddMenuItem" component={AddMenuItemScreen} />
      <ChefStackNav.Screen name="ChefQRCode" component={ChefQRCodeScreen} />
      <ChefStackNav.Screen name="ChefQRCodeList" component={ChefQRCodeListScreen} />
      <ChefStackNav.Screen name="ChefTransaction" component={ChefTransactionScreen} />
    </ChefStackNav.Navigator>
  );
}

const RootStack = createStackNavigator();
export default function AppNavigator() {
  return (
    <RootStack.Navigator initialRouteName="RoleSelect" screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <RootStack.Screen name="CustomerStack" component={CustomerStack} />
      <RootStack.Screen name="ManagerStack" component={ManagerStack} />
      <RootStack.Screen name="ChefStack" component={ChefStack} />
      <RootStack.Screen name="CustomerRegister" component={CustomerRegisterScreen} />
      <RootStack.Screen name="ManagerRegister" component={ManagerRegisterScreen} />
      <RootStack.Screen name="Login" component={LoginScreen} />
  {/* <RootStack.Screen name="ManagerLogin" component={ManagerLoginScreen} /> */}
      {/* Add other global screens if needed */}
    </RootStack.Navigator>
  );
}
