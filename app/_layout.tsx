import "react-native-reanimated";
import { Stack } from "expo-router";
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB89VBU-mgv8RgUNxkXIG-TN5OkRpmPrOo",
  authDomain: "ahms-a493d.firebaseapp.com",
  databaseURL:
    "https://ahms-a493d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ahms-a493d",
  storageBucket: "ahms-a493d.appspot.com",
  messagingSenderId: "604557704284",
  appId: "1:604557704284:web:a3c615e4f207ebade67a99",
  measurementId: "G-RX4J4PHS5T",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const FIRETORE_DB = getFirestore(FIREBASE_APP);

const AppLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(dokter)" options={{ headerShown: false }} />
      <Stack.Screen name="(paramedis)" options={{ headerShown: false }} />
      <Stack.Screen name="AIES" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="Login" />
    </Stack>
  );
};

export default AppLayout;
