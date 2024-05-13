import { View, Text } from "react-native";
import React from "react";
import { getAuth } from "firebase/auth";

const MessageItem = (message: any) => {
  if (getAuth().currentUser?.uid == message?.message.userId) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 3,
          marginRight: 3,
        }}
      >
        <View style={{ width: 80 }}>
          <View
            style={{
              alignSelf: "flex-end",
              padding: 10,
              borderRadius: 8,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#CBD5E0",
            }}
          >
            <Text style={{ fontSize: 15 }}>{message?.message.text}</Text>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={{ width: 80, marginLeft: 3, marginBottom: 3 }}>
        <View
          style={{
            padding: 10,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 8,
            backgroundColor: "#EDF2F7",
            borderWidth: 1,
            borderColor: "#BEE3F8",
          }}
        >
          <Text style={{ fontSize: 15 }}>{message?.message.text}</Text>
        </View>
      </View>
    );
  }
};

export default MessageItem;
