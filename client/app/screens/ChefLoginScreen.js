
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
        await AsyncStorage.setItem('chef_profile', JSON.stringify(res.user));
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
      <View style={styles.formContainer}>
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
  formContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#8D8BEA',

    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  languageIcon: {
    position: 'absolute',
    top: 36,
    right: 28,
    zIndex: 10,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '88%',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    paddingHorizontal: 18,
    color: '#222',
    fontSize: 21,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 0,
    borderColor: 'transparent',
    outlineWidth: 0,
    outline: 'none',
  },
  fingerprintWrap: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprint: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  fingerprintIcon: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    tintColor: '#222',
  },
});
