import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<string[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<string[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await fetch("http://localhost:8080/friends", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch friends. Status: ${response.status}`);
        }

        const data: string[] = await response.json();
        setFriends(data);
        setFilteredFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = friends.filter((friend) =>
      friend.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  const toggleSelectFriend = (email: string) => {
    if (selectedFriends.includes(email)) {
      setSelectedFriends(selectedFriends.filter((friend) => friend !== email));
    } else {
      setSelectedFriends([...selectedFriends, email]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("http://localhost:8080/groups/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          users: selectedFriends,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create group. Status: ${response.status}`);
      }

      alert("Group created successfully!");
      router.replace("/groups"); 
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  const renderFriend = ({ item }: { item: string }) => {
    const isSelected = selectedFriends.includes(item);
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendSelected]}
        onPress={() => toggleSelectFriend(item)}
      >
        <Text style={styles.friendText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Group</Text>
        </View>

        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            placeholderTextColor="#AAAAAA"
            value={groupName}
            onChangeText={setGroupName}
          />

          <TextInput
            style={styles.input}
            placeholder="Search friends"
            placeholderTextColor="#AAAAAA"
            value={searchText}
            onChangeText={handleSearch}
          />

          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item}
            renderItem={renderFriend}
            style={styles.friendList}
          />

          <TouchableOpacity style={styles.createButton} onPress={createGroup}>
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#006D77",
    paddingHorizontal: 15,
  },
  header: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 13,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: "#000000",
  },
  friendList: {
    flex: 1,
    marginTop: 10,
  },
  friendItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#092327",
  },
  friendSelected: {
    backgroundColor: "#028090",
  },
  friendText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  createButton: {
    backgroundColor: "#83C5BE",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
