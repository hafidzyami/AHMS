import { View, Text, Touchable, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
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

const ChatItem = (user: any) => {
  const [lastMessages, setLastMessage] = useState<any>(undefined);
  useEffect(() => {
    let roomId = getRoomId(getAuth().currentUser?.uid, user.user.id);
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
  });

  const renderLastMessage = () => {
    if (typeof lastMessages == "undefined") return "Loading...";
    if (lastMessages) {
      if (getAuth().currentUser?.uid === lastMessages.userId)
        return "You: " + lastMessages.text;
      return lastMessages.text;
    } else {
      return "No messages yet!";
    }
  };

  const renderLastTime = () => {
    if (lastMessages) {
      const timestamp = lastMessages.createdAt;
      const milliseconds =
        timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1e6);
      const date = new Date(milliseconds);
      return `${("0" + date.getHours()).slice(-2)}:${(
        "0" + date.getMinutes()
      ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} ${(
        "0" + date.getDate()
      ).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(
        -2
      )}/${date.getFullYear()}`;
    } else {
      return "";
    }
  };
  return (
    <TouchableOpacity
      className="flex flex-row justify-between mx-4 item-centers gap-3 pb-2 mt-2 border-b-[1px]"
      onPress={() =>
        router.push({
          pathname: getAuth().currentUser?.displayName?.startsWith("dr.")
            ? "./chatRoom"
            : "./roomChat",
          params: user.user,
        })
      }
    >
      <Image source={{ uri: user.user.photoURL }} height={75} width={75} className="rounded-[100px]"/>
      <View className="flex-1 gap-1 justify-center">
        <View>
          <Text className="text-lg font-bold">{user.user.nama}</Text>
          <Text>{renderLastMessage()}</Text>
        </View>
        <Text>{renderLastTime()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
