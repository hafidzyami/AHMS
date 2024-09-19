import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log("pushToken:", pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function App() {
  const [fullName, setFullName] = useState<string>("");
  const [age, setAge] = useState<any>(0);
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<any>("");
  const [weight, setWeight] = useState<any>("");
  const [bmi, setBmi] = useState<any>("");
  const [idParamedis, setIdParamedis] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    calculateBMI();
  }, [height, weight]);

  const checkNotif = async () => {
    try {
      setLoading(true)
      const docRef = doc(getFirestore(), "notif", "daftar");
      const docSnap = await getDoc(docRef);
      if (
        docSnap.exists() &&
        !docSnap.data().hasOwnProperty("idDokter") &&
        docSnap.data().hasOwnProperty("idParamedis")
      ) {
        Alert.alert(`Urgent call from ${docSnap.data().namaParamedis}`, "", [
          { text: "Decline" },
          {
            text: "Accept",
            onPress: async () => {
              const docRef = doc(getFirestore(), "notif", "daftar");
              updateDoc(docRef, {
                idDokter: getAuth().currentUser?.uid,
                namaDokter: getAuth().currentUser?.displayName,
                photoURLDokter : getAuth().currentUser?.photoURL
              });
              setIdParamedis(docSnap.data().idParamedis);
            },
          },
        ]);
      }
      else if (docSnap.exists() &&
      docSnap.data().idDokter === getAuth().currentUser?.uid &&
      docSnap.data().hasOwnProperty("idParamedis")){
        fetchPatientData(docSnap.data().idParamedis)
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (idParamedis) {
      fetchPatientData(idParamedis);
    }
  }, [idParamedis]);

  const fetchPatientData = async (idParamedis : string) => {
    try {
      setLoading(true);
      const docRef = doc(getFirestore(), "pasien", idParamedis);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.name);
        setAge(data.age);
        setHeight(data.height);
        setWeight(data.weight);
        setGender(data.gender);
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100; // converting cm to meters
      const weightInKg = parseFloat(weight);

      const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(
        2
      );
      setBmi(bmiValue);
    } else {
      setBmi("");
    }
  };

  useEffect(() => {
    checkNotif();
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View className="mt-8">
      <View className="mt-8 flex flex-row items-center justify-between px-7">
        <Text className="font-extrabold text-xl">Patient Data</Text>
        <Image
          source={require("../../assets/circle-logo.png")}
          style={{ width: 80, height: 80 }}
        ></Image>
      </View>
      <View className=" px-7 gap-5">
        {loading === true ? (
          <ActivityIndicator size="large" color="#70E2DF" />
        ) : (
          <View>
            <View className="gap-5">
              <View>
                <Text className="text-base">Fullname</Text>
                <TextInput
                  placeholder="name"
                  onChangeText={(text) => setFullName(text)}
                  editable={false}
                  value={fullName}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Age</Text>
                <TextInput
                  placeholder="age"
                  keyboardType="number-pad"
                  onChangeText={(text) => setAge(text)}
                  editable={false}
                  value={age}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Height (cm)</Text>
                <TextInput
                  placeholder="cm"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setHeight(text)}
                  editable={false}
                  value={height}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Weight (kg)</Text>
                <TextInput
                  placeholder="kg"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setWeight(text)}
                  editable={false}
                  value={weight}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">BMI</Text>
                <TextInput
                  placeholder="Auto-generated, please fill Height and Weight"
                  editable={false}
                  value={bmi}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base mb-2">Gender</Text>
                <TextInput
                  placeholder="male/female"
                  editable={false}
                  value={gender}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
