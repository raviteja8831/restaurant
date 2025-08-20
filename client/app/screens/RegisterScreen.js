import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Title, useTheme, Surface } from 'react-native-paper';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Title style={styles.title}>Register As</Title>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={() => navigation.navigate('CustomerRegister')}
      >
        Customer
      </Button>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={() => navigation.navigate('ManagerRegister')}
      >
        Manager
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 2,
    textAlign: 'center',
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
});
