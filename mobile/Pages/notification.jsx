import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Button,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { configurePushNotifications } from '../src/utils/PushNotificationConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const notificationListener = useRef();
  const wsRef = useRef(null);

  const fetchNotifications = async () => {
    const authToken = await SecureStore.getItemAsync('userToken');
    if (!authToken) {
      console.error('No auth token found');
      return;
    }

    try {
      const response = await fetch('http://172.17.9.24:8000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        const newNotifications = data.map(notification => ({
          id: notification.id.toString(),
          message: notification.message,
          priority: notification.priority_level,
          created_date: new Date(notification.created_date),
        }));
        setNotifications(prev => {
          const merged = [...newNotifications, ...prev.filter(p => !newNotifications.some(n => n.id === p.id))];
          return merged.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        });
        console.log('Fetched notifications:', data);
      } else {
        console.error('Failed to fetch notifications:', data.error);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error.message);
    }
  };

  useEffect(() => {
    configurePushNotifications().then(() => {
      fetchNotifications();
    });

    wsRef.current = new WebSocket('ws://172.17.9.24:8080/app/7dknehkcdsxjflsnpmam?protocol=7&client=js&version=4.6.1');

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      wsRef.current.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: {
          channel: 'notifications.visitor',
        },
      }));
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 WebSocket Message:', JSON.stringify(message, null, 2));

        if (message.event === '.test' && message.channel === 'notifications.visitor') {
          const data = JSON.parse(message.data);
          console.log('Notification received:', data);

          // Trigger push notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Visitor Alert',
              body: data.message || 'New notification received',
              data: { priority: data.priority },
              sound: 'default',
            },
            trigger: null,
          });

          // Update FlatList
          setNotifications((prev) => {
            const exists = prev.some(n => n.message === data.message && n.priority === data.priority);
            if (exists) return prev;
            return [
              {
                id: Date.now().toString(),
                message: data.message,
                priority: data.priority,
                created_date: new Date(),
              },
              ...prev,
            ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          });

          // Refresh notifications
          fetchNotifications();
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err.message);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err.message);
    };

    wsRef.current.onclose = () => {
      console.log('❎ WebSocket disconnected');
    };

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      if (!notification?.request?.content) return;

      const { title, body, data } = notification.request.content;
      const priority = data?.priority ?? 'normal';

      setNotifications(prev => {
        const exists = prev.some(n => n.message === `${title ? `${title}: ` : ''}${body}`);
        if (exists) return prev;
        return [
          {
            id: Date.now().toString(),
            message: `${title ? `${title}: ` : ''}${body}`,
            priority,
            created_date: new Date(),
          },
          ...prev,
        ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      });
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendServerPush = async () => {
    if (isSending) return;
    setIsSending(true);
    console.log('📤 Sending server push...');

    const authToken = await SecureStore.getItemAsync('userToken');
    if (!authToken) {
      Alert.alert('Error', 'No auth token found');
      setIsSending(false);
      return;
    }

    const payload = {
      message: 'Test push from mobile app',
      channel: 'notifications.visitor',
      priority: 'high',
    };

    try {
      const res = await fetch('http://172.17.9.24:8000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('Raw server response:', text);

      let data;
      try {
        data = JSON.parse(text);
        console.log('✅ Server response:', data);
      } catch (error) {
        console.error('JSON parse error:', error.message);
        throw new Error('Invalid JSON response');
      }

      if (!res.ok) {
        Alert.alert('Error', data.error || `HTTP ${res.status}: ${res.statusText}`);
      } else {
        Alert.alert('Success', 'Push sent successfully.');

        // Generate push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Visitor Alert',
            body: data.notification.message || 'New notification received',
            data: { priority: data.notification.priority_level },
            sound: 'default',
          },
          trigger: null,
        });

        // Update FlatList
        setNotifications((prev) => {
          const exists = prev.some(n => n.id === data.notification.id.toString());
          if (exists) return prev;
          return [
            {
              id: data.notification.id.toString(),
              message: data.notification.message,
              priority: data.notification.priority_level,
              created_date: new Date(data.notification.created_date),
            },
            ...prev,
          ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        });

        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error('❌ Push send failed:', error.message);
      Alert.alert('Error', `Failed to send push: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.priorityText}>Priority: {item.priority}</Text>
      <Text style={styles.dateText}>{new Date(item.created_date).toLocaleString()}</Text>
    </View>
  );

  console.log('Notifications:', notifications);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notifications</Text>
      <Button title="Send Server Push" onPress={sendServerPush} disabled={isSending} />
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  text: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
    elevation: 2,
  },
  notificationText: { fontSize: 16, color: '#2f3640' },
  priorityText: { fontSize: 14, color: '#718093', marginTop: 4 },
  dateText: { fontSize: 12, color: '#718093', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' },
});

export default NotificationScreen;