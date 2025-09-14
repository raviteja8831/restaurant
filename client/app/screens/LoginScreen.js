import React, { useRef, useState } from 'react';
import { StyleSheet, Alert, View, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Text } from 'react-native-paper';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const router = useRouter();

  const handleOtpChange = (text, idx) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < 3) {
        otpInputs[idx + 1].current.focus();
      }
      if (!text && idx > 0) {
        otpInputs[idx - 1].current.focus();
      }
    }
  };

  React.useEffect(() => {
    if (otp.every(d => d.length === 1)) {
      handleLogin(phone, otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleLogin = async (phoneValue, otpValue) => {
    if (!phoneValue || otpValue.some(d => d.length !== 1)) {
      Alert.alert('Error', 'Please enter a valid phone and OTP');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        phone: phoneValue,
        otp: otpValue.join(''),
      });
      const user = response.data;
      const role = user?.role?.name?.toLowerCase();
      // Save token and user details using AsyncStorage (same as chef-login)
      if (user.token) {
        await AsyncStorage.setItem('auth_token', user.token);
      }
      // Save user profile (manager/chef details and restaurant details)
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
      Alert.alert('API user', JSON.stringify(user));
      if (role === 'manager') {
        router.push('/dashboard');
      } else {
        Alert.alert('Login Failed', 'Unknown user role: ' + (user?.role || 'none'));
      }
// Example: How to use the token for authenticated requests elsewhere
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const token = await AsyncStorage.getItem('auth_token');
// const response = await axios.get('http://localhost:8080/api/your-protected-route', {
//   headers: { Authorization: `Bearer ${token}` }
// });
    } catch (err) {
      Alert.alert('Login Failed', err?.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >        
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
          mode="flat"
          underlineColor="#fff"
          activeUnderlineColor="#1a237e"
        />
      </View>
      <View style={styles.inputGroup}>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={otpInputs[idx]}
              style={styles.otpBox}
              value={digit}
              onChangeText={text => handleOtpChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType={idx === 3 ? 'done' : 'next'}
              mode="flat"
              underlineColor="#fff"
              activeUnderlineColor="#1a237e"
            />
          ))}
        </View>
      </View>
      {/* No Login button, auto-submit on OTP complete */}

    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#8D8BEA",
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 25,
  },
  // Removed formSurface and formWrapper for flat design
  logo: {
    width: 180,
    height: 120,
    marginBottom: 24,
    alignSelf: 'center',
  },
  inputGroup: {
    width: 260,
    marginBottom: 22,
    alignSelf: 'center',
  },
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 18,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 0,
    marginBottom: 0,
    elevation: 0,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 210,
    marginTop: 6,
    marginBottom: 10,
    alignSelf: 'center',
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderWidth: 0,
    elevation: 0,
  },
});
