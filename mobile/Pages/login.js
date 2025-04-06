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

        Alert.alert('Success', `Welcome ${user.username}!`);

        // TODO: Navigate to home/dashboard if using React Navigation
        // navigation.replace('Home');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
        <Image
        source={require('../assets/logo.jpg')} // Adjust the path as needed
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

      <View style={styles.rememberContainer}>
        <Text style={styles.rememberText}>Remember Me</Text>
        <Switch value={remember} onValueChange={setRemember} />
      </View>

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

    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,  // Adjust size of logo as needed
    height: 150,
    alignSelf: 'center',
    marginBottom: 40,  // Add spacing below the logo
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3640',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718093',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#dcdde1',
    borderWidth: 1,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rememberText: {
    fontSize: 16,
    color: '#2f3640',
  },
  button: {
    backgroundColor: '#273c75',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButton: {
    marginTop: 10,
    backgroundColor: '#4cd137',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
