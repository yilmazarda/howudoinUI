import { useState } from 'react';
import { Text, View, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // For navigation

  // API request to log in
  async function submit() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    };

    try {
      const response = await fetch('http://localhost:8080/auth/login', requestOptions);
      if (response.ok) {
        const result = await response.json();
        const token = result.jwt;

        if (token) {
          await AsyncStorage.setItem('authToken', token); // Store token
          await AsyncStorage.setItem('userEmail', email);
        } else {
          console.error('No token returned from the API');
        }

        Alert.alert('Login Successful');
        router.push('/friends'); // Redirect to Friends List
      } else {
        const errorData = await response.json();
        Alert.alert('Login Failed', errorData.message || 'Please try again');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred, please try again later.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email</Text>
      <TextInput
        style={styles.textBoxes}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <Text style={styles.text}>Password</Text>
      <TextInput
        style={styles.textBoxes}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />

      <Pressable style={styles.buttons} onPress={submit}>
        <Text style={styles.text}>Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/register')} style={styles.links}>
        <Text style={styles.text}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#006D77',
  },
  textBoxes: {
    height: 40,
    width: 200,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  buttons: {
    marginTop: 10,
    backgroundColor: '#092327',
    height: 40,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  links: {
    marginTop: 10,
  },
  text: {
    color: '#EDF6F9',
  },
});