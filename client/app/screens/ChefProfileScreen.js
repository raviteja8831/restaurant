import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchChefStats, fetchChefOrders, fetchChefMessages } from '../api/chefApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiAuthToken } from '../api/api';

export default function ChefProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('chef_token');
                const user = await AsyncStorage.getItem('chef_profile');
        
        if (token) {
          setApiAuthToken(token);
        }
        const statsRes = await fetchChefStats(user ? JSON.parse(user).id : null);
        setStats(statsRes);
        const chefProfile = await AsyncStorage.getItem('chef_profile');
        setProfile(chefProfile ? JSON.parse(chefProfile) : null);
      } catch (e) {}
      setLoading(false);
    };
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Row: Back, Profile, Send */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Image source={{ uri: profile?.photoUrl || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImg} />
        <MaterialCommunityIcons name="send-outline" size={28} color="#222" />
      </View>
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator color="#7b6eea" size="large" /> : (
          <View style={styles.row}>
            {/* Number of Items */}
            <View style={styles.itemsBox}>
              <Text style={styles.itemsTitle}>Number of Items</Text>
              {stats?.menuItems?.map((item, i) => (
                <Text key={i} style={styles.itemText}> {item.name}</Text>
              ))}
            </View>
            {/* Stats */}
            <View style={styles.statsCol}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Order Completed</Text>
                <Text style={styles.statValue}>{stats?.totalOrders ?? '-'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>No of Working Days</Text>
                <Text style={styles.statValue}>{stats?.workingDays ?? '-'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Most Ordered Dish</Text>
                {stats?.mostOrdered?.map?.((dish, i) => (
                  <Text key={i} style={styles.mostOrderedText}>{dish.menuitemId}</Text>
                ))}
              </View>
            </View>
          </View>
        )}
        {/* Login Hours (placeholder) */}
        <Text style={styles.loginHours}>Login Hours : 4 Hrs</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#bcb3f7' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 16 },
  profileImg: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff', marginTop: 8, backgroundColor: '#e6e0fa' },
  scrollContent: { flexGrow: 1, flexDirection: 'column', alignItems: 'center', marginTop: 8, paddingBottom: 24 },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  itemsBox: { backgroundColor: '#e6e0fa', borderRadius: 16, padding: 16, width: 160, marginRight: 12, borderWidth: 1, borderColor: '#d1c4e9' },
  itemsTitle: { fontWeight: '700', color: '#5a4fcf', fontSize: 17, marginBottom: 10 },
  itemText: { color: '#333', fontSize: 15, marginBottom: 3, fontWeight: '500' },
  statsCol: { flex: 1, flexDirection: 'column', gap: 18 },
  statBox: { backgroundColor: '#e6e0fa', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center', marginBottom: 18, minWidth: 170, borderWidth: 1, borderColor: '#d1c4e9' },
  statLabel: { color: '#444', fontWeight: '400', fontSize: 13, marginBottom: 8, textAlign: 'center', letterSpacing: 0.2 },
  statValue: { fontSize: 100, color: '#888', fontWeight: '900', textAlign: 'center', marginBottom: 2, letterSpacing: 1 },
  mostOrderedText: { color: '#333', fontSize: 15, textAlign: 'center', fontWeight: '500', marginBottom: 2 },
  loginHours: { color: '#fff', fontWeight: '900', fontSize: 28, alignSelf: 'center', marginTop: 32, textShadowColor: '#6c63b5', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, letterSpacing: 1 },
});
