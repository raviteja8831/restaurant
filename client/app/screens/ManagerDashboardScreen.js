import React, { useState } from 'react';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Surface } from 'react-native-paper';
import { fetchTables, saveTable } from '../api/tableApi';
import { useNavigation } from '@react-navigation/native';

export default function ManagerDashboardScreen() {
  // Dummy data for demonstration
  const restaurantName = 'Hotel Sai (3 Star)';
  const managerName = 'Mohan';
  const today = 'Wednesday';
  const date = '21.02.2025';
  const orders = 25;
  const tablesServed = 15;
  const customers = 30;
  const transactionAmt = '17,637';
  const reservedTables = 16;
  const nonReservedTables = 4;
  const chefLogins = 6;
  const chefLogouts = 0;

  const [tableList, setTableList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableName, setTableName] = useState('');
  const [buffetVisible, setBuffetVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const navigation = useNavigation();

  // Fetch tables from backend on mount
  React.useEffect(() => {
    const getTables = async () => {
      const tables = await fetchTables();
      setTableList(tables);
      if (tables.length > 0) setSelectedTable(tables[0].name);
    };
    getTables();
  }, []);

  // Add new table to backend
  const handleAddTable = async () => {
    if (!tableName) return;
    const newTable = { name: tableName, qrValue: tableName };
    const saved = await saveTable(newTable);
    if (saved) {
      setTableList([...tableList, saved]);
      setSelectedTable(saved.name);
      setTableName('');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={restaurantName} titleStyle={styles.appbarTitle} />
        <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} style={{marginRight: 16}}>
          <MaterialCommunityIcons name="food" size={32} color="#fff" />
        </TouchableOpacity>
      </Appbar.Header>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.todayText}>Today</Text>
          <Text style={styles.dayText}>{today}</Text>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.greetText}>Hi {managerName}</Text>
        </View>
        <TouchableOpacity style={styles.profileImg} onPress={() => setProfileVisible(true)}>
          <MaterialCommunityIcons name="account-circle" size={60} color="#7b6eea" />
        </TouchableOpacity>
      </View>
      <Surface style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Info</Text>
        <Text style={styles.infoText}>No of Orders: {orders}</Text>
        <Text style={styles.infoText}>No of Tables Served: {tablesServed}</Text>
        <Text style={styles.infoText}>No of Customer: {customers}</Text>
        <Text style={styles.infoText}>Transaction of Amt: {transactionAmt}</Text>
        <TouchableOpacity style={styles.buffetIcon} onPress={() => setBuffetVisible(true)}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#6c63b5" />
          <Text style={{color:'#6c63b5', fontWeight:'bold'}}>Buffet !</Text>
        </TouchableOpacity>
      </Surface>
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
      <Surface style={styles.statusCard}>
        <Text style={styles.statusTitle}>Chef Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Login</Text>
            <Text style={styles.statusValue}>{chefLogins}</Text>
          </View>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Logout</Text>
            <Text style={styles.statusValue}>{chefLogouts}</Text>
          </View>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>No of Logins</Text>
            <Text style={styles.statusValue}>{chefLogins}</Text>
          </View>
        </View>
      </Surface>
      {/* Chart placeholder */}
      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>Produce sales</Text>
        <Image source={require('../../assets/images/chart.png')} style={styles.chartImg} />
      </Surface>
      {/* QR Code Generator Section */}
      <View style={styles.qrSection}>
        <Text style={styles.qrHeader}>QR Code Generator / Statistics</Text>
        <View style={styles.qrContainer}>
          <QRCode value={selectedTable || ''} size={150} />
        </View>
        <View style={styles.qrCard}>
          <QRCode value={selectedTable || ''} size={60} />
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={{fontSize: 20}}>⬇️</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Table No/ Room No"
            value={tableName}
            onChangeText={setTableName}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddTable}>
            <Text style={{fontSize: 24}}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.tableScroll, { flexDirection: 'row', overflow: 'scroll' }]}> 
          {tableList.map((table) => (
            <TouchableOpacity
              key={table._id || table.name}
              style={[styles.tableBtn, selectedTable === table.name && styles.selectedTableBtn]}
              onPress={() => setSelectedTable(table.name)}
            >
              <Text style={styles.tableBtnText}>{table.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Buffet Modal */}
      <Modal
        visible={buffetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBuffetVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Buffet Name : Breakfast Buffet</Text>
            <Text style={styles.modalText}>Items : Poori, All types of Dosa, Chow Chow Bath, Rice Bath</Text>
            <Text style={styles.modalText}>Buffet Price : 800 Rs</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setBuffetVisible(false)}>
              <Text style={{color:'#fff'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
              <MaterialCommunityIcons name="account-circle" size={80} color="#7b6eea" />
            </View>
            <Text style={styles.profileName}>{managerName}</Text>
            <Text style={styles.profilePhone}>Ph no: 9660435235</Text>
            <TouchableOpacity style={styles.profileCloseBtn} onPress={() => {/* Add logout logic here */ setProfileVisible(false);}}>
              <MaterialCommunityIcons name="power" size={28} color="#6c63b5" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Bottom navigation bar placeholder */}
      <View style={styles.bottomNav}>
  <Image source={require('../../assets/images/icon.png')} style={styles.navIcon} />
  <Image source={require('../../assets/images/react-logo.png')} style={styles.navIcon} />
  <Image source={require('../../assets/images/partial-react-logo.png')} style={styles.navIcon} />
  <Image source={require('../../assets/images/favicon.png')} style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a6a6e7', paddingTop: 0 },
  appbar: { backgroundColor: '#a6a6e7', elevation: 0 },
  appbarTitle: { fontWeight: 'bold', fontSize: 22, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerLeft: {},
  todayText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  dayText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  dateText: { fontSize: 18, color: '#fff', marginBottom: 8 },
  greetText: { fontSize: 16, color: '#fff', marginBottom: 8 },
  profileImg: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  infoCard: { margin: 10, padding: 16, borderRadius: 16, backgroundColor: '#d1c4e9', elevation: 4 },
  infoTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  infoText: { fontSize: 15, marginBottom: 4, textAlign: 'center' },
  statusCard: { margin: 10, padding: 16, borderRadius: 16, backgroundColor: '#d1c4e9', elevation: 4 },
  statusTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statusBox: { alignItems: 'center', marginHorizontal: 10 },
  statusLabel: { fontSize: 14, color: '#333' },
  statusValue: { fontSize: 18, fontWeight: 'bold', color: '#7b6eea' },
  chartCard: { margin: 10, padding: 16, borderRadius: 16, backgroundColor: '#d1c4e9', elevation: 4, alignItems: 'center' },
  chartTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  chartImg: { width: 220, height: 80, resizeMode: 'contain' },
  qrSection: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  qrHeader: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  qrContainer: { marginVertical: 10 },
  qrCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 16, alignItems: 'center', width: 250, marginBottom: 16, position: 'relative' },
  downloadBtn: { position: 'absolute', right: 16, top: 16 },
  label: { marginTop: 10, fontWeight: 'bold', color: '#6c63b5' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, width: '80%', marginTop: 6, backgroundColor: '#fff' },
  addBtn: { marginTop: 10, backgroundColor: '#a9a1e2', borderRadius: 20, padding: 8 },
  tableScroll: { marginTop: 10, maxHeight: 50 },
  tableBtn: { backgroundColor: '#ece9fa', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 18, marginHorizontal: 5 },
  selectedTableBtn: { backgroundColor: '#6c63b5' },
  tableBtnText: { color: '#6c63b5', fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#a6a6e7', padding: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  navIcon: { width: 36, height: 36, marginHorizontal: 8 },
  buffetIcon: { position: 'absolute', right: 10, top: 10, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 24, width: 300, alignItems: 'center' },
  modalTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#6c63b5' },
  modalText: { fontSize: 15, color: '#333', marginBottom: 6, textAlign: 'center' },
  modalCloseBtn: { marginTop: 12, backgroundColor: '#a9a1e2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 },
  profileCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 24, width: 300, alignItems: 'center' },
  profileCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d1c4e9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  profileName: { fontWeight: 'bold', fontSize: 18, marginBottom: 4, color: '#6c63b5' },
  profilePhone: { fontSize: 14, color: '#333', marginBottom: 16 },
  profileCloseBtn: { backgroundColor: '#a9a1e2', borderRadius: 8, padding: 10 },
  logoutText: { fontSize: 16, color: '#6c63b5', marginLeft: 8 },
});
