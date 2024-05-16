import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ChatRoomHeader = ({ user, router }: any) => {
  const name = `${user.nama}`;
  return (
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: false,
        headerRight: () => (
          <View className="flex flex-row items-center gap-x-4">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons
                name="video-outline"
                size={45}
                color="green"
              />
            </TouchableOpacity>
          </View>
        ),
        headerLeft: () => (
          <View className="flex flex-row items-center gap-x-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            <Image
              source={{ uri: user.photoURL }}
              height={50}
              width={50}
              borderRadius={50}
            />
            <Text className="text-xl font-bold">D{name.substring(1)}</Text>
          </View>
        ),
      }}
    />
  );
};

export default ChatRoomHeader;
