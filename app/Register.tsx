import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { router } from "expo-router";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { Colors, FormInput, PrimaryButton } from "../components/UIComponents";
import Checkbox from "expo-checkbox";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Create user
      await createUserWithEmailAndPassword(getAuth(), email, password);

      // Add dr. prefix if isDoctor is true
      const displayName = isDoctor ? `dr. ${name}` : name;

      // Update profile
      await updateProfile(getAuth().currentUser!!, {
        displayName,
        photoURL: `https://ui-avatars.com/api/?name=${name.replace(
          /\s+/g,
          "+"
        )}&background=65A3A3&color=fff&length=1`,
      });

      const collectionName = isDoctor ? "dokter" : "paramedis";

      // Save to Firestore
      await setDoc(
        doc(getFirestore(), collectionName, getAuth().currentUser!!.uid),
        {
          id: getAuth().currentUser!!.uid,
          nama: getAuth().currentUser!!.displayName,
          telepon: getAuth().currentUser!!.phoneNumber,
          photoURL: getAuth().currentUser!!.photoURL,
          email: getAuth().currentUser!!.email,
          domain: getAuth().currentUser!!.email?.split("@")[1],
        }
      );

      Alert.alert("Success", "Registration successful!");

      // Navigate based on role
      if (isDoctor) {
        router.replace("/(dokter)/");
      } else {
        router.replace("/(paramedis)/");
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FormInput
        label="Full Name"
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
      />

      <FormInput
        label="Email Address"
        placeholder="username@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <FormInput
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <FormInput
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={isDoctor}
          onValueChange={setIsDoctor}
          color={isDoctor ? Colors.accent : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.checkboxLabel}>I am a doctor</Text>
      </View>

      <Text style={styles.disclaimer}>
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Text>

      <PrimaryButton
        title="Create Account"
        onPress={handleRegister}
        loading={isLoading}
        style={styles.registerButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  registerButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
