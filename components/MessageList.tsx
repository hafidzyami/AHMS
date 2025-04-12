import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import MessageItem from "./MessageItem";
import { Colors } from "../components/UIComponents";

const MessageList = ({ messages, scrollViewRef }: any) => {
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = "";
    let currentGroup: any[] = [];

    messages.forEach((message: any) => {
      if (!message.createdAt) {
        currentGroup.push(message);
        return;
      }

      const milliseconds =
        message.createdAt.seconds * 1000 +
        Math.round(message.createdAt.nanoseconds / 1e6);
      const date = new Date(milliseconds);
      const dateString = date.toDateString();

      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: [...currentGroup],
          });
        }
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: [...currentGroup],
      });
    }

    return groups;
  };

  const formatDate = (dateString: string) => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (dateString === today) {
      return "Today";
    } else if (dateString === yesterdayString) {
      return "Yesterday";
    } else {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const messageGroups = groupMessagesByDate();

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messageGroups.map((group, groupIndex) => (
        <View key={groupIndex}>
          {group.date && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(group.date)}</Text>
            </View>
          )}
          {group.messages.map((message: any, index: number) => (
            <MessageItem message={message} key={index} />
          ))}
        </View>
      ))}

      {messages.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray200,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray400,
  },
});

export default MessageList;
