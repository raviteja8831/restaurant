import React, { useRef, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, useTheme, Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectLoading, selectError } from '../userSlice';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const theme = useTheme();

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

  const handleLogin = async () => {
    if (phone.length === 10 && otp.every(d => d.length === 1)) {
      const resultAction = await dispatch(loginUser({ phone, otp: otp.join('') }));
      if (loginUser.fulfilled.match(resultAction)) {
        const { role } = resultAction.payload;
        if (role === 'manager') {
          navigation.replace('ManagerStack');
        } else {
          navigation.replace('CustomerStack');
        }
      } else {
        Alert.alert('Login Failed', resultAction.payload || 'Invalid credentials');
      }
    } else {
      Alert.alert('Error', 'Please enter a valid phone and OTP');
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Title style={styles.title}>Menutha Login</Title>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={10}
        mode="outlined"
        left={<TextInput.Icon icon="phone" />}
      />
      <OtpRow otp={otp} otpInputs={otpInputs} handleOtpChange={handleOtpChange} />
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
      <Button
        mode="text"
        style={styles.link}
        labelStyle={styles.linkText}
        onPress={() => navigation.navigate('Register')}
      >
        Don&#39;t have an account? Register
      </Button>
    </Surface>
  );
}

function OtpRow({ otp, otpInputs, handleOtpChange }) {
  return (
    <Surface style={styles.otpRow}>
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
        />
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 2,
    textAlign: 'center',
  },
  input: {
    width: 260,
    marginBottom: 20,
    alignSelf: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  otpBox: {
    width: 45,
    height: 45,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    marginHorizontal: 5,
    backgroundColor: undefined,
  },
  button: {
    borderRadius: 8,
    marginTop: 20,
    width: 220,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
