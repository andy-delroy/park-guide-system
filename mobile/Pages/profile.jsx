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
import * as ImagePicker from 'expo-image-picker';
import styles from '../Styles/styles'; // Import your styles

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const role = await SecureStore.getItemAsync('userRole');
      const name = await SecureStore.getItemAsync('userName');
      const fullName = await SecureStore.getItemAsync('fullName');

      if (!token) {
        setLoading(false);
        Alert.alert('Error', 'No token found. Please log in again.');
        return;
      }

      if (role === 'visitor') {
        // Don't fetch from API for visitors
        setUser({
          full_name: fullName || 'Guest',
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

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera roll access is needed.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]); // save selected image
      handleChange('profile_image_url', result.assets[0].uri); // preview in UI
    }
  };

  const getMimeType = (uri) => {
    const extension = uri.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  };  

  const handleChange = (key, value) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const token = await SecureStore.getItemAsync('userToken');
  
    const formData = new FormData();
  
    Object.entries(user).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    if (selectedImage) {
      const fileUri = selectedImage.uri;
      const fileName = fileUri.split('/').pop();
      const mimeType = getMimeType(fileUri);

      formData.append('profile_image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setUser(data.user); // update state with latest
        setEditable(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        console.error('Validation failed', data);
        Alert.alert("Error", data.message || "Update failed");
      }
    } catch (error) {
      console.error('Update error', error);
      Alert.alert("Error", "Could not update profile.");
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
          await SecureStore.deleteItemAsync('fullName');

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
      <Text style={styles.profileDetail}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.profileInput}
          value={value}
          onChangeText={(text) => handleChange(key, text)}
        />
      ) : (
        <Text style={styles.profileDetailValue}>{value || 'N/A'}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.profileCentered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.profileCentered}>
        <Text style={{ color: '#c23616', fontSize: 16 }}>Failed to load user data</Text>
      </View>
    );
  }
  
  if (user.role === 'visitor') {
    return (
      <View style={styles.profileCentered}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>Please login to view your profile.</Text>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: '#273c75' }]}
          onPress={async () => {
            // Clear guest session data
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userRole');
            await SecureStore.deleteItemAsync('userName');
            await SecureStore.deleteItemAsync('fullName');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }}
        >
          <Text style={styles.profileButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.profileContainer}>
      <View style={styles.profileHeader}>
      <TouchableOpacity onPress={editable ? pickImage : null}>
        <Image
          source={{ uri: selectedImage?.uri || user.profile_image_url || `${API_BASE_URL}/mobile/assets/placeholder.jpg` }}
          style={styles.profileImage}
        />
        {editable && <Text style={{ textAlign: 'center', color: '#273c75' }}>Tap to change</Text>}
      </TouchableOpacity>
        <Text style={styles.profileTitle}>{user.full_name || user.username}</Text>
        <Text style={styles.profileRole}>
          {user.role_name ? user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1) : 'User'}
        </Text>
      </View>

      <View style={styles.profileDetailsContainer}>
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

      <View style={styles.profileButtonRow}>
        <TouchableOpacity style={[styles.profileEditButton, editable && styles.profileSaveButton]} onPress={() => editable ? handleSave() : setEditable(true)}>
          <Text style={styles.profileButtonText}>{editable ? (updating ? 'Saving...' : 'Save') : 'Edit Profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileCancelButton} onPress={() => editable ? setEditable(false) : handleLogout()}>
          <Text style={styles.profileButtonText}>{editable ? 'Back' : 'Logout'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
