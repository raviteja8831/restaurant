import * as React from 'react';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CustomerRegisterScreen from '../screens/CustomerRegisterScreen';
import ManagerRegisterScreen from '../screens/ManagerRegisterScreen';
import AppScreenWrapper from '../components/AppScreenWrapper';

import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import FilterScreen from '../screens/FilterScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
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
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// Helper to wrap screens
function wrapScreen(Component) {
  const Wrapped = props => (
    <AppScreenWrapper>
      <Component {...props} />
    </AppScreenWrapper>
  );
  return Wrapped;
}
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
  <CustomerStackNav.Screen name="Login" component={wrapScreen(LoginScreen)} />
  <CustomerStackNav.Screen name="Register" component={wrapScreen(RegisterScreen)} />
  <CustomerStackNav.Screen name="Map" component={wrapScreen(MapScreen)} />
  <CustomerStackNav.Screen name="Profile" component={wrapScreen(ProfileScreen)} />
  <CustomerStackNav.Screen name="RestaurantDetail" component={wrapScreen(RestaurantDetailScreen)} />
  <CustomerStackNav.Screen name="Filter" component={wrapScreen(FilterScreen)} />
  <CustomerStackNav.Screen name="OrderSummary" component={wrapScreen(OrderSummaryScreen)} />
    </CustomerStackNav.Navigator>
  );
}

// Manager stack
const ManagerStackNav = createStackNavigator();
function ManagerStack() {
  return (
    <ManagerStackNav.Navigator screenOptions={{ headerShown: false }}>
  <ManagerStackNav.Screen name="ManagerDashboard" component={wrapScreen(ManagerDashboardScreen)} />
  <ManagerStackNav.Screen name="RestaurantPromo" component={wrapScreen(RestaurantPromoScreen)} />
  <ManagerStackNav.Screen name="UsersList" component={wrapScreen(UsersListScreen)} />
  <ManagerStackNav.Screen name="AddUser" component={wrapScreen(AddUserScreen)} />
  <ManagerStackNav.Screen name="QRCode" component={wrapScreen(QRCodeScreen)} />
  <ManagerStackNav.Screen name="Ratings" component={wrapScreen(RatingsScreen)} />
    </ManagerStackNav.Navigator>
  );
}

// Chef stack
const ChefStackNav = createStackNavigator();
function ChefStack() {
  return (
    <ChefStackNav.Navigator screenOptions={{ headerShown: false }}>
  <ChefStackNav.Screen name="ChefLogin" component={wrapScreen(ChefLoginScreen)} />
  <ChefStackNav.Screen name="ChefHome" component={wrapScreen(ChefHomeScreen)} />
  <ChefStackNav.Screen name="ChefProfile" component={wrapScreen(ChefProfileScreen)} />
  <ChefStackNav.Screen name="ChefMenu" component={wrapScreen(ChefMenuScreen)} />
  <ChefStackNav.Screen name="AddMenuItem" component={wrapScreen(AddMenuItemScreen)} />
  <ChefStackNav.Screen name="ChefQRCode" component={wrapScreen(ChefQRCodeScreen)} />
  <ChefStackNav.Screen name="ChefQRCodeList" component={wrapScreen(ChefQRCodeListScreen)} />
  <ChefStackNav.Screen name="ChefTransaction" component={wrapScreen(ChefTransactionScreen)} />
    </ChefStackNav.Navigator>
  );
}

const RootStack = createStackNavigator();
export default function AppNavigator() {
  return (
    <RootStack.Navigator initialRouteName="RoleSelect" screenOptions={{ headerShown: false }}>
  <RootStack.Screen name="RoleSelect" component={wrapScreen(RoleSelectScreen)} />
  <RootStack.Screen name="CustomerStack" component={CustomerStack} />
  <RootStack.Screen name="ManagerStack" component={ManagerStack} />
  <RootStack.Screen name="ChefStack" component={ChefStack} />
  <RootStack.Screen name="CustomerRegister" component={wrapScreen(CustomerRegisterScreen)} />
  <RootStack.Screen name="ManagerRegister" component={wrapScreen(ManagerRegisterScreen)} />
  <RootStack.Screen name="Login" component={wrapScreen(LoginScreen)} />
  {/* <RootStack.Screen name="ManagerLogin" component={ManagerLoginScreen} /> */}
      {/* Add other global screens if needed */}
    </RootStack.Navigator>
  );
}
