import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import {
  FormInput,
  PrimaryButton,
  TextButton,
} from "../components/UIComponents";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      if (userCredential.user) {
        if (userCredential.user.displayName?.startsWith("dr.")) {
          router.push("/(dokter)/");
        } else {
          router.push("/(paramedis)/");
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message || "Please check your credentials and try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FormInput
        label="Email Address"
        placeholder="username@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <FormInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextButton
        title="Forgot Password?"
        onPress={() =>
          Alert.alert("Coming Soon", "This feature is not available yet.")
        }
        style={styles.forgotPassword}
      />

      <PrimaryButton
        title="Sign In"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.signInButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  signInButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
