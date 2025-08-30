import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';
import { showApiError } from '../services/messagingService';
import { fetchChefOrders, fetchChefStats, fetchChefMessages, sendChefMessage } from '../api/chefApi';

export default function ChefHomeScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileVisible, setProfileVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [sendMessageVisible, setSendMessageVisible] = useState(false);
  const [sendName, setSendName] = useState('');
  const [sendMsg, setSendMsg] = useState('');

  useEffect(() => {
    async function loadData() {
        try {
          setOrders(await fetchChefOrders());
          setStats(await fetchChefStats());
          setMessages(await fetchChefMessages());
        } catch (error) {
          showApiError(error);
        }
    }
    loadData();
  }, []);

  const handleSendMessage = async () => {
    if (!sendName || !sendMsg) return;
    await sendChefMessage({ name: sendName, message: sendMsg });
    setSendName('');
    setSendMsg('');
    setSendMessageVisible(false);
  };

  return (
    <>
      <Header title={getHeading('ChefHomeScreen')} />
      <ScrollView style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#6c63b5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setProfileVisible(true)}>
          <Image source={require('../../assets/images/icon.png')} style={styles.profileImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMessageVisible(true)}>
          <MaterialCommunityIcons name="bell" size={28} color="#6c63b5" />
        </TouchableOpacity>
      </View>
      <Text style={styles.greetText}>Hi Kiran</Text>
      <Text style={styles.loginText}>Login at 8:00 AM</Text>
      <TouchableOpacity style={styles.filterIcon}>
        <MaterialCommunityIcons name="filter-variant" size={28} color="#6c63b5" />
      </TouchableOpacity>
      <Text style={styles.ordersTitle}>Your Orders</Text>
      <ScrollView style={styles.ordersScroll}>
        {orders.map((order, i) => (
          <View key={i} style={styles.orderCard}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderTable}>{order.table}</Text>
            <MaterialCommunityIcons name="cog" size={28} color="#6c63b5" style={styles.orderIcon} />
          </View>
        ))}
      </ScrollView>
      {/* Profile Modal */}
      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={() => setProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileCard}>
            <Image source={require('../../assets/images/icon.png')} style={styles.profileCircle} />
            <Text style={styles.profileName}>Kiran</Text>
            <Text style={styles.profileStat}>Total Order Completed: {stats?.totalOrders || 0}</Text>
            <Text style={styles.profileStat}>No of Working Days: {stats?.workingDays || 0}</Text>
            <Text style={styles.profileStat}>Most Ordered Dish: {stats?.mostOrderedDish || '-'}</Text>
            <Text style={styles.profileStat}>Login Hours: {stats?.loginHours || '0'} Hrs</Text>
            <TouchableOpacity style={styles.profileCloseBtn} onPress={() => setSendMessageVisible(true)}>
              <MaterialCommunityIcons name="email" size={28} color="#6c63b5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileCloseBtn} onPress={() => setProfileVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#6c63b5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Message Modal */}
      <Modal visible={messageVisible} transparent animationType="fade" onRequestClose={() => setMessageVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Message</Text>
            {messages.map((msg, i) => (
              <View key={i} style={styles.messageBox}>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageMeta}>Sent by: {msg.sender} | {msg.time}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.messageCloseBtn} onPress={() => setMessageVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#6c63b5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Send Message Modal */}
      <Modal visible={sendMessageVisible} transparent animationType="fade" onRequestClose={() => setSendMessageVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sendCard}>
            <TextInput style={styles.sendInput} placeholder="Name" value={sendName} onChangeText={setSendName} />
            <TextInput style={styles.sendMsgInput} placeholder="Message" value={sendMsg} onChangeText={setSendMsg} multiline />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <Text style={{color:'#fff'}}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageCloseBtn} onPress={() => setSendMessageVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#6c63b5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a9a1e2', paddingTop: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  profileImg: { width: 60, height: 60, borderRadius: 30 },
  greetText: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginLeft: 16 },
  loginText: { fontSize: 14, color: '#fff', marginLeft: 16, marginBottom: 8 },
  filterIcon: { position: 'absolute', right: 16, top: 80 },
  ordersTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginLeft: 16, marginTop: 16 },
  ordersScroll: { marginHorizontal: 16, marginTop: 8 },
  orderCard: { backgroundColor: '#ece9fa', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderName: { fontWeight: 'bold', color: '#6c63b5', fontSize: 15 },
  orderTable: { color: '#333', fontSize: 13 },
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
});

