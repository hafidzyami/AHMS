import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Text } from "react-native";
const ParamedisLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getAuth().onAuthStateChanged((user) => {
      setIsLoading(false);
      if (!user) {
        router.replace("../AHMS");
      }
    });
  }, [])
  if (isLoading) return <Text className="pt-32">Loading...</Text>;
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ unmountOnBlur: true }}/>
      <Tabs.Screen name="chat" options={{  unmountOnBlur : true }}/>
    </Tabs>
  );
};

export default ParamedisLayout;
