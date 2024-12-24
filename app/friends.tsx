import { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons

export default function Friends() {
  const [friends, setFriends] = useState<string[]>([]); // Use string array for emails only
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await fetch('http://localhost:8080/friends', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch friends. Status: ${response.status}`);
        }

        const data: string[] = await response.json(); // Expecting an array of emails
        console.log('Fetched Emails:', data); // Log the fetched emails
        setFriends(data || []);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Icons */}
      <View style={styles.header}>
        {/* Friend Requests Icon */}
        <TouchableOpacity onPress={() => router.push('/chat')}>
          <Ionicons name="person-add" size={24} color="#EDF6F9" />
        </TouchableOpacity>
        {/* Title */}
        <Text style={styles.title}>Friends</Text>
        {/* Groups Icon */}
        <TouchableOpacity onPress={() => router.push('/chat')}>
          <Ionicons name="people" size={24} color="#EDF6F9" />
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends found</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item, index) => item || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/chat', params: { friendEmail: item } })}
            >
              <Text style={styles.item}>{item || 'Unnamed Friend'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Pressable
        style={styles.button}
        onPress={async () => {
          await AsyncStorage.removeItem('authToken'); // Clear token on logout
          router.push('/'); // Navigate to the root or login screen
        }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#006D77',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EDF6F9',
  },
  item: {
    fontSize: 16,
    padding: 10,
    fontWeight: 'bold',
    color: '#EDF6F9',
    borderBottomWidth: 1,
    borderColor: '#999',
  },
  noFriendsText: {
    color: '#EDF6F9',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#092327',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#EDF6F9',
    fontSize: 16,
  },
});