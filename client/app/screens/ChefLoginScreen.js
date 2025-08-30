import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { chefLogin } from '../api/chefApi';
import { showApiError } from '../services/messagingService';

export default function ChefLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await chefLogin({ phone, password });
      Alert.alert('Success', 'Login successful');
      navigation.replace('ChefHome');
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone No."
        placeholderTextColor="#fff"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.fingerprint}>
        <Text style={styles.fingerprintIcon}>🔒</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
  fingerprint: {
    marginBottom: 30,
  },
  fingerprintIcon: {
    fontSize: 40,
    color: '#7b6eea',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7b6eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
