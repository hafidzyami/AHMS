import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ChatRoomHeader from "../../components/ChatRoomHeader";
import MessageList from "../../components/MessageList";
import CustomKeyboardView from "../../components/CustomKeyboardView";
import { getRoomId } from "../../utils/common";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const chatRoom = () => {
  const params = useLocalSearchParams(); //second user
  const router = useRouter();
  const [messages, setMessages] = useState<any>([]);
  const textRef = useRef("");
  const inputRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(true);

  console.log("params : ", params);

  useEffect(() => {
    // Function to fetch IP address
    const fetchIpAddress = async () => {
      try {
        console.log("fetching ip address");
        const response = await fetch(
          "https://astanibackend2-763033978430.asia-southeast2.run.app/IpAddress"
        );
        const data = await response.json();
        setIpAddress(data.ipaddress); // Set the IP address in state
        console.log("success catch ip address");
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
        Alert.alert("Error", "Failed to fetch IP address");
      }
    };

    fetchIpAddress();
    createRoomIfNotExists();
    let roomId = getRoomId(getAuth().currentUser?.uid, params.id);
    const docRef = doc(getFirestore(), "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    let unsub = onSnapshot(q, (snapshot: any) => {
      let allMessages = snapshot.docs.map((doc: any) => {
        return doc.data();
      });
      setMessages([...allMessages]);
    });

    const KeyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );

    setLoading(false);
    console.log(ipAddress);

    return () => {
      unsub();
      KeyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    updateScrollView();
    console.log(ipAddress);
  }, [messages]);

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const createRoomIfNotExists = async () => {
    let roomId = getRoomId(getAuth().currentUser?.uid, params.id);
    await setDoc(doc(getFirestore(), "rooms", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(getAuth().currentUser?.uid, params.id);
      const docRef = doc(getFirestore(), "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      textRef.current = "";
      if (inputRef) inputRef?.current?.clear();
      const newDoc = await addDoc(messagesRef, {
        userId: getAuth().currentUser?.uid,
        text: message,
        photoURL: getAuth().currentUser?.photoURL,
        senderName: getAuth().currentUser?.displayName,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err: any) {
      Alert.alert("Message", err.message);
    }
  };
  return (
    <CustomKeyboardView inChat={true}>
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: "",
            headerShadowVisible: false,
            headerRight: () => (
              <View className="flex flex-row items-center gap-x-4">
                {loading ? (
                  <ActivityIndicator size="large"></ActivityIndicator>
                ) : (
                  <TouchableOpacity onPress={() => setShowVideo(!showVideo)}>
                    <MaterialCommunityIcons
                      name="video-outline"
                      size={45}
                      color="green"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ),
            headerLeft: () => (
              <View className="flex flex-row items-center gap-x-4">
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>

                <Image
                  source={{
                    uri:
                      typeof params.photoURL === "string"
                        ? params.photoURL
                        : "",
                  }}
                  height={50}
                  width={50}
                  borderRadius={50}
                />
                <Text className="text-xl font-bold">{params.nama}</Text>
              </View>
            ),
          }}
        />
        {showVideo && (
          <View className="flex-1" style={{ height: 200 }}>
            <WebView source={{ uri: `http://${ipAddress}` }} />
          </View>
        )}

        <View className="h-3 border-b border-neutral-200"></View>
        <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
          <View className="flex-1">
            <MessageList messages={messages} scrollViewRef={scrollViewRef} />
          </View>
          <View style={{ marginBottom: 60 }} className="pt-2">
            <View className="flex-row justify-between items-center mx-3">
              <View className="flex-row justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
                <TextInput
                  ref={inputRef}
                  onChangeText={(value) => (textRef.current = value)}
                  placeholder="Type message..."
                  className="flex-1 mr-2"
                />
                <TouchableOpacity
                  className="bg-neutral-200 p-2 mr-[1px] rounded-full"
                  onPress={handleSendMessage}
                >
                  <Text>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
};

export default chatRoom;
