import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Text } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../constants/api.constants";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
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
    if (otp.every((d) => d.length === 1)) {
      handleLogin(phone, otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleLogin = async (phoneValue, otpValue) => {
    if (!phoneValue || otpValue.some((d) => d.length !== 1)) {
      Alert.alert("Error", "Please enter a valid phone and OTP");
      return;
    }
    try {
      console.log("Logging in with phone:", phoneValue);
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        phone: phoneValue,
        otp: otpValue.join(""),
      });
      console.log("Login response:", response.data);
      const user = response.data;
      const role = user?.role?.name?.toLowerCase();
      console.log("User role:", role);

      // Save token and user details using AsyncStorage (same as chef-login)
      if (user.token) {
        await AsyncStorage.setItem("auth_token", String(user.token));
      }
      // Save user profile (manager/chef details and restaurant details)
      await AsyncStorage.setItem("user_profile", JSON.stringify(user));

      console.log("Navigating to:", role === "manager" ? "/dashboard" : "/chef-home");

      if (role === "manager") {
        router.push("/dashboard");
      } else if (role === "chef") {
        router.push("/chef-home");
      } else {
        Alert.alert(
          "Login Failed",
          "Unknown user role: " + (user?.role || "none")
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed", err?.response?.data?.message || err?.message || "Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../../assets/images/customer-login-logo.png")}
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
              onChangeText={(text) => handleOtpChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType={idx === 3 ? "done" : "next"}
              mode="flat"
              underlineColor="#fff"
              activeUnderlineColor="#1a237e"
            />
          ))}
        </View>
      </View>
      {/* No Login button, auto-submit on OTP complete */}

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Dont have an account? </Text>
        <Pressable onPress={() => {
          console.log("Register button pressed");
          router.replace("/manager-register");
        }}>
          <Text style={styles.registerLink}>Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#8D8BEA",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 25,
  },
  // Removed formSurface and formWrapper for flat design
  logo: {
    width: 180,
    height: 120,
    marginBottom: 24,
    alignSelf: "center",
  },
  inputGroup: {
    width: 260,
    marginBottom: 22,
    alignSelf: "center",
  },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    fontSize: 18,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 0,
    marginBottom: 0,
    elevation: 0,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 210,
    marginTop: 6,
    marginBottom: 10,
    alignSelf: "center",
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    fontSize: 22,
    textAlign: "center",
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderWidth: 0,
    elevation: 0,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: "#444",
  },
  registerLink: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
  },
});
