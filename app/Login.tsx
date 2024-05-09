import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    signInWithEmailAndPassword(getAuth(), email, password)
      .then((user: any) => {
        if (user)
          if (getAuth().currentUser!!.displayName!!.substring(0, 3) == "Dr.")
            router.replace("/(dokter)/");
          else router.replace("/(paramedis)/");
      })
      .catch((err) => {
        alert(err?.message);
      });
  };

  return (
    <View className="flex flex-col gap-y-44">
      {/* <Button title={"Register"} onPress={() => router.push("/register")}/> */}
      <View className="flex flex-col gap-y-4">
        <View>
          <Text className="text-base">Email Address</Text>
          <TextInput
            placeholder="username@gmail.com"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            className="text-base py-2 border-b-2 border-gray-400"
          />
        </View>

        <View>
          <Text className="text-base mt-4">Password</Text>
          <TextInput
            placeholder="********"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            className="text-base py-2 border-b-2 border-gray-400"
          />
        </View>
        <Pressable
          onPress={() => {
            router.replace("/(dokter)/");
          }}
          className="bg-[#70E2DF] py-4 flex items-center rounded-xl"
        >
          <Text className="text-lg text-textButton font-bold">Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginScreen;
