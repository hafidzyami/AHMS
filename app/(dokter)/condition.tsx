import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,     // Add ScrollView
  RefreshControl, // Add RefreshControl
} from "react-native";
import React, { useEffect, useState, useCallback } from "react"; // Add useCallback
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Paho from "paho-mqtt";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { router } from "expo-router";

const index = () => {
  const [data, setData] = useState<any>("");
  const [hasContact, setHasContact] = useState<boolean>(false);
  const [idParamedis, setIdParamedis] = useState<any>("");
  const [namaParamedis, setNamaParamedis] = useState<any>("");
  const [photoURLParamedis, setPhotoURLParamedis] = useState<any>("");
  const [mqttConnect, setMqttConnect] = useState<boolean>(true);
  const [pressImage, setPressImage] = useState(false);
  const [flag, setFlag] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  const handlePressIn = () => {
    if (!flag) {
      setPressImage(true);
    }
  };

  const handlePressOut = () => {
    if (!flag) {
      setPressImage(false);
    }
  };

  const checkContact = async () => {
    try {
      console.log("Checking contact status...");
      const docRef = doc(getFirestore(), "notif", "daftar");
      const docSnap = await getDoc(docRef);
      if (
        docSnap.exists() &&
        docSnap.data().idDokter === getAuth().currentUser?.uid
      ) {
        setIdParamedis(docSnap.data().idParamedis);
        setNamaParamedis(docSnap.data().namaParamedis);
        setPhotoURLParamedis(docSnap.data().photoURLParamedis);
        setHasContact(true);
      } else {
        // Reset if no matching contact found
        setHasContact(false);
        setIdParamedis("");
        setNamaParamedis("");
        setPhotoURLParamedis("");
      }
    } catch (error) {
      console.error("Error checking contact:", error);
      alert(error);
    }
  };

  // Add onRefresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Perform the refresh actions
    checkContact()
      .finally(() => {
        setRefreshing(false);
        console.log("Refresh completed");
      });
  }, []);

  useEffect(() => {
    checkContact();
    let reconnectCount = 0;
    const maxReconnects = 5;
    let reconnectTimer : any = null;
    let isConnecting = false;
    
    // Create client with unique ID (adding timestamp to prevent conflicts)
    const clientId = `ahmshafidzparamedis_${Date.now()}`;
    const client = new Paho.Client(
      "mqtt.eclipseprojects.io",
      Number(80),
      clientId
    );
    
    // Define connection options
    const connectOptions = {
      onSuccess: () => {
        console.log("MQTT Connected successfully!");
        isConnecting = false;
        reconnectCount = 0;
        setMqttConnect(false);
        try {
          client.subscribe("ahms");
        } catch (error) {
          console.error("Error subscribing to topic:", error);
        }
      },
      onFailure: (err : any) => {
        console.log("MQTT Connection failed:", err.errorMessage);
        isConnecting = false;
        handleReconnect();
      },
    };
    
    // Handle connection loss
    client.onConnectionLost = (responseObject) => {
      isConnecting = false;
      setMqttConnect(true);
      if (responseObject.errorCode !== 0) {
        console.log("MQTT Connection lost:", responseObject.errorMessage);
        handleReconnect();
      }
    };
    
    // Handle reconnection with backoff
    const handleReconnect = () => {
      if (reconnectCount < maxReconnects && !isConnecting) {
        reconnectCount++;
        const delay = Math.min(1000 * reconnectCount, 5000); // Exponential backoff up to 5 seconds
        
        console.log(`MQTT Reconnecting attempt ${reconnectCount} in ${delay}ms`);
        
        if (reconnectTimer) clearTimeout(reconnectTimer);
        
        reconnectTimer = setTimeout(() => {
          if (!isConnecting) {
            isConnecting = true;
            try {
              client.connect(connectOptions);
            } catch (e) {
              console.error("MQTT Reconnect error:", e);
              isConnecting = false;
            }
          }
        }, delay);
      } else if (reconnectCount >= maxReconnects) {
        console.log("MQTT Max reconnection attempts reached");
        setMqttConnect(false); // Show error UI instead of loading
      }
    };
    
    // Handle incoming messages
    client.onMessageArrived = (message) => {
      if (message.destinationName === "ahms") {
        try {
          const data = `${message.payloadString}`;
          setData(JSON.parse(data));
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      }
    };
    
    // Initial connection
    try {
      isConnecting = true;
      client.connect(connectOptions);
    } catch (error) {
      console.error("Initial MQTT connection error:", error);
      isConnecting = false;
      handleReconnect();
    }
    
    // Cleanup
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        if (client && client.isConnected && client.isConnected()) {
          client.disconnect();
        }
      } catch (error) {
        console.error("Error during MQTT cleanup:", error);
      }
    };
  }, []);

  return (
    <View className="mt-8 flex-1">
      <View className="flex flex-row justify-end bg-[#62C1BF]/30 h-[40px] px-4">
        <TouchableOpacity
          onPress={() => signOut(getAuth())}
          className="self-center"
        >
          <FontAwesome size={28} name="sign-out" color="black" />
        </TouchableOpacity>
      </View>
      
      {/* Wrap content in ScrollView with RefreshControl */}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#62C1BF"]} // Android
            tintColor="#62C1BF"  // iOS
          />
        }
      >
        <View className="pt-8 px-4 bg-[#62C1BF]/30 h-full">
          <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View className="flex flex-row justify-between">
              <Text className="px-1 text-4xl font-bold w-3/4 tracking-wide">
                Welcome to AHMS
              </Text>
              <Image
                source={require("../../assets/circle-logo.png")}
                style={{ width: 70, height: 70, marginTop: 0 }}
              ></Image>
            </View>
          </Pressable>
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
                        {data === "" || data.temperature < 30
                          ? "---"
                          : data.heart}
                      </Text>
                      <Text className="mx-2 text-lg font-normal text-[#ff0000] self-end">
                        bpm
                      </Text>
                    </View>
                  </View>
                  <View className="mx-auto self-center">
                    <Pressable onPress={() => setFlag(!flag)}>
                      <Image
                        source={require("../../assets/Vector 1.png")}
                        style={{ width: 130, height: 108.7, marginTop: 0 }}
                      ></Image>
                    </Pressable>
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
                      {pressImage === true
                        ? 96
                        : data === "" || data.temperature < 30
                        ? "---"
                        : data.o2}
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
                      {pressImage === true
                        ? 38
                        : data === "" || data.temperature < 30
                        ? "---"
                        : data.temperature}
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
                      <Text
                        className={`${
                          pressImage !== true
                            ? "text-xl"
                            : "text-xl"
                        } ${
                          data.condition ===
                            "Terdeteksi urgent, segera hubungi dokter!" ||
                          pressImage === true
                            ? "text-[#ff0000]"
                            : "text-[#9747ff]"
                        } font-bold self-center`}
                      >
                        {pressImage === true
                          ? "Terdeteksi urgent, segera hubungi dokter!"
                          : data === "" || data.temperature < 30
                          ? "---"
                          : data.condition}
                      </Text>
                    </View>
                  </View>
                  {hasContact && (
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "./chatRoom",
                          params: {
                            id: idParamedis,
                            nama: namaParamedis,
                            photoURL: photoURLParamedis,
                          },
                        });
                      }}
                      className="mb-4 w-1/2 h-[35px] bg-[#9747ff] flex flex-row justify-center rounded-xl self-end"
                    >
                      <Text
                        className="text-lg text-textButton font-semibold text-center text-white"
                        style={{ marginTop: 2 }}
                      >
                        Go To Chat
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Add some padding at the bottom to ensure scrollability */}
              <View className="h-20" />
            </View>
          )}
        </View>
      </ScrollView>
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