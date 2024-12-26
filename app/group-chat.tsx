import { useEffect, useState, useRef } from 'react';
import { Text, View, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: number;
  senderEmail: string;
  content: string;
  sentAt: string;
  groupId: string;
};

export default function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>('Group Chat');
  const router = useRouter();
  const params = useLocalSearchParams();
  const groupId = params?.groupId || 'Unknown';

  // Reference for FlatList to control scrolling
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const fetchMessagesAndGroupName = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const senderEmail = await AsyncStorage.getItem('userEmail');

        if (!token || !senderEmail || !groupId || groupId === 'Unknown') {
          console.error('Missing required information');
          return;
        }

        console.log('Fetching messages for group:', groupId);

      // Fetch group name
      const groupResponse = await fetch(`http://localhost:8080/groups/${groupId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

        if (!groupResponse.ok) {
          throw new Error(`Failed to fetch group details. Status: ${groupResponse.status}`);
        }

        const groupData = await groupResponse.json();
        setGroupName(groupData.name || 'Group Chat'); // Assume the group object has a `name` property

        // Fetch messages
        const response = await fetch(`http://localhost:8080/groups/${groupId}/messages`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch messages. Status: ${response.status}`);
        }

        const data: Message[] = await response.json();
        console.log('Fetched Messages:', data);
        setMessages(data || []);

        // Scroll to the bottom directly after messages are loaded
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 0);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchUserEmail = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email); // Store the user email
    };

    fetchUserEmail();           // Fetch user email
    fetchMessagesAndGroupName(); // Fetch messages and group name
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      // Fetch the authentication token and email
      const token = await AsyncStorage.getItem('authToken');
      const senderEmail = await AsyncStorage.getItem('userEmail');
  
      // Check for missing data
      if (!token || !senderEmail || !groupId || groupId === 'Unknown') {
        console.error('Missing required information');
        return;
      }
  
      // Create the groupMessage object
      const groupMessage = {
        content: newMessage,  // Content of the message
        senderEmail,          // Sender's email (use authenticated user's email)
        sentAt: new Date().toISOString(),  // Timestamp for the message
        groupId,              // Group ID to send the message to
      };
  
      // Make the POST request to send the message
      const response = await fetch(`http://localhost:8080/groups/${groupId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,  // Include the Bearer token for authentication
          'Content-Type': 'application/json',  // Set the Content-Type as JSON
        },
        body: JSON.stringify(groupMessage),  // Send the groupMessage as JSON
      });
  
      // Handle unsuccessful responses
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        throw new Error(`Failed to send message: ${response.status}`);
      }
  
      // Handle the successful response
      const sentMessage = await response.json();  // The message returned from the backend
      setMessages((prev) => [...prev, sentMessage]);  // Add the new message to the message list
      setNewMessage('');  // Clear the input field
  
      // Scroll to the bottom of the message list after sending a message
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 0);
  
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
          {/* Chat Name */}
          <TouchableOpacity onPress={() => router.push({
          pathname: "/group-details",
          params: { groupId: groupId,
                    groupName: groupName }
        })}>
          <Text style={styles.title}>{groupName}</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef} // Reference for scrolling
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isMyMessage = item.senderEmail === userEmail;
            return (
              <View
                style={[
                  styles.messageContainer,
                  isMyMessage ? styles.myMessage : styles.friendMessage,
                ]}
              >
                {!isMyMessage && (
                  <Text style={styles.senderName}>{item.senderEmail}</Text>
                )}
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            );
          }}
          style={styles.chatContainer}
        />

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#006D77',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 10, // Add padding for better alignment
  },
  titleContainer: {
    flex: 1, // Take up the central space
    alignItems: 'center', // Center the title horizontally
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EDF6F9',
  },
  chatContainer: {
    flex: 1,
    padding: 10, // Prevent the last message from being cut off
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#092327',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5E9086',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  senderName: {
    fontSize: 12,
    color: '#EDF6F9',
    marginBottom: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#EDF6F9',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#092327',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#EDF6F9',
    fontSize: 16,
  },
});

