import {FlatList } from "react-native";
import React from "react";
import ChatItem from "./ChatItem";

const ChatList = (users: any) => {
    
  return (
        <FlatList
          key={"#"}
          data={users.users}
          renderItem={({item,index}) => <ChatItem user={item}/>}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled={true}
          scrollEnabled={false}
        />
  );
};

export default ChatList;
