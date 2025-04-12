import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import MessageList from "../../components/MessageList";
import { Colors, Shadows } from "../../components/UIComponents";

const ChatRoomScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any>([]);
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch IP address
    const fetchIpAddress = async () => {
      try {
        console.log("fetching ip address");
        const response = await fetch(
          "https://astanibackend2-763033978430.asia-southeast2.run.app/IpAddress"
        );
        const data = await response.json();
        setIpAddress(data.ipaddress);
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

    return () => {
      unsub();
      KeyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    updateScrollView();
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
    if (!messageText.trim()) return;

    try {
      let roomId = getRoomId(getAuth().currentUser?.uid, params.id);
      const docRef = doc(getFirestore(), "rooms", roomId);
      const messagesRef = collection(docRef, "messages");

      setMessageText("");
      if (inputRef) inputRef?.current?.clear();

      await addDoc(messagesRef, {
        userId: getAuth().currentUser?.uid,
        text: messageText.trim(),
        photoURL: getAuth().currentUser?.photoURL,
        senderName: getAuth().currentUser?.displayName,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send message");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary} barStyle="dark-content" />

      {/* Header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowVideo(!showVideo)}
                  style={styles.videoButton}
                >
                  <MaterialCommunityIcons
                    name="video-outline"
                    size={28}
                    color={showVideo ? Colors.warning : Colors.accent}
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.accent} />
              </TouchableOpacity>

              <Image
                source={{
                  uri:
                    typeof params.photoURL === "string" ? params.photoURL : "",
                }}
                style={styles.avatarHeader}
              />
              <Text style={styles.headerName}>{params.nama}</Text>
            </View>
          ),
        }}
      />

      {/* Video Stream */}
      {showVideo && (
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: `${ipAddress}` }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={Colors.accent} />
              </View>
            )}
          />
        </View>
      )}

      {/* Message List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <View style={styles.messagesContainer}>
          <MessageList messages={messages} scrollViewRef={scrollViewRef} />
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={Colors.gray400}
              style={styles.input}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={!messageText.trim() ? Colors.gray300 : Colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  videoButton: {
    padding: 8,
  },
  avatarHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  videoContainer: {
    height: 200,
    backgroundColor: Colors.gray100,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray100,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Shadows.small,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: Colors.textPrimary,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray200,
  },
});

export default ChatRoomScreen;
