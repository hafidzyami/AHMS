import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { getRoomId } from "../utils/common";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Colors, Shadows } from "../components/UIComponents";
import { Ionicons } from "@expo/vector-icons";

const ChatItem = ({ user }: any) => {
  const [lastMessages, setLastMessage] = useState<any>(undefined);

  useEffect(() => {
    let roomId = getRoomId(getAuth().currentUser?.uid, user.id);
    const docRef = doc(getFirestore(), "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages = snapshot.docs.map((doc) => {
        return doc.data();
      });
      setLastMessage(allMessages[0] ? allMessages[0] : null);
    });

    return unsub;
  }, []);

  const renderLastMessage = () => {
    if (typeof lastMessages == "undefined") return "Loading...";
    if (lastMessages) {
      if (getAuth().currentUser?.uid === lastMessages.userId)
        return "You: " + lastMessages.text;
      return lastMessages.text;
    } else {
      return "No messages yet";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";

    const milliseconds =
      timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1e6);
    const messageDate = new Date(milliseconds);
    const today = new Date();

    // Check if message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return `${messageDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${messageDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    // Check if message is from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise return date
    return `${messageDate.getDate().toString().padStart(2, "0")}/${(
      messageDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: getAuth().currentUser?.displayName?.startsWith("dr.")
            ? "./chatRoom"
            : "./roomChat",
          params: user,
        })
      }
    >
      {/* User Avatar */}
      <Image source={{ uri: user.photoURL }} style={styles.avatar} />

      {/* Chat Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameTimeContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {user.nama}
          </Text>
          {lastMessages && (
            <Text style={styles.time}>
              {formatDate(lastMessages.createdAt)}
            </Text>
          )}
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {renderLastMessage()}
          </Text>

          {/* Chat Indicators (optional) */}
          {false && (
            <Ionicons name="chevron-forward" size={16} color={Colors.gray300} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
});

export default ChatItem;
