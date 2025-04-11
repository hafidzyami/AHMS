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
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
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
      const userDomain = getAuth().currentUser?.email?.split("@")[1];
      const paramedisRef = collection(getFirestore(), "dokter"); // Reference to the Firestore collection
      const q = query(paramedisRef, where("domain", "==", userDomain));
      const snapshot = await getDocs(q); // Get all documents from the collection
      console.log(snapshot);
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
              <Text className="text-lg font-bold"> Daftar Dokter : </Text>
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
