import React, { useState, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function QRCodeModal({ visible, onClose, onSave, loading }) {
  const [name, setName] = useState('');
  const qrRef = useRef();

  const handleSave = () => {
    if (!name) return;
    onSave({ name });
    // Do not close modal or clear name
  };

  const handleDownload = async () => {
    if (!qrRef.current) return;
    try {
      const uri = await qrRef.current.capture();
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(uri, '_blank');
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      alert('Failed to download QR code');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.qrRow}>
       
            <TouchableOpacity style={styles.downloadIconBtn} onPress={handleDownload}>
              <MaterialCommunityIcons name="download" size={38} color="#19171d" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Table No/ Room No"
              placeholderTextColor="#bbb"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.plusBtn} onPress={handleSave} disabled={loading}>
              <Text style={styles.plusBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#E6E1FA',
    borderRadius: 18,
    padding: 24,
    width: 360,
    minHeight: 240,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#bdb6e6',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  qrImgBox: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadIconBtn: {
    position: 'relative',
    right: 0,
    left:250,
    top: 8,
    zIndex: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',

  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    marginTop: 8,
  },
  inputLabel: {
    color: '#19171d',
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 8,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 20,
    borderWidth: 0,
    color: '#888',
    height: 48,
    fontStyle: 'italic',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 2,
  },
  plusBtn: {
    backgroundColor: '#A09CF7',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  plusBtnText: { color: '#19171d', fontWeight: 'bold', fontSize: 38 },
});
