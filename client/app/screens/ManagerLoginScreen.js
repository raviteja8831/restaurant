import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ManagerLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [labCode, setLabCode] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phn. Number"
        placeholderTextColor="#fff"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="Lab. No. / Code"
        placeholderTextColor="#fff"
        value={labCode}
        onChangeText={setLabCode}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('ManagerDashboard')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b6a6e7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#a18cd1',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7b6eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
