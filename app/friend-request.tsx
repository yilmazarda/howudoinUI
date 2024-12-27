import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type FriendRequest = {
  id: string; // id is now mandatory
  senderEmail: string;
};

export default function FriendRequestScreen() {
  const [emailToSearch, setEmailToSearch] = useState('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const router = useRouter();

  // Fetch incoming friend requests
  async function fetchFriendRequests() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/requests', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Friend Requests:', data); // Log data for debugging
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
      const response = await fetch('http://localhost:8080/friends/add', {
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

  async function acceptFriendRequest(id: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/requests/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }), // Send ID in the request body
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Friend request accepted!');
        fetchFriendRequests(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to accept friend request.');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'An error occurred while accepting the friend request.');
    }
  }

  // Reject a friend request
  async function rejectFriendRequest(id: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/requests/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id})
      });

      if (response.ok) {
        Alert.alert('Success', 'Friend request rejected!');
        fetchFriendRequests(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to reject friend request.');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'An error occurred while rejecting the friend request.');
    }
  }

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#EDF6F9" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Friend Requests</Text>
        </View>
      </View>

      {/* Send Friend Request Section */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputRowField}
          placeholder="Enter email"
          placeholderTextColor="#999"
          value={emailToSearch}
          onChangeText={setEmailToSearch}
        />
        <Pressable style={styles.inputRowButton} onPress={sendFriendRequest}>
          <Text style={styles.buttonText}>Send</Text>
        </Pressable>
      </View>

      {/* Incoming Friend Requests Section */}
      <Text style={styles.subTitle}>Incoming Requests</Text>
      {friendRequests.length === 0 ? (
        <Text style={styles.noRequestsText}>No friend requests</Text>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.item}>{item.senderEmail}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptFriendRequest(item.id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => rejectFriendRequest(item.id)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#006D77',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    marginBottom: 20,
    marginRight: 15,
    paddingHorizontal: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EDF6F9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputRowField: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  inputRowButton: {
    padding: 10,
    backgroundColor: '#092327',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#EDF6F9',
    fontSize: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EDF6F9',
    marginBottom: 10,
  },
  noRequestsText: {
    color: '#EDF6F9',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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
  item: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EDF6F9',
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
});
