// pushNotificationConfig.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const configurePushNotifications = async () => {
  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use a physical device for push notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission Denied', 'Push notifications permission not granted');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-expo-project-id', // Replace with your Expo project ID
  });
  const expoPushToken = tokenData.data;

  console.log('Expo Push Token:', expoPushToken);

  // Send token to backend
  const authToken = await SecureStore.getItemAsync('userToken');
  if (authToken) {
    try {
      const response = await fetch('http://172.17.9.24:8000/api/expo-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: expoPushToken }),
      });
      if (!response.ok) {
        console.error('Failed to send Expo token:', response.statusText);
      } else {
        console.log('Expo token sent successfully');
      }
    } catch (error) {
      console.error('Failed to send Expo token:', error.message);
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};