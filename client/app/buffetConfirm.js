import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const BuffetConfirm = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your buffet reservation has been confirmed!
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("BuffetTimeScreen")}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  message: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    color: "#2c3e50",
  },
  backButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BuffetConfirm;
