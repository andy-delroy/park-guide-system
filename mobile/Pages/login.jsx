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
import API_BASE_URL from '../api.config';
import styles from '../Styles/styles';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        remember
      });

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (token) {
        // ✅ Save token securely (optional)
        await SecureStore.setItemAsync('userToken', String(token));
        await SecureStore.setItemAsync('userName', String(user.username));
        await SecureStore.setItemAsync('userRole', String(user.role_name)); // Save user role if needed

        // Alert.alert('Success', `Welcome ${user.username} with role ${user.role_name}!`);

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        
      } else {
        Alert.alert('Login Failed', 'Unexpected response format.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials or server error.';
      console.log('Login error:', error.response?.data || error.message);
      Alert.alert('Login Error', message);
    }

    setLoading(false);
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };  

  const handleContinueAsGuest = async () => {
    // Set the role as 'guest' when the user chooses to continue as guest
    await SecureStore.setItemAsync('userToken', 'dummy-guest-token');
    await SecureStore.setItemAsync('userName', 'Distinguished Guest');
    await SecureStore.setItemAsync('userRole', 'visitor');
  
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
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
          
      <Text style={styles.title}>Park Guide System</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

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

      <TouchableOpacity style={styles.rememberContainer} onPress={() => setRemember(!remember)}>
        <View style={styles.checkbox}>
          {remember && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.rememberText}>Remember Me</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleContinueAsGuest}>
        <Text style={styles.bottomText}>Continue as Guest</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
};

export default Login;