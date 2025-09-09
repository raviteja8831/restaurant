

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function QRCodeModal({ visible, onClose, onSave, loading, imageUrl, onDownload }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name) return;
    onSave({ name });
    setName('');
  };

  // Download handler removed since imageUrl is not available at creation

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#444" />
          </TouchableOpacity>
          <View style={styles.qrRow}>
            <View style={styles.qrImgBox}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.qrImg} />
              ) : (
                <MaterialCommunityIcons name="qrcode" size={48} color="#444" />
              )}
            </View>
            <TouchableOpacity style={styles.downloadIconBtn} onPress={onDownload} disabled={!imageUrl}>
              <MaterialCommunityIcons name="download" size={28} color="#444" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Table No/ Room No"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#bbb"
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f3eaff',
    padding: 18,
    width: 260,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  qrImgBox: {
    backgroundColor: '#ece9fa',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    width: 54,
    height: 54,
  },
  qrImg: { width: 40, height: 40 },
  downloadIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    marginTop: 6,
  },
  inputLabel: {
    color: '#444',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 0,
    color: '#222',
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 2,
  },
  plusBtn: {
    backgroundColor: '#ece9fa',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  plusBtnText: { color: '#444', fontWeight: 'bold', fontSize: 24 },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'transparent',
  },
});
