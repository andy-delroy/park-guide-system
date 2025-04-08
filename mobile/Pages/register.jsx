import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // optional for secure token storage
import API_BASE_URL from '../api.config'; // Make sure this imports your API base URL
import styles from '../Styles/styles'; // Adjust the import path as needed

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username || !passwordConfirmation) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
  
      const token = response?.data?.token;
      const user = response?.data?.user;
  
      if (token) {
        await SecureStore.setItemAsync('userToken', String(token));
        await SecureStore.setItemAsync('userName', String(user.username));
  
        Alert.alert(
          'Success',
          'Account created! Please log in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(), 
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Registration Failed', 'Unexpected response format.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      console.log('Register error:', error.response?.data || error.message);
      Alert.alert('Register Error', message);
    }
  
    setLoading(false);
  };  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Image
        source={require('../assets/sfc_logo.jpg')} // Adjust the path as needed
        style={styles.logo}
      />
      
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.bottomText}>
        Already has an account? Click 
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}> here </Text>
        </TouchableOpacity> 
        to log in.
      </Text>
        
    </KeyboardAvoidingView>
  );
};

export default Register;