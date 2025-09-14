

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../screens/TabBarScreen';
import QRCodeModal from '../components/QRCodeModal';
import { fetchQRCodes, createQRCode } from '../services/qrcodeService';
import { useRouter } from 'expo-router';

export default function QRCodeScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('Week');
  const [qrcodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const restaurantId = 1; // TODO: get from context or props

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const data = await fetchQRCodes(restaurantId);
      setQRCodes(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load QR codes');
    }
    setLoading(false);
  };

  const handleAddQRCode = async ({ name }) => {
    setSaving(true);
    try {
      await createQRCode({ name, restaurantId });
      setShowModal(false);
      loadQRCodes();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add QR code');
    }
    setSaving(false);
  };

  const handleQRCodePress = (qrcode) => {
    // Use router.push with params (id, name)
    router.push({
      pathname: '/QRCodeOrdersScreen',
      params: { id: qrcode.id, name: qrcode.name },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>QR Code Generator{"\n"}/ Statistics</Text>
        <View style={styles.qrWrapper}>
          <MaterialCommunityIcons name="qrcode" size={180} color="#19171d" style={styles.qrIcon} />
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+</Text>
          <Text style={styles.addBtnLabel}>New QR Code</Text>
        </TouchableOpacity>
        <View style={styles.statsRow}>
          <View style={styles.dropdownFake}>
            <Text style={styles.dropdownText}>{selectedDate}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#7b6eea" />
          </View>
          <Text style={styles.statsText}>No of Customers today : <Text style={styles.statsNum}>50</Text></Text>
        </View>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 18, marginBottom: 8 }}>QR Code List</Text>
        {loading ? <ActivityIndicator color="#6c63b5" /> : (
          <FlatList
            data={qrcodes}
            keyExtractor={item => item.id?.toString() || item.name}
            contentContainerStyle={styles.tablesRow}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.tableBtn} onPress={() => handleQRCodePress(item)}>
                <Text style={styles.tableBtnText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 16 }}>No QR codes found.</Text>}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </ScrollView>
      <QRCodeModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleAddQRCode} loading={saving} />
      <TabBar activeTab="qrcodes" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8D8BEA',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 36,
    marginBottom: 18,
    textShadowColor: '#888',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrIcon: {
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  addBtn: {
    backgroundColor: '#e6e1fa',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  addBtnText: {
    fontSize: 36,
    color: '#19171d',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addBtnLabel: {
    fontSize: 20,
    color: '#19171d',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  dropdownFake: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e1fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    color: '#7b6eea',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  statsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  statsNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    opacity: 1,
  },
  tablesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
  },
  tableBtn: {
    backgroundColor: '#e6e1fa',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tableBtnText: {
    color: '#19171d',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});
