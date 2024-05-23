import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Paho from "paho-mqtt";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { router } from "expo-router";

const client = new Paho.Client(
  "broker.hivemq.com",
  Number(8000),
  `ahmshafidzdokter`
);

const index = () => {
  const [data, setData] = useState<any>("");
  const [hasContact, setHasContact] = useState<boolean>(false);
  const [idParamedis, setIdParamedis] = useState<any>("")
  const [namaParamedis, setNamaParamedis] = useState<any>("")
  const [photoURLParamedis, setPhotoURLParamedis] = useState<any>("")
  const checkContact = async () => {
    try {
      const docRef = doc(getFirestore(), "notif", "daftar");
      const docSnap = await getDoc(docRef);
      if (
        docSnap.exists() &&
        docSnap.data().idDokter === getAuth().currentUser?.uid
      ) {
        setIdParamedis(docSnap.data().idParamedis)
        setNamaParamedis(docSnap.data().namaParamedis)
        setPhotoURLParamedis(docSnap.data().photoURLParamedis)
        setHasContact(true);
      }
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    checkContact();
    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("Connection lost:", responseObject.errorMessage);
        client.disconnect();
        client.connect(connectOptions);
      }
    };

    client.onMessageArrived = (message) => {
      if (message.destinationName === "ahms") {
        const data = `${message.payloadString}`;
        setData(data);
      }
    };

    const connectOptions = {
      onSuccess: () => {
        console.log("Connected!");
        client.subscribe("ahms");
      },
      onFailure: () => {
        console.log("Failed to connect!");
      },
    };

    client.connect(connectOptions);

    return () => {
      client.disconnect();
    };
  }, []);

  return (
    <View className="mt-8">
      <View className="flex flex-row justify-end bg-[#62C1BF]/30 h-[40px] px-4">
        <TouchableOpacity
          onPress={() => signOut(getAuth())}
          className="self-center"
        >
          <FontAwesome size={28} name="sign-out" color="black" />
        </TouchableOpacity>
      </View>
      <View className="pt-8 px-4 bg-[#62C1BF]/30 h-full">
        <View className="flex flex-row justify-between">
          <Text className="px-1 text-4xl font-bold w-3/4 tracking-wide">
            Welcome to AHMS
          </Text>
          <Image
            source={require("../../assets/circle-logo.png")}
            style={{ width: 70, height: 70, marginTop: 0 }}
          ></Image>
        </View>
        <View style={styles.heartRate} className="mt-6">
          <View className="flex flex-row h-full">
            <View className="mx-4">
              <View className="flex flex-row mt-4">
                <Image
                  source={require("../../assets/mdi_heart-outline.png")}
                  style={{ width: 30, height: 30, marginTop: 0 }}
                ></Image>
                <Text className="mx-2 text-xl font-medium text-[#ff0000] self-center">
                  Heart Rate
                </Text>
              </View>
              <View className="flex flex-row mt-4">
                <Text className="mx-2 text-4xl font-bold text-[#ff0000] self-center">
                  {data === "" ? "---" : data}
                </Text>
                <Text className="mx-2 text-lg font-normal text-[#ff0000] self-end">
                  bpm
                </Text>
              </View>
            </View>
            <View className="mx-auto self-center">
              <Image
                source={require("../../assets/Vector 1.png")}
                style={{ width: 130, height: 108.7, marginTop: 0 }}
              ></Image>
            </View>
          </View>
        </View>
        <View className="flex flex-row justify-between">
          <View style={styles.spo2} className="mt-4">
            <View className="flex flex-row mt-4 mx-4">
              <Image
                source={require("../../assets/spo2.png")}
                style={{ width: 28, height: 28, marginTop: 0 }}
              ></Image>
              <Text style={[styles.spo2Text, styles.spo2Typo]} className="mx-2">
                <Text style={styles.s}>S</Text>
                <Text style={styles.p}>p</Text>
                <Text style={styles.s}>O</Text>
                <Text style={styles.p}>2</Text>
              </Text>
            </View>
            <View className="flex flex-row mt-4 mx-4">
              <Text className="ml-2 text-4xl font-bold text-[#0500ff] self-center">
                {data === "" ? "---" : data}
              </Text>
              <Text className="ml-1 text-4xl font-normal text-[#0500ff] self-center">
                %
              </Text>
            </View>
          </View>
          <View style={styles.temperature} className="mt-4">
            <View className="flex flex-row mt-4 mx-4">
              <Image
                source={require("../../assets/temperatur.png")}
                style={{ width: 14.3, height: 28, marginTop: 0 }}
              ></Image>
              <Text className="mx-2 text-xl font-medium text-[#ff7a00] self-center">
                Temperature
              </Text>
            </View>
            <View className="flex flex-row mt-4 mx-4">
              <Text className="ml-2 text-4xl font-bold text-[#ff7a00] self-center">
                {data === "" ? "---" : data}
              </Text>
              <Text className="ml-1 text-4xl font-normal text-[#ff7a00] self-center">
                °C
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.condition} className="mt-4">
          <View className="flex flex-row justify-between mx-4 h-full">
            <View>
              <View className="flex flex-row mt-4">
                <Image
                  source={require("../../assets/Vector.png")}
                  style={{ width: 28, height: 28, marginTop: 0 }}
                ></Image>
                <Text className="mx-3 text-2xl font-medium text-[#9747ff] self-center">
                  Condition
                </Text>
              </View>
              <View className="flex flex-row mt-4">
                <Text className="text-6xl font-bold text-[#9747ff] self-center">
                  --{/* Condition */}
                </Text>
              </View>
            </View>
            {hasContact && (<TouchableOpacity
              onPress={() => {router.push({pathname : "./chatRoom", params : {id : idParamedis, nama : namaParamedis, photoURL : photoURLParamedis} })}}
              className="my-3 w-1/2 h-[35px] bg-[#9747ff] flex flex-row justify-center rounded-xl self-end"
            >
              <Text
                className="text-lg text-textButton font-semibold text-center text-white"
                style={{ marginTop: 2 }}
              >
                Go To Chat
              </Text>
            </TouchableOpacity>)}
            
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  heartRate: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: 10,
    backgroundColor: "#ffeaea",
    width: "100%",
    height: 150,
  },
  spo2: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: 10,
    backgroundColor: "#b8fbff",
    width: "48%",
    height: 150,
  },
  temperature: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: 10,
    backgroundColor: "#f9ffb6",
    width: "48%",
    height: 150,
  },
  s: {
    fontSize: 24,
  },
  p: {
    fontSize: 16,
  },
  spo2Text: {
    width: 112,
  },
  spo2Typo: {
    textAlign: "left",
    color: "#0500ff",
    fontWeight: "500",
  },
  condition: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: 10,
    backgroundColor: "#febaff",
    width: "100%",
    height: 170,
  },
});

export default index;
