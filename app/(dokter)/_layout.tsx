import { View, Text } from "react-native";
import React from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { Tabs, router } from "expo-router";
const DokterLayout = () => {
  FIREBASE_AUTH.onAuthStateChanged((user) => {
    if (!user) {
      router.replace("../AHMS");
    }
    // if (getAuth().currentUser!!.displayName!!.startsWith("UMKM")) {
    //   router.replace("../(umkm)");
    // }
  });
  return (
    <Tabs>
      <Tabs.Screen name="index" />
    </Tabs>
  );
};

export default DokterLayout;
