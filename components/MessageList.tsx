import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import MessageItem from './MessageItem'

const MessageList = (messages : any) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
        {
            messages.messages.map((message : any,  index : any) => {
                return <MessageItem message={message} key={index}/>
            })
        }
    </ScrollView>
  )
}

export default MessageList