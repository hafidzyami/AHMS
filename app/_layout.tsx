import "react-native-reanimated";
import { Stack } from "expo-router";
import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence, getAuth} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
  };

const FIREBASE_APP = initializeApp(firebaseConfig);
initializeAuth(FIREBASE_APP,{
    persistence : getReactNativePersistence(ReactNativeAsyncStorage)
  })
const FIRETORE_DB = getFirestore(FIREBASE_APP)

const AppLayout = () => {  
  return (
    <Stack>
      <Stack.Screen name="(dokter)" options={{headerShown: false}}/>
      <Stack.Screen name="(paramedis)" />
      <Stack.Screen name="AHMS" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="Login" />
    </Stack>
  );
};

export default AppLayout;
