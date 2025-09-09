
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchQRCodeOrders } from './services/qrcodeService';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PERIODS = [
  { label: 'Week', value: 'week' },
  { label: 'Today', value: 'today' },
  { label: 'Month', value: 'month' },
];

export default function QRCodeOrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // qrcode is passed as a param, but objects can't be passed directly in Expo Router, so pass id, name, etc. as params
  const qrcode = {
    id: params.id,
    name: params.name,
    // add more fields if needed
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await fetchQRCodeOrders(qrcode.id, period);
        setOrders(data);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load orders');
      }
      setLoading(false);
    };
    if (qrcode.id) fetch();
  }, [period, qrcode.id]);

  const totalAmount = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/'); // fallback to home or main screen
            }
          }}
          style={{ marginRight: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.tableTitle}>{qrcode.name}</Text>
        <View style={{ flex: 1 }} />
        <View style={{ position: 'relative', zIndex: 10000 }}>
          <TouchableOpacity style={styles.periodDropdown} onPress={() => setShowPeriodDropdown(v => !v)}>
            <Text style={styles.periodText}>{PERIODS.find(p => p.value === period)?.label}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#7b6eea" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Render dropdown absolutely at the top level so it overlays all content */}
      {showPeriodDropdown && (
        <View style={[styles.periodDropdownMenu, { top: 58, right: 16, position: 'absolute', zIndex: 10000 }]}> 
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={styles.periodDropdownItem}
              onPress={() => {
                setPeriod(p.value);
                setShowPeriodDropdown(false);
              }}
            >
              <Text style={[styles.periodText, { color: period === p.value ? '#4a148c' : '#7b6eea' }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={styles.totalText}>Total Transaction {PERIODS.find(p => p.value === period)?.label} : <Text style={{ fontWeight: 'bold' }}>{totalAmount}</Text></Text>
      <View style={styles.tableHeaderRow}>
        <Text style={styles.tableHeader}>Name</Text>
        <Text style={styles.tableHeader}>Contact</Text>
        <Text style={styles.tableHeader}>Time</Text>
        <Text style={styles.tableHeader}>Amount</Text>
        <Text style={styles.tableHeader}>Status</Text>
      </View>
      {loading ? <ActivityIndicator color="#6c63b5" style={{ marginTop: 24 }} /> : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.contact}</Text>
              <Text style={styles.tableCell}>{item.time ? String(item.time).slice(11, 19) : ''}</Text>
              <Text style={styles.tableCell}>{item.amount}</Text>
              <Text style={styles.tableCell}>{item.status}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#222', textAlign: 'center', marginTop: 16 }}>No orders found.</Text>}
          style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 8, maxHeight: 340 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a6a6e7', padding: 12 },
  tableTitle: { flex: 1, fontWeight: 'bold', fontSize: 20, color: '#222', textAlign: 'center' },
  periodDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6e1fa', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  periodText: { color: '#7b6eea', fontWeight: 'bold', fontSize: 15, marginRight: 4 },
  totalText: { color: '#222', fontSize: 16, fontWeight: '500', marginBottom: 6, textAlign: 'center' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e6e1fa', borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingVertical: 6 },
  tableHeader: { flex: 1, color: '#6c63b5', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ece9fa', paddingVertical: 4 },
  // Add dropdown menu styles
  periodDropdownMenu: {
    position: 'absolute',
    top: 38,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    zIndex: 9999,
    minWidth: 110,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ece9fa',
  },
  periodDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableCell: { flex: 1, color: '#222', fontSize: 13, textAlign: 'center' },
});

// ...removed duplicate styles...
