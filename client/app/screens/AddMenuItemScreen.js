import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, Surface, useTheme, Title } from 'react-native-paper';

export default function AddMenuItemScreen({ navigation }) {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const theme = useTheme();
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Title style={styles.title}>Add Menu Item</Title>
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
      />
      <TextInput
        style={styles.input}
        placeholder="Type (Veg/Non-Veg)"
        value={type}
        onChangeText={setType}
        mode="outlined"
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        mode="outlined"
      />
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={() => navigation.goBack()}
      >
        Save
      </Button>
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: 260,
    marginBottom: 20,
    alignSelf: 'center',
  },
  button: {
    borderRadius: 8,
    marginTop: 20,
    width: 180,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
