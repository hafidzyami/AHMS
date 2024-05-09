import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import LoginScreen from "./Login";
import RegisterScreen from "./Register";

const AfterLandingScreen = () => {
  const [signInPressed, setIsSignInPressed] = useState<boolean>(true);
  const [signUpPressed, setIsSignUpPressed] = useState<boolean>(false);
  return (
    <ScrollView
      className="flex"
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <View className="flex items-center">
        <Image
          source={require("../assets/circle-logo.png")}
          style={{ width: 150, height: 150, marginTop: 56 }}
        ></Image>
      </View>

      <View className="flex flex-row justify-between mx-8 mt-12">
        <Pressable
          onPress={() => {
            setIsSignInPressed(true);
            setIsSignUpPressed(false);
          }}
          style={{
            borderBottomWidth: signInPressed ? 4 : 0,
            borderBottomColor: signInPressed ? "#70E2DF" : "transparent",
          }}
          className="py-3 px-12"
        >
          <Text className="text-lg text-textButton font-bold flex items-center">
            Sign-In
          </Text>
        </Pressable>
        <TouchableOpacity
          onPress={() => {
            setIsSignInPressed(false);
            setIsSignUpPressed(true);
          }}
          className="py-3 px-12"
          style={{
            borderBottomWidth: signUpPressed ? 4 : 0,
            borderBottomColor: signUpPressed ? "#70E2DF" : "transparent",
          }}
        >
          <Text className="text-lg text-textButton font-bold">Sign-Up</Text>
        </TouchableOpacity>
      </View>

      <View className="self-stretch mt-4 mx-8">
        {signInPressed ? <LoginScreen /> : <RegisterScreen />}
      </View>
    </ScrollView>
  );
};

export default AfterLandingScreen;
