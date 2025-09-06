
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../screens/TabBarScreen';

const TABLES = [1, 2, 3, 4, 5, 6];

export default function QRCodeScreen() {
  const [selectedDate, setSelectedDate] = useState('Today');
  // Placeholder for dropdown, not functional
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>QR Code Generator{"\n"}/ Statistics</Text>
        <View style={styles.qrWrapper}>
          <MaterialCommunityIcons name="qrcode" size={180} color="#19171d" style={styles.qrIcon} />
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
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
        <View style={styles.tablesRow}>
          {TABLES.map((n) => (
            <View key={n} style={styles.tableBtn}>
              <Text style={styles.tableBtnText}>{`Table ${n}`}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <TabBar activeTab="qrcodes" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a6a6e7',
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
