import { View, Text } from "react-native";
import React, { useState, useCallback, useLayoutEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../FirebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const chat = () => {
  const [messages, setMessages] = useState([]);
  useLayoutEffect(() => {
    const q = query(collection(FIRESTORE_DB, "chats"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      )
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const onSend = useCallback((messages = []) => {
    const { _id, createdAt, text, user } = messages[0];

    addDoc(collection(FIRESTORE_DB, "chats"), { _id, createdAt, text, user });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: FIREBASE_AUTH?.currentUser?.email,
        name: FIREBASE_AUTH?.currentUser?.displayName,
        avatar: FIREBASE_AUTH?.currentUser?.photoURL,
      }}
    />
  );
};

export default chat;
