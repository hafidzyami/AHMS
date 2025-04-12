import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { Colors, Shadows } from "../components/UIComponents";

const MessageItem = ({ message }: any) => {
  const isCurrentUser = getAuth().currentUser?.uid === message?.userId;

  // Format timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const milliseconds =
      timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1e6);
    const date = new Date(milliseconds);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText,
          ]}
        >
          {message?.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            isCurrentUser
              ? styles.currentUserTimeText
              : styles.otherUserTimeText,
          ]}
        >
          {formatTime(message?.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  currentUserContainer: {
    alignSelf: "flex-end",
  },
  otherUserContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20, // Space for time text
    minWidth: 80,
    ...Shadows.small,
  },
  currentUserBubble: {
    backgroundColor: Colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 10,
    position: "absolute",
    bottom: 4,
    right: 12,
  },
  currentUserTimeText: {
    color: Colors.white,
    opacity: 0.7,
  },
  otherUserTimeText: {
    color: Colors.textSecondary,
  },
});

export default MessageItem;
