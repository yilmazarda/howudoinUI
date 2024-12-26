import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GroupDetails() {
  const [groupName, setGroupName] = useState<string>('Group Details');
  const [members, setMembers] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const groupId = params?.groupId || 'Unknown';

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token || !groupId || groupId === 'Unknown') {
          console.error('Missing required information');
          return;
        }

        // Fetch group details
        const groupResponse = await fetch(`http://localhost:8080/groups/${groupId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!groupResponse.ok) {
          throw new Error(`Failed to fetch group details. Status: ${groupResponse.status}`);
        }

        const groupData = await groupResponse.json();
        setGroupName(groupData.name || 'Group Details');

        // Fetch group members
        const membersResponse = await fetch(`http://localhost:8080/groups/${groupId}/members`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch group members. Status: ${membersResponse.status}`);
        }

        const membersData: string[] = await membersResponse.json();
        setMembers(membersData || []);

        // Fetch friends
        const friendsResponse = await fetch('http://localhost:8080/friends', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!friendsResponse.ok) {
          throw new Error(`Failed to fetch friends. Status: ${friendsResponse.status}`);
        }

        const friendsData: string[] = await friendsResponse.json();
        setFriends(friendsData || []);
        updateFilteredFriends(friendsData, membersData);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const updateFilteredFriends = (allFriends: string[], groupMembers: string[]) => {
    const nonMembers = allFriends.filter((friend) => !groupMembers.includes(friend));
    setFilteredFriends(nonMembers);
  };

  const addMemberToGroup = async (friendEmail: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token || !groupId || groupId === 'Unknown') {
        console.error('Missing required information');
        return;
      }

      const response = await fetch(`http://localhost:8080/groups/${groupId}/add-member`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: friendEmail }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add member. Status: ${response.status}`);
      }

      setMembers((prev) => [...prev, friendEmail]);
      updateFilteredFriends(friends, [...members, friendEmail]);
      Alert.alert('Success', `${friendEmail} has been added to the group.`);
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member to the group.');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      updateFilteredFriends(friends, members);
    } else {
      const filtered = friends
        .filter((friend) => !members.includes(friend)) // Exclude members
        .filter((friend) => friend.toLowerCase().includes(query.toLowerCase())); // Match search query
      setFilteredFriends(filtered);
    }
  };

  const renderMemberItem = ({ item }: { item: string }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberText}>{item}</Text>
    </View>
  );

  const renderFriendItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => addMemberToGroup(item)}
    >
      <Text style={styles.friendText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{groupName}</Text>
        </View>

        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Group Members</Text>
          {members.length > 0 ? (
            <FlatList
              data={members}
              keyExtractor={(item) => item}
              renderItem={renderMemberItem}
            />
          ) : (
            <Text style={styles.noMembersText}>No members in the group</Text>
          )}
        </View>

        <View style={styles.addMemberContainer}>
          <Text style={styles.sectionTitle}>Add Members</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item}
            renderItem={renderFriendItem}
            style={styles.friendsList}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006D77',
    paddingHorizontal: 15,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 13,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  membersContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  memberItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#092327',
  },
  memberText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  noMembersText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  addMemberContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#092327',
    color: '#FFFFFF',
    fontSize: 16,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  friendsList: {
    marginTop: 10,
  },
  friendItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#5E9086',
  },
  friendText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
