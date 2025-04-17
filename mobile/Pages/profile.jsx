import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from '../api.config';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const role = await SecureStore.getItemAsync('userRole');
      const name = await SecureStore.getItemAsync('userName');

      if (!token) {
        setLoading(false);
        Alert.alert('Error', 'No token found. Please log in again.');
        return;
      }

      if (role === 'visitor') {
        // Don't fetch from API for visitors
        setUser({
          full_name: name || 'Guest',
          role: role,
          username: 'guest',
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          console.error(data);
          Alert.alert('Error', data.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Unable to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (key, value) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setUpdating(true);
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully.');
        setUser(data.user);
        setEditable(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userName');
          await SecureStore.deleteItemAsync('userRole');

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const renderInput = (label, value, key) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.detail}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => handleChange(key, text)}
        />
      ) : (
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#c23616', fontSize: 16 }}>Failed to load user data</Text>
      </View>
    );
  }
  
  if (user.role === 'visitor') {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>Please login to view your profile.</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#273c75' }]}
          onPress={async () => {
            // Clear guest session data
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userRole');
            await SecureStore.deleteItemAsync('userName');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.profile_image_url || 'https://via.placeholder.com/120' }}
          style={styles.profileImage}
        />
        <Text style={styles.title}>{user.full_name || user.username}</Text>
        <Text style={styles.role}>
          {user.role_name ? user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1) : 'User'}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Personal Details</Text>
        {renderInput('Full Name', user.full_name, 'full_name')}
        {renderInput('Username', user.username, 'username')}
        {renderInput('Email', user.email, 'email')}
        {renderInput('Phone Number', user.phone_number, 'phone_number')}
        {renderInput('Address', user.address, 'address')}
        {renderInput('Biography', user.biography, 'biography')}
        {renderInput('Languages', user.languages_spoken, 'languages_spoken')}
        {renderInput('Experience (Years)', String(user.years_of_experience ?? ''), 'years_of_experience')}
        {renderInput('Specializations', user.specializations, 'specializations')}
        {renderInput('Employment Status', user.employment_status, 'employment_status')}
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: editable ? '#44bd32' : '#273c75' }]} onPress={() => editable ? handleSave() : setEditable(true)}>
        <Text style={styles.buttonText}>{editable ? (updating ? 'Saving...' : 'Save') : 'Edit Profile'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#e84118' }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2f3640',
  },
  role: {
    fontSize: 16,
    color: '#718093',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 12,
  },
  detail: {
    fontSize: 15,
    color: '#718093',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#e84118',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: 'center',
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 15,
    color: '#2f3640',
  },
  detailValue: {
    fontSize: 15,
    color: '#718093',
  },
});

export default Profile;
