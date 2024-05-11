import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
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
    <View>
      {users ? (
        <SafeAreaView>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Text> Daftar Paramedis : </Text>
            <ChatList users={users} />
          </ScrollView>
        </SafeAreaView>
      ) : (
        <View>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export default chat;
