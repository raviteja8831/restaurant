

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
      <QRCodeModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleAddQRCode} loading={saving} />
      <TabBar activeTab="qrcodes" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8d8bea',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    textShadowColor: '#888',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  qrIcon: {
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
    fontSize: 220,
  },
  addBtn: {
    backgroundColor: '#e6e1fa',
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  addBtnText: {
    fontSize: 48,
    color: '#19171d',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addBtnLabel: {
    fontSize: 24,
    color: '#19171d',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dropdownFake: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e1fa',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownText: {
    color: '#7b6eea',
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  statsNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    opacity: 1,
  },
  tablesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 32,
    gap: 16,
  },
  tableBtn: {
    backgroundColor: '#e6e1fa',
    borderRadius: 18,
    paddingHorizontal: 26,
    paddingVertical: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 4,
  },
  tableBtnText: {
    color: '#19171d',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
