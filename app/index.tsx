import { useState } from 'react';
import { Text, View, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router'; // Link to navigate to other pages
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Use this to navigate programmatically

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
      // Make the API call
      const response = await fetch('http://localhost:8080/auth/login', requestOptions);
      
      // Check if login was successful
      if (response.ok) {
        const result = await response.json();

        console.log('API Response:', result);
        const token = result.jwt;
        
        if (token) {
          AsyncStorage.setItem('authToken', token);
        } else {
          console.error('No token returned from the API');
        }

        // Alert user about success
        Alert.alert('Login Successful');
        
        // Navigate to the home page after successful login
        router.push('/home'); // Navigate to the home screen using file-based navigation
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
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <Text style={styles.text}>Password</Text>
      <TextInput
        style={styles.textBoxes}
        
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />

      <Pressable style={styles.buttons} onPress={submit}>
        <Text style={styles.text}>Login</Text>
      </Pressable>

      {/* Link to the register page */}
      <Link href="/register" style={styles.links}>
        Register
      </Link>
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
    color: 'white',
    marginTop: 10,
  },
  text: {
    color: '#EDF6F9',
  },
});
