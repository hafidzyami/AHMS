import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Paho from "paho-mqtt";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { router } from "expo-router";

const index = () => {
  const [data, setData] = useState<any>("");
  const [mqttConnect, setMqttConnect] = useState<boolean>(true);
  const [hasContact, setHasContact] = useState<any>(0);

  const [idDokter, setIdDokter] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [photoURLDokter, setPhotoURLDokter] = useState("");

  const handleContactDoctor = async () => {
    try {
      const docRef = doc(getFirestore(), "pasien", getAuth().currentUser!!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // TODO : BACKEND
        try {
          const response = await fetch("http://192.168.0.139:8000/sample", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error:", error);
          // Handle network error
        }
        try {
          const docRef = doc(getFirestore(), "notif", "daftar");
          setDoc(docRef, {
            idParamedis: getAuth().currentUser?.uid,
            namaParamedis: getAuth().currentUser?.displayName,
            photoURLParamedis: getAuth().currentUser?.photoURL,
          });
          setHasContact(1);
        } catch (errorLagi) {
          alert(errorLagi);
        }
      } else {
        // Document does not exist
        alert("Please fill patient data first!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error}`);
    }
  };

  const checkContact = async () => {
    try {
      const docRef = doc(getFirestore(), "notif", "daftar");
      const docSnap = await getDoc(docRef);
      if (
        docSnap.exists() &&
        docSnap.data().idParamedis === getAuth().currentUser?.uid &&
        !docSnap.data().hasOwnProperty("idDokter")
      ) {
        setHasContact(1);
      } else if (
        docSnap.exists() &&
        docSnap.data().idParamedis === getAuth().currentUser?.uid &&
        docSnap.data().hasOwnProperty("idDokter")
      ) {
        setNamaDokter(docSnap.data().namaDokter);
        setIdDokter(docSnap.data().idDokter);
        setPhotoURLDokter(docSnap.data().photoURLDokter);
        setHasContact(2);
      }
    } catch (error) {
      alert(error);
    }
  };

  console.log(data);

  useEffect(() => {
    checkContact();
    const client = new Paho.Client(
      "broker.hivemq.com",
      Number(8000),
      `ahmshafidzparamedis`
    );
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
        setData(JSON.parse(data));
      }
    };

    const connectOptions = {
      onSuccess: () => {
        console.log("Connected!");
        setMqttConnect(false);
        client.subscribe("ahms");
      },
      onFailure: () => {
        console.log("Failed to connect!");
        setMqttConnect(false);
      },
    };

    client.connect(connectOptions);

    return () => {
      client.disconnect();
    };
  }, []);

  useEffect(() => {});

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
        {mqttConnect === true ? (
          <ActivityIndicator size="large" />
        ) : (
          <View>
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
                      {data === "" ? "---" : data.heart}
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
                  <Text
                    style={[styles.spo2Text, styles.spo2Typo]}
                    className="mx-2"
                  >
                    <Text style={styles.s}>S</Text>
                    <Text style={styles.p}>p</Text>
                    <Text style={styles.s}>O</Text>
                    <Text style={styles.p}>2</Text>
                  </Text>
                </View>
                <View className="flex flex-row mt-4 mx-4">
                  <Text className="ml-2 text-4xl font-bold text-[#0500ff] self-center">
                    {data === "" ? "---" : data.o2}
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
                    {data === "" ? "---" : data.temperature}
                  </Text>
                  <Text className="ml-1 text-4xl font-normal text-[#ff7a00] self-center">
                    °C
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.condition} className="mt-4">
              <View className="flex flex-col justify-between mx-4 h-full">
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
                    <Text className={`${data === "" ? "text-6xl" : "text-xl"} ${data.condition === "Terdeteksi urgent, segera hubungi dokter!" ? "text-[#ff0000]" : "text-[#9747ff]"} font-bold self-center`}>
                      {data === "" ? "---" : data.condition}
                    </Text>
                  </View>
                </View>
                <View>
                {hasContact === 0 || hasContact === 1 ? (
                
                  <TouchableOpacity
                    onPress={handleContactDoctor}
                    className="mb-4 w-1/2 h-[35px] bg-[#9747ff] flex flex-row justify-center rounded-xl self-end"
                  >
                    <Text
                      className="text-lg text-textButton font-semibold text-center text-white"
                      style={{ marginTop: 2 }}
                    >
                      {hasContact === 0 ? "Contact Doctor" : "Contacting..."}
                    </Text>
                    {hasContact === 1 && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      ></ActivityIndicator>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "./roomChat",
                        params: {
                          id: idDokter,
                          photoURL: photoURLDokter,
                          nama: namaDokter,
                        },
                      });
                    }}
                    className="mb-4 w-1/2 h-[35px] bg-[#9747ff] flex flex-row justify-center rounded-xl self-end"
                  >
                    <Text
                      className="text-lg text-textButton font-semibold text-center text-white"
                    >
                      Go To Chat
                    </Text>
                    {hasContact === 1 && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      ></ActivityIndicator>
                    )}
                  </TouchableOpacity>
                )}
                </View>
              </View>
            </View>
          </View>
        )}
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
