import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
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
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
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
      <Tabs.Screen
        name="tes"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default ParamedisLayout;
