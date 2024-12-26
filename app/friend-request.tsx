import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FriendRequest = {
  id: number;
  senderEmail: string;
  status: string;
};

export default function FriendRequestScreen() {
  const [emailToSearch, setEmailToSearch] = useState('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const router = useRouter();

  // Fetch incoming friend requests
  async function fetchFriendRequests() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/friend-request/incoming', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      } else {
        Alert.alert('Error', 'Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      Alert.alert('Error', 'An error occurred while fetching friend requests.');
    }
  }

  // Send a friend request
  async function sendFriendRequest() {
    if (!emailToSearch.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/friend-request/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverEmail: emailToSearch }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Friend request sent!');
        setEmailToSearch('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send friend request.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'An error occurred while sending the friend request.');
    }
  }

  // Handle friend request action (accept or reject)
  async function handleFriendRequest(requestId: number, action: 'ACCEPT' | 'REJECT') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/friend-request/handle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        Alert.alert('Success', `Friend request ${action.toLowerCase()}ed.`);
        fetchFriendRequests(); // Refresh friend requests
      } else {
        Alert.alert('Error', 'Failed to handle the friend request.');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      Alert.alert('Error', 'An error occurred while handling the friend request.');
    }
  }

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>

      {/* Send Friend Request Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter email to send request"
          value={emailToSearch}
          onChangeText={setEmailToSearch}
        />
        <Pressable style={styles.sendButton} onPress={sendFriendRequest}>
          <Text style={styles.buttonText}>Send Request</Text>
        </Pressable>
      </View>

      {/* Incoming Friend Requests Section */}
      <Text style={styles.subTitle}>Incoming Requests</Text>
      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text style={styles.requestText}>{item.senderEmail}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleFriendRequest(item.id, 'ACCEPT')}
              >
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleFriendRequest(item.id, 'REJECT')}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#006D77',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EDF6F9',
    marginBottom: 20,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  sendButton: {
    backgroundColor: '#092327',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: '#EDF6F9',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 20,
    color: '#EDF6F9',
    marginBottom: 10,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#083D43',
    borderRadius: 10,
  },
  requestText: {
    color: '#EDF6F9',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});