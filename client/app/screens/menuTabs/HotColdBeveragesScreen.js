import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HotColdBeveragesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hot & Cold Beverages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold' },
});
