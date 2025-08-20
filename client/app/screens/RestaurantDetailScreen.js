import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function RestaurantDetailScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageBanner} />
      <View style={styles.infoSection}>
        <Text style={styles.title}>Hotel Sai (3 star Hotel)</Text>
        <Text style={styles.desc}>The best place to eat in the city. Amazing ambience and food quality.</Text>
        <Text style={styles.rating}>⭐⭐⭐⭐⭐</Text>
        <Text style={styles.sectionTitle}>Menu</Text>
        <Text>- Tomato Soup
- Roti Manchurian
- Rice Platter
- Curd Rice
- Desserts</Text>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text>123 Main Street, City</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7' },
  imageBanner: {
    height: 180,
    backgroundColor: '#a18cd1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  infoSection: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  desc: { color: '#333', marginBottom: 10 },
  rating: { fontSize: 20, marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
});
