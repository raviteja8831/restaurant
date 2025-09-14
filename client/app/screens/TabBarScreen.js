import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tabs = [
  { key: 'dashboard', label: 'Home', icon: 'home', route: '/dashboard' },
  { key: 'users', label: 'Users', icon: 'account', route: '/users' },
  { key: 'qrcodes', label: 'QR', icon: 'qrcode', route: '/qrcodes' },
  { key: 'notifications', label: 'Bell', icon: 'bell', route: '/notifications' },
];

export default function TabBar({ activeTab }) {
  const router = useRouter();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#8D8BEA', borderTopLeftRadius: 32, borderTopRightRadius: 32, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, elevation: 8 }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', padding: 8, borderRadius: 24, backgroundColor: activeTab === tab.key ? 'rgba(123,110,234,0.15)' : 'transparent' }}
          onPress={() => router.replace(tab.route)}
        >
          <MaterialCommunityIcons name={tab.icon} size={32} color={activeTab === tab.key ? '#6c63b5' : '#222'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
