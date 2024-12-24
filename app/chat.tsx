import { useEffect, useState, useRef } from 'react';
import { Text, View, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const receiverEmail = params?.friendEmail || 'Unknown';

  // Reference for FlatList to control scrolling
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const senderEmail = await AsyncStorage.getItem('userEmail');

        if (!token || !senderEmail || !receiverEmail || receiverEmail === 'Unknown') {
          console.error('Missing required information');
          return;
        }

        console.log('Fetching messages for:', receiverEmail);

        const response = await fetch(`http://localhost:8080/messages?friend=${receiverEmail}`, {
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

    fetchUserEmail();  // Fetch user email
    fetchMessages();   // Fetch messages after user email is set
  }, [receiverEmail]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token || !userEmail || !receiverEmail || receiverEmail === 'Unknown') {
        console.error('Missing required information');
        return;
      }

      const response = await fetch('http://localhost:8080/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail: receiverEmail,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage: Message = await response.json();
      setMessages((prev) => [...prev, sentMessage]); // Add the new message to the list
      setNewMessage('');

      // Scroll to the bottom directly after a new message is sent
      flatListRef.current?.scrollToEnd({ animated: false });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Chat Name */}
          <Text style={styles.title}>{receiverEmail}</Text>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef} // Reference for scrolling
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isMyMessage = item.senderEmail === userEmail;
            return (
              <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.friendMessage]}>
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
  container: {
    flex: 1,
    backgroundColor: '#006D77',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
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