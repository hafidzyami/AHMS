import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Text } from "react-native";
const DokterLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(()=>{
    getAuth().onAuthStateChanged((user) => {
      setIsLoading(false)
      if (!user) {
        router.replace("../AHMS");
      }
      else{
        if(!user?.displayName?.startsWith("dr.")){
          router.replace("../(paramedis)/")
        }
      }
    });

  }, [])
  if (isLoading) return <Text className="pt-32">Loading...</Text>;
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" options={{unmountOnBlur : true}}/>
      <Tabs.Screen name="chatRoom" options={{ href : null , unmountOnBlur : true}}/>
    </Tabs>
  );
};

export default DokterLayout;
