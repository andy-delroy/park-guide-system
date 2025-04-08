import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Profile = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await SecureStore.getItemAsync('userName');
      const storedRole = await SecureStore.getItemAsync('userRole');
      setUserName(storedName || 'Guest');
      setUserRole(storedRole || 'guest');
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          // Remove items from SecureStore on logout
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userName');
          await SecureStore.deleteItemAsync('userRole');

          // Reset navigation stack and navigate to the Login screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/120' }} // Replace with actual user profile picture URL
          style={styles.profileImage}
        />
        <Text style={styles.title}>{userName}</Text>
        <Text style={styles.role}>{userRole}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Personal Details</Text>
        <Text style={styles.detail}>Name: {userName}</Text>
        <Text style={styles.detail}>Role: {userRole}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2f3640',
  },
  role: {
    fontSize: 18,
    color: '#718093',
    marginTop: 5,
  },
  detailsContainer: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#718093',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#e84118',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default Profile;
