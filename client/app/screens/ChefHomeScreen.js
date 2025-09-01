import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ChefHomeScreen() {
  const [showMsgModal, setShowMsgModal] = useState(false);
  // Test data as per screenshot
  const orders = [
    { name: 'Masala Dosa 03', table: 'Table No 02' },
    { name: 'Rava Dosa 05', table: 'Parcel Table' },
    { name: 'Butter Dosa 02', table: 'Table No 06' },
  ];

  return (
    <View style={styles.container}>
      {/* Absolute icons at corners */}
      <TouchableOpacity style={styles.powerIcon} onPress={() => router.replace('/login')}>
        <MaterialCommunityIcons name="power" size={28} color="#222" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.bellIcon} onPress={() => setShowMsgModal(true)}>
        <MaterialCommunityIcons name="bell-outline" size={28} color="#222" />
      </TouchableOpacity>
      {/* Message Modal */}
      <Modal visible={showMsgModal} transparent animationType="fade" onRequestClose={() => setShowMsgModal(false)}>
        <View style={styles.msgModalOverlay}>
          <View style={styles.msgModalCard}>
            <Text style={styles.msgModalTitle}>Message</Text>
            <View style={styles.msgBox}>
              <Text style={styles.msgText}>Today Meet me at 4:00 PM in Cabin</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.msgMeta}>Sent by: Mohan (Manager)</Text>
                <Text style={styles.msgMeta}>Time: 12:00 AM Wednesday</Text>
                <Text style={styles.msgMeta}>Date: 28.08.2025</Text>
              </View>
            </View>
            <View style={styles.msgBox} />
            <TouchableOpacity style={styles.msgCloseBtn} onPress={() => setShowMsgModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#222" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.profileImgRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.push('/chef-profile')}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImgLarge} />
        </TouchableOpacity>
      </View>
      {/* Name, login, filter row */}
      <View style={styles.nameRow}>
        <View>
          <Text style={styles.greetText}>Hi</Text>
          <Text style={styles.greetText}>Kiran</Text>
          <Text style={styles.loginText}>Login at 8:00 AM</Text>
        </View>
        <TouchableOpacity style={styles.filterIcon}>
          <MaterialCommunityIcons name="filter-variant" size={28} color="#1976d2" />
        </TouchableOpacity>
      </View>
      {/* Orders Title */}
      <Text style={styles.ordersTitle}>Your Orders</Text>
      {/* Orders List */}
      <View style={{ marginHorizontal: 16, marginTop: 8 }}>
        {orders.map((order, i) => (
          <View key={i} style={styles.orderCard}>
            <View>
              <Text style={styles.orderName}>{order.name}</Text>
              <Text style={styles.orderTable}>{order.table}</Text>
            </View>
            <MaterialCommunityIcons name="cog-outline" size={28} color="#222" style={styles.orderIcon} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a9a1e2', paddingTop: 24 },
  powerIcon: { position: 'absolute', top: 18, left: 24, zIndex: 10 },
  bellIcon: { position: 'absolute', top: 18, right: 24, zIndex: 10 },
  profileImgRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 32, marginBottom: 8, paddingHorizontal: 24 },
  profileImgLarge: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 32, marginTop: 4, marginBottom: 8 },
  greetText: { fontSize: 16, color: '#222', fontWeight: 'bold', lineHeight: 20 },
  loginText: { fontSize: 13, color: '#222', marginTop: 2, fontWeight: '500' },
  filterIcon: { marginLeft: 18, backgroundColor: '#ece9fa', borderRadius: 20, padding: 6 },
  ordersTitle: { fontSize: 16, color: '#222', fontWeight: 'bold', marginLeft: 16, marginTop: 24 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderName: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  orderTable: { color: '#333', fontSize: 13, marginTop: 2 },
  orderIcon: { marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  profileCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' },
  profileCircle: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  profileName: { fontWeight: 'bold', fontSize: 20, marginBottom: 8, color: '#6c63b5' },
  profileStat: { fontSize: 15, color: '#333', marginBottom: 6, textAlign: 'center' },
  profileCloseBtn: { marginTop: 12, backgroundColor: '#a9a1e2', borderRadius: 8, padding: 8, alignItems: 'center' },
  messageCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' },
  messageTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#6c63b5' },
  messageBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, width: '100%' },
  messageText: { color: '#333', fontSize: 15 },
  messageMeta: { color: '#888', fontSize: 12, marginTop: 4 },
  messageCloseBtn: { marginTop: 12, backgroundColor: '#a9a1e2', borderRadius: 8, padding: 8, alignItems: 'center' },
  sendCard: { backgroundColor: '#ece9fa', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' },
  sendInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, width: '90%', marginBottom: 8, backgroundColor: '#fff' },
  sendMsgInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, width: '90%', height: 80, marginBottom: 8, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#a9a1e2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24, marginBottom: 8 },

  // Message Modal Styles
  msgModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-start', alignItems: 'center' },
  msgModalCard: { backgroundColor: '#d6d0f7', borderRadius: 24, marginTop: 24, padding: 18, width: '92%', alignItems: 'center', elevation: 8 },
  msgModalTitle: { fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 10 },
  msgBox: { backgroundColor: '#fff', borderRadius: 12, padding: 12, width: '100%', minHeight: 60, marginBottom: 10 },
  msgText: { color: '#222', fontSize: 15, fontWeight: '500' },
  msgMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  msgCloseBtn: { marginTop: 4, backgroundColor: '#ece9fa', borderRadius: 8, padding: 8, alignItems: 'center' },
});

