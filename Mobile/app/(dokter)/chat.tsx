import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatList from "../../components/ChatList";
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
      const paramedisRef = collection(getFirestore(), "paramedis"); // Reference to the Firestore collection
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

  return (
    <View className="mt-8">
      <View className="flex flex-row justify-between border-b-2 border-slate-400 bg-white h-[40px] px-4">
        <Text className="text-xl font-bold mx-auto self-center">Chat</Text>
        <TouchableOpacity
          onPress={() => signOut(getAuth())}
          className="self-center"
        >
          <FontAwesome size={28} name="sign-out" color="black" />
        </TouchableOpacity>
      </View>
      <View className="pt-4 px-4 bg-[#fff] h-full">
        {users ? (
          <SafeAreaView>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Text className="text-lg font-bold"> Daftar Paramedis : </Text>
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
