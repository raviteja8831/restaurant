import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function MapScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Map background would be here, use a MapView in real app */}
      <View style={styles.mapPlaceholder} />
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Filter')}>
          Filter
          {/* <Image source={require('../assets/filter.png')} style={styles.icon} /> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('OrderSummary')}>
          {/* <Image source={require('../assets/order.png')} style={styles.icon} /> */}
          Order Summary
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
          {/* <Image source={require('../assets/profile.png')} style={styles.icon} /> */}
          Profile
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7' },
  mapPlaceholder: { flex: 1, backgroundColor: '#e0c3fc', margin: 10, borderRadius: 20 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#b6a6e7',
  },
  iconBtn: {
    backgroundColor: '#a18cd1',
    borderRadius: 50,
    padding: 15,
  },
  icon: { width: 30, height: 30 },
});
