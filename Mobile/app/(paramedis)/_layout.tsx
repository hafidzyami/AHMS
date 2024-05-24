import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
const ParamedisLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getAuth().onAuthStateChanged((user) => {
      setIsLoading(false);
      if (!user) {
        router.replace("../AHMS");
      }
    });
  }, []);
  if (isLoading) return <Text className="pt-32">Loading...</Text>;
  return (
    <Tabs screenOptions={{ tabBarHideOnKeyboard : true, tabBarStyle : {position : 'absolute'}}}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Patient Data",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="clipboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="condition"
        options={{
          title: "Condition",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bloodtype" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="wechat" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roomChat"
        options={{
          href: null,
          unmountOnBlur: true,
        }}
      />
    </Tabs>
  );
};

export default ParamedisLayout;
