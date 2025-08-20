import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const reviews = [
  { name: 'Sai Family', rating: 5, comment: 'Great food and service!' },
  { name: 'Ravi', rating: 4, comment: 'Nice ambience.' },
  { name: 'Priya', rating: 5, comment: 'Loved the desserts!' },
];

export default function RatingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.starBox}>
        <Text style={styles.star}>⭐</Text>
      </View>
      <Text style={styles.title}>Top Reviews</Text>
      {reviews.map((r, i) => (
        <View key={i} style={styles.reviewCard}>
          <Text style={styles.reviewName}>{r.name}</Text>
          <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
          <Text style={styles.reviewComment}>{r.comment}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7', padding: 20 },
  starBox: { alignItems: 'center', marginVertical: 20 },
  star: { fontSize: 80, color: '#ffd700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  reviewCard: { backgroundColor: '#e0c3fc', borderRadius: 15, padding: 15, marginBottom: 15 },
  reviewName: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  reviewRating: { color: '#ffd700', fontSize: 18 },
  reviewComment: { color: '#333', marginTop: 5 },
});
