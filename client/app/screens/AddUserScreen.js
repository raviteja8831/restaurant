import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.overlay}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Profile</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Role" value={role} onChangeText={setRole} />
        <TextInput style={styles.input} placeholder="Phone No." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(182,166,231,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#e0c3fc',
    borderRadius: 20,
    padding: 30,
    width: 300,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '100%', height: 40, backgroundColor: '#a18cd1', borderRadius: 8, marginBottom: 15, paddingHorizontal: 10, color: '#fff' },
  button: { backgroundColor: '#7b6eea', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 40, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
