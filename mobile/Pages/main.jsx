import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import your actual Home component
import Home from './home.jsx'; // Import your Home.jsx
import Profile from './profile.jsx'; // Import your Profile.jsx
import Map from './map.jsx'; // Import your Map.jsx
import Notification from './notification.jsx'; // Import your Notification.jsx
import Training from './training.jsx'; // Import your Training.jsx
import Certificate from './certificate.jsx'; // Import your Certificate.jsx

const Tab = createBottomTabNavigator();

const Main = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(''); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await SecureStore.getItemAsync('userName');
      const storedRole = await SecureStore.getItemAsync('userRole');
      setUsername(storedName || 'Guest');
      setRole(storedRole || 'guest');
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
    {/* Always show these 3 tabs for everyone */}
    <Tab.Screen
        name="Home"
        component={Home}
        options={{
        tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
        ),
        }}
    />
    <Tab.Screen
        name="Map"
        component={Map}
        options={{
        tabBarIcon: ({ color, size }) => (
            <Icon name="map" color={color} size={size} />
        ),
        }}
    />

    {/* Show Notification only for visitor, guide, or admin */}
    {(role === 'visitor' || role === 'guide' || role === 'admin') && (
        <Tab.Screen
        name="Notification"
        component={Notification}
        options={{
            tabBarIcon: ({ color, size }) => (
            <Icon name="bell" color={color} size={size} />
            ),
        }}
        />
    )}

    {/* Show Training and Certificate only for guide or admin */}
    {(role === 'guide' || role === 'admin') && (
        <>
        <Tab.Screen
            name="Training"
            component={Training}
            options={{
            tabBarLabel: 'Training',
            }}
        />
        <Tab.Screen
            name="Certificate"
            component={Certificate}
            options={{
            tabBarLabel: 'Certificate',
            }}
        />
        </>
    )}
    
    <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
        tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
        ),
        }}
    />
    </Tab.Navigator>

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
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    backgroundColor: '#e84118',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default Main;
