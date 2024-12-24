import { useState } from 'react';
import { Text, View, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // For navigation

  // API request to register
  async function submit() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        lastName: surname,
        email: email,
        password: password,
      }),
    };

    try {
      // Make the API call
      const response = await fetch('http://localhost:8080/auth/register', requestOptions);

      if (response.ok) {
        Alert.alert('Registration Successful', 'You can now log in!');
        router.push('/'); // Navigate to login page after successful registration
      } else {
        const errorData = await response.json();
        Alert.alert('Registration Failed', errorData.message || 'Please try again');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Registration Failed', 'An error occurred, please try again later.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Name</Text>
      <TextInput
        style={styles.textBoxes}
        onChangeText={(text) => setName(text.replace(/[^a-zA-Z]/g, ''))} // Only allow letters
        keyboardType='default'
        value={name}
        placeholder="Enter your name"
      />
      <Text style={styles.text}>Surname</Text>
      <TextInput
        style={styles.textBoxes}
        onChangeText={(text) => setSurname(text.replace(/[^a-zA-Z]/g, ''))} // Only allow letters
        value={surname}
        placeholder="Enter your surname"
      />
      <Text style={styles.text}>Email</Text>
      <TextInput
        style={styles.textBoxes}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="Enter your email"
      />
      <Text style={styles.text}>Password</Text>
      <TextInput
        style={styles.textBoxes}
        autoCapitalize="none"
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="Enter your password"
        secureTextEntry
      />

      <Pressable style={styles.buttons} onPress={submit}>
        <Text style={styles.text}>Register</Text>
      </Pressable>

      {/* Link to the login page */}
      <Pressable onPress={() => router.push('/')} style={styles.links}>
        <Text style={styles.text}>Back to Login</Text>
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
    color: 'white',
    marginTop: 10,
  },
  text: {
    color: '#EDF6F9',
  },
});