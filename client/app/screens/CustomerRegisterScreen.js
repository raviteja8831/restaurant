import React, { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, useTheme, Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, selectLoading, selectError } from '../userSlice';
import { API_BASE_URL, MESSAGES } from '../constants/constants';

export default function CustomerRegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const theme = useTheme();

  const handleNext = () => {
    if (!firstname.trim() || !lastname.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', MESSAGES.invalidPhone);
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    const resultAction = await dispatch(registerUser({ phone, email, firstname, lastname, roleName: 'customer', apiUrl: API_BASE_URL }));
    if (registerUser.fulfilled.match(resultAction)) {
      Alert.alert('Success', MESSAGES.registrationSuccess);
      navigation.replace('Login');
    } else {
      Alert.alert(MESSAGES.registrationFailed, resultAction.payload || MESSAGES.registrationFailed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Surface style={[styles.container, { backgroundColor: '#a6a6e7' }]}> 
        {/* <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Customer Registration" titleStyle={styles.appbarTitle} />
        </Appbar.Header> */}
        <Surface style={styles.formSurface}>
          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstname}
                onChangeText={setFirstname}
                mode="outlined"
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastname}
                onChangeText={setLastname}
                mode="outlined"
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                mode="outlined"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                mode="outlined"
              />
            </>
          )}
          {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
        </Surface>
        <Surface style={styles.bottomBar}>
          {step === 1 ? (
            <Button
              mode="contained"
              style={styles.bottomButton}
              labelStyle={styles.buttonText}
              onPress={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.bottomButton}
              labelStyle={styles.buttonText}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
          )}
        </Surface>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#a6a6e7' },
  appbar: { backgroundColor: '#a6a6e7', elevation: 0 },
  appbarTitle: { fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
  formSurface: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'transparent', elevation: 0 },
  input: { width: 260, marginBottom: 15, alignSelf: 'center', backgroundColor: '#eae6ff' },
  bottomBar: { padding: 16, backgroundColor: '#a6a6e7', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  bottomButton: { borderRadius: 24, width: '100%', alignSelf: 'center', paddingVertical: 10, backgroundColor: '#7b6eea' },
  buttonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
});
