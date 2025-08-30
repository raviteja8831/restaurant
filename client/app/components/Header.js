import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Header({ title, onBack, onProfile, onLogout, showProfile, showLogout }) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#6c63b5" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightIcons}>
        {showProfile && (
          <TouchableOpacity onPress={onProfile} style={styles.iconBtn}>
            Icon
          </TouchableOpacity>
        )}
        {showLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
            <MaterialCommunityIcons name="power" size={28} color="#6c63b5" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#a9a1e2' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 10 },
  profileImg: { width: 36, height: 36, borderRadius: 18 },
});
