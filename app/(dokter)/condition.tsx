import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView, // Add ScrollView
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar, // Add RefreshControl
} from "react-native";
import React, { useEffect, useState, useCallback } from "react"; // Add useCallback
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Paho from "paho-mqtt";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { router } from "expo-router";
import { Colors, Shadows } from "../../components/UIComponents";

const ConditionScreen = () => {
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
    checkContact().finally(() => {
      setRefreshing(false);
      console.log("Refresh completed");
    });
  }, []);

  useEffect(() => {
    checkContact();
    let reconnectCount = 0;
    const maxReconnects = 5;
    let reconnectTimer: any = null;
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
      onFailure: (err: any) => {
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

        console.log(
          `MQTT Reconnecting attempt ${reconnectCount} in ${delay}ms`
        );

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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(getAuth()),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Patient Monitoring</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <FontAwesome name="sign-out" size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.accent]}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.ahmsText}>AIES</Text>
            <Text style={styles.subtitleText}>
              Ambulance Integrated Emergency System
            </Text>
          </View>
          <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Image
              source={require("../../assets/circle-logo.png")}
              style={styles.logo}
            />
          </Pressable>
        </View>

        {mqttConnect ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>
              Connecting to monitoring system...
            </Text>
          </View>
        ) : (
          <View style={styles.vitalSignsContainer}>
            {/* Heart Rate Card */}
            <View style={styles.vitalCardLarge}>
              <View style={styles.vitalCardContent}>
                <View style={styles.vitalCardHeader}>
                  <Image
                    source={require("../../assets/mdi_heart-outline.png")}
                    style={styles.vitalIcon}
                  />
                  <Text
                    style={[styles.vitalTitle, { color: Colors.heartRateText }]}
                  >
                    Heart Rate
                  </Text>
                </View>
                <View style={styles.vitalValueContainer}>
                  <Text
                    style={[styles.vitalValue, { color: Colors.heartRateText }]}
                  >
                    {pressImage
                      ? "90"
                      : data === "" || data.temperature < 30
                      ? "---"
                      : data.heart}
                  </Text>
                  <Text
                    style={[styles.vitalUnit, { color: Colors.heartRateText }]}
                  >
                    bpm
                  </Text>
                </View>
              </View>
              <View style={styles.ecgContainer}>
                <Pressable onPress={() => setFlag(!flag)}>
                  <Image
                    source={require("../../assets/Vector 1.png")}
                    style={styles.ecgImage}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.vitalRowContainer}>
              {/* SpO2 Card */}
              <View
                style={[
                  styles.vitalCardSmall,
                  { backgroundColor: Colors.spo2 },
                ]}
              >
                <View style={styles.vitalCardHeader}>
                  <Image
                    source={require("../../assets/spo2.png")}
                    style={styles.vitalIcon}
                  />
                  <Text style={[styles.vitalTitle, { color: Colors.spo2Text }]}>
                    <Text style={{ fontSize: 22 }}>S</Text>
                    <Text style={{ fontSize: 16 }}>p</Text>
                    <Text style={{ fontSize: 22 }}>O</Text>
                    <Text style={{ fontSize: 16 }}>2</Text>
                  </Text>
                </View>
                <View style={styles.vitalValueContainer}>
                  <Text style={[styles.vitalValue, { color: Colors.spo2Text }]}>
                    {pressImage
                      ? "96"
                      : data === "" || data.temperature < 30
                      ? "---"
                      : data.o2}
                  </Text>
                  <Text style={[styles.vitalUnit, { color: Colors.spo2Text }]}>
                    %
                  </Text>
                </View>
              </View>

              {/* Temperature Card */}
              <View
                style={[
                  styles.vitalCardSmall,
                  { backgroundColor: Colors.temperature },
                ]}
              >
                <View style={styles.vitalCardHeader}>
                  <Image
                    source={require("../../assets/temperatur.png")}
                    style={styles.vitalIcon}
                  />
                  <Text
                    style={[
                      styles.vitalTitle,
                      { color: Colors.temperatureText },
                    ]}
                  >
                    Temperature
                  </Text>
                </View>
                <View style={styles.vitalValueContainer}>
                  <Text
                    style={[
                      styles.vitalValue,
                      { color: Colors.temperatureText },
                    ]}
                  >
                    {pressImage
                      ? "38.2"
                      : data === "" || data.temperature < 30
                      ? "---"
                      : data.temperature}
                  </Text>
                  <Text
                    style={[
                      styles.vitalUnit,
                      { color: Colors.temperatureText },
                    ]}
                  >
                    °C
                  </Text>
                </View>
              </View>
            </View>

            {/* Condition Card */}
            <View
              style={[
                styles.conditionCard,
                { backgroundColor: Colors.condition },
              ]}
            >
              <View style={styles.conditionContent}>
                <View style={styles.vitalCardHeader}>
                  <Image
                    source={require("../../assets/Vector.png")}
                    style={styles.vitalIcon}
                  />
                  <Text
                    style={[styles.vitalTitle, { color: Colors.conditionText }]}
                  >
                    Condition
                  </Text>
                </View>
                <Text
                  style={[
                    styles.conditionText,
                    {
                      color:
                        pressImage ||
                        (data &&
                          data.condition ===
                            "Terdeteksi urgent, segera hubungi dokter!")
                          ? Colors.warning
                          : Colors.conditionText,
                    },
                  ]}
                >
                  {pressImage
                    ? "Terdeteksi urgent, segera hubungi dokter!"
                    : data === "" || data.temperature < 30
                    ? "---"
                    : data.condition}
                </Text>
              </View>

              {hasContact && (
                <TouchableOpacity
                  style={styles.chatButton}
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
                >
                  <Text style={styles.chatButtonText}>Chat with Paramedic</Text>
                  <FontAwesome
                    name="wechat"
                    size={18}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Footer space */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
  },
  signOutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    ...Shadows.medium,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  ahmsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.accent,
    marginTop: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    maxWidth: 200,
  },
  logo: {
    width: 70,
    height: 70,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  vitalSignsContainer: {
    padding: 16,
  },
  vitalCardLarge: {
    flexDirection: "row",
    backgroundColor: Colors.heartRate,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.medium,
  },
  vitalCardContent: {
    flex: 1,
  },
  vitalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vitalIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  vitalTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  vitalValueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  vitalValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  vitalUnit: {
    fontSize: 16,
    marginLeft: 4,
    marginBottom: 6,
  },
  ecgContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  ecgImage: {
    width: 130,
    height: 108,
  },
  vitalRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  vitalCardSmall: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    ...Shadows.medium,
  },
  conditionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.medium,
  },
  conditionContent: {
    marginBottom: 16,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  chatButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    ...Shadows.small,
  },
  chatButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ConditionScreen;
