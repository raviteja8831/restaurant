import React, { useState } from 'react';
import { StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, useTheme, Surface, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, selectLoading, selectError } from '../userSlice';
import { API_BASE_URL, MESSAGES } from '../constants';


export default function ManagerRegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantType, setRestaurantType] = useState('');
  const [ambiancePhoto, setAmbiancePhoto] = useState(null);
  const [logo, setLogo] = useState(null);
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const theme = useTheme();

  const typeOptions = [
    { label: 'Veg', value: 'veg' },
    { label: 'Non-Veg', value: 'non-veg' },
    { label: 'Self Service', value: 'self-service' },
    { label: 'Table Service', value: 'table-service' },
    { label: 'Both', value: 'both' },
  ];

  const pickImage = async (setter) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!firstname.trim() || !lastname.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!restaurantName.trim() || !restaurantAddress.trim() || !restaurantType) {
      Alert.alert('Error', 'Please fill all restaurant details and select a type');
      return;
    }
    // Optionally check for images
    const resultAction = await dispatch(registerUser({
      firstname,
      lastname,
      restaurantName,
      restaurantAddress,
      restaurantType,
      ambiancePhoto,
      logo,
      roleName: 'manager',
      apiUrl: API_BASE_URL,
    }));
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
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Manager Registration" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
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
                placeholder="Restaurant Name"
                value={restaurantName}
                onChangeText={setRestaurantName}
                mode="outlined"
              />
              <TextInput
                style={styles.input}
                placeholder="Restaurant Address"
                value={restaurantAddress}
                onChangeText={setRestaurantAddress}
                mode="outlined"
              />
              <Text style={styles.sectionTitle}>Restaurant Type</Text>
              <Surface style={styles.typeRow}>
                {typeOptions.map(opt => (
                  <Chip
                    key={opt.value}
                    selected={restaurantType === opt.value}
                    onPress={() => setRestaurantType(opt.value)}
                    style={[styles.typeBox, restaurantType === opt.value && styles.typeBoxActive]}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </Surface>
              <Button
                mode="outlined"
                style={styles.photoBtn}
                onPress={() => pickImage(setAmbiancePhoto)}
              >
                {ambiancePhoto ? 'Change Ambiance Photo' : 'Upload Ambiance Photo'}
              </Button>
              {ambiancePhoto && <Image source={{ uri: ambiancePhoto }} style={styles.photoPreview} />}
              <Button
                mode="outlined"
                style={styles.photoBtn}
                onPress={() => pickImage(setLogo)}
              >
                {logo ? 'Change Restaurant Logo' : 'Upload Restaurant Logo'}
              </Button>
              {logo && <Image source={{ uri: logo }} style={styles.photoPreview} />}
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, textAlign: 'center', color: '#333' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: 10, backgroundColor: 'transparent', elevation: 0 },
  typeBox: { margin: 4 },
  typeBoxActive: { borderColor: '#7b6eea', backgroundColor: '#d1c4e9' },
  photoBtn: { borderRadius: 8, marginTop: 10, marginBottom: 10, width: 200, alignSelf: 'center' },
  photoPreview: { width: 100, height: 100, borderRadius: 10, marginTop: 10, alignSelf: 'center' },
  bottomBar: { padding: 16, backgroundColor: '#a6a6e7', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  bottomButton: { borderRadius: 24, width: '100%', alignSelf: 'center', paddingVertical: 10, backgroundColor: '#7b6eea' },
  buttonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
});
