import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function QRCodeScreen() {
  const [qrValue, setQrValue] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Generator / Statistics</Text>
      <View style={styles.qrBox} />
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>+\nNew QR Code</Text>
      </TouchableOpacity>
      <View style={styles.otpRow}>
        {[1,2,3,4,5].map((n) => (
          <TextInput key={n} style={styles.otpBox} maxLength={1} keyboardType="number-pad" />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginVertical: 20 },
  qrBox: { width: 150, height: 150, backgroundColor: '#fff', borderRadius: 20, marginBottom: 20 },
  addBtn: { backgroundColor: '#7b6eea', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 30, marginBottom: 20 },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  otpBox: { width: 40, height: 40, backgroundColor: '#a18cd1', color: '#fff', fontSize: 22, textAlign: 'center', borderRadius: 8, marginHorizontal: 5 },
});
