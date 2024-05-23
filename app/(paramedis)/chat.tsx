import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getAuth, signOut } from "firebase/auth";
import ChatList from "../../components/ChatList";

const chat = () => {
  const [users, setUsers] = useState<any>();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = () => {
    setRefreshing(true);
    fetchParamedis();
    setRefreshing(false);
  };

  const fetchParamedis = async () => {
    try {
      const paramedisRef = collection(getFirestore(), "dokter"); // Reference to the Firestore collection
      const snapshot = await getDocs(paramedisRef); // Get all documents from the collection
      const documentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(documentData);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  useEffect(() => {
    fetchParamedis();
  }, []);

  const renderUsersItem = (item: any) => {
    return (
      <TouchableOpacity
        className="flex flex-row justify-between mx-4 item-centers gap-3 pb-2"
        onPress={() =>
          router.push({ pathname: "/roomChat", params: item.item })
        }
      >
        <Image source={{ uri: item.item.photoURL }} height={75} width={75} />
        <View className="flex-1 gap-1">
          <View>
            <Text>{item.item.nama}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View className="mt-8">
      <View className="flex flex-row justify-between border-b-2 border-slate-400 bg-[#62C1BF]/80 h-[40px] px-4">
        <Text className="text-xl font-bold self-center">Chat</Text>
        <TouchableOpacity
          onPress={() => signOut(getAuth())}
          className="self-center"
        >
          <FontAwesome size={28} name="sign-out" color="black" />
        </TouchableOpacity>
      </View>
      <View className="pt-4 px-4 bg-[#62C1BF]/30 h-full">
        {users ? (
          <SafeAreaView>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Text> Daftar Dokter : </Text>
              <ChatList users={users} />
              {/* <FlatList
                key={"#"}
                data={users}
                renderItem={renderUsersItem}
                keyExtractor={(item) => item.id}
                nestedScrollEnabled={true}
                scrollEnabled={false}
              /> */}
            </ScrollView>
          </SafeAreaView>
        ) : (
          <View>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </View>
  );
};

export default chat;
