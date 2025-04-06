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
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // optional for secure token storage
import API_BASE_URL from '../api.config'; // Make sure this imports your API base URL

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
      
      <Text style={styles.loginText}>
        Already has an account? Click 
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}> here </Text>
        </TouchableOpacity> 
        to log in
      </Text>

        
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    padding: 20,
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
  button: {
    backgroundColor: '#273c75',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    },
  loginText: {
    color: '#273c75',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },

  linkText: {
    color: '#273c75',  // Make it stand out as a link color
    fontWeight: '600',
    textDecorationLine: 'underline', // Underline to indicate it's clickable
    },
});
