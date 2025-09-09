
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { chefLogin } from '../api/chefApi';
import { showApiError } from '../services/messagingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ChefLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await chefLogin({ phone, password });
      if (res && res.token) {
        await AsyncStorage.setItem('chef_token', res.token);
        // Optionally store chef profile as well
        await AsyncStorage.setItem('chef_profile', JSON.stringify(res.chef));
        Alert.alert('Success', 'Login successful');
        router.replace('/chef-home');
      } else {
        Alert.alert('Login failed', 'Invalid credentials');
      }
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top right language icon */}
      <TouchableOpacity style={styles.languageIcon}>
        <Image source={require('../../assets/images/localize.png')} style={{ width: 36, height: 36 }} />
      </TouchableOpacity>

      {/* Phone input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number  :</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor="#fff"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
      </View>
      {/* Password input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password  :</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor="#fff"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Fingerprint icon at bottom center */}
      <View style={styles.fingerprintWrap}>
        <TouchableOpacity style={styles.fingerprint} onPress={handleLogin}>
          <Image source={require('../../assets/images/login_thumb.png')} style={styles.fingerprintIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a59be7',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  languageIcon: {
    position: 'absolute',
    top: 32,
    right: 32,
    zIndex: 10,
  },
  thumbContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
  },
  thumbImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  inputGroup: {
    width: '85%',
    marginBottom: 32,
  },
  label: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 0,
    paddingHorizontal: 18,
    color: '#222',
    fontSize: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fingerprintWrap: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprint: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fingerprintIcon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    tintColor: '#222',
  },
});
