import { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function Groups() {
  const [groups, setGroups] = useState<{ groupId: string; name: string }[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const router = useRouter();

  // Fetch groups function
  const fetchGroups = async () => {
    setIsLoading(true); // Start loading
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userEmail = await AsyncStorage.getItem('userEmail');
      setEmail(userEmail);

      if (!token || !userEmail) {
        console.error('No auth token or email found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8080/groups?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups. Status: ${response.status}`);
      }

      const data: { groupId: string; name: string }[] = await response.json();
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Refresh groups whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Return Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#EDF6F9" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Groups</Text>

        {/* Add Group Button */}
        <TouchableOpacity onPress={() => router.replace('/create-group')}>
          <Ionicons name="add-circle" size={24} color="#EDF6F9" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        // Show Loading Spinner
        <ActivityIndicator size="large" color="#EDF6F9" style={styles.loadingIndicator} />
      ) : groups.length === 0 ? (
        // No Groups Found
        <Text style={styles.noGroupsText}>No groups found</Text>
      ) : (
        // Display Groups
        <FlatList
          data={groups}
          keyExtractor={(item) => item.groupId}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/group-chat',
                  params: { groupId: item.groupId, groupName: item.name },
                })
              }
            >
              <Text style={styles.item}>{item.name || 'Unnamed Group'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006D77',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
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
  noGroupsText: {
    color: '#EDF6F9',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
