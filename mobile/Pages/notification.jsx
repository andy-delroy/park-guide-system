// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Alert,
//   Button,
//   TextInput,
//   TouchableWithoutFeedback,
//   Keyboard,   
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import * as SecureStore from 'expo-secure-store';
// import * as Notifications from 'expo-notifications';
// import axios from 'axios';
// import API_BASE_URL from '../api.config';
// import { configurePushNotifications } from '../src/utils/PushNotificationConfig';
// import { ScrollView } from 'react-native';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// const NotificationScreen = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [isSending, setIsSending] = useState(false);
//   const [message, setMessage] = useState('');
//   const [priority, setPriority] = useState('normal');
//   const [channel, setChannel] = useState('all_channels');
//   const [userRole, setUserRole] = useState(null); // Initially null
//   const notificationListener = useRef(null);

//   // Role ID to role name mapping
//   const roleMap = {
//     1: 'admin',
//     2: 'guide',
//     3: 'visitor',
//   };

//   const fetchNotifications = async () => {
//     const authToken = await SecureStore.getItemAsync('userToken');
//     if (!authToken) {
//       console.error('No auth token found');
//       Alert.alert('Error', 'No authentication token found. Please log in.');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/notifications`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`,
//         },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         const newNotifications = data.map(notification => ({
//           id: notification.id.toString(),
//           message: notification.message,
//           priority: notification.priority_level,
//           created_date: new Date(notification.created_date),
//         }));
//         setNotifications(prev => {
//           const merged = [...newNotifications, ...prev.filter(p => !newNotifications.some(n => n.id === p.id))];
//           return merged.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
//         });
//         console.log('Fetched notifications:', data);
//       } else {
//         console.error('Failed to fetch notifications:', data.error);
//         Alert.alert('Error', data.error || 'Failed to fetch notifications');
//       }
//     } catch (error) {
//       console.error('Fetch notifications error:', error.message);
//       Alert.alert('Error', 'Failed to fetch notifications: ' + error.message);
//     }
//   };
//   const wsRef = useRef(null);
//   useEffect(() => {
//     const fetchRole = async () => {
//       try {
//         const storedRole = await SecureStore.getItemAsync('userRole');
//         console.log('Retrieved userRole from SecureStore:', storedRole);
//         const role = storedRole || 'visitor';
//         setUserRole(role);
//         setChannel(role === 'admin' ? 'all_channels' : channelMap[role] || 'notifications.visitor');
//       } catch (error) {
//         console.error('Error reading user role:', error.message);
//         setUserRole('visitor');
//         setChannel('notifications.visitor');
//       }
//     };
  
//     fetchNotifications();
//     fetchRole();
//     configurePushNotifications().catch(err => console.error('Push notification config error:', err));
  
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       if (!notification?.request?.content) return;
//       const { title, body, data } = notification.request.content;
//       const priority = data?.priority ?? 'normal';
//       setNotifications(prev => {
//         const exists = prev.some(n => n.message === `${title ? `${title}: ` : ''}${body}`);
//         if (exists) return prev;
//         return [
//           {
//             id: Date.now().toString(),
//             message: `${title ? `${title}: ` : ''}${body}`,
//             priority,
//             created_date: new Date(),
//           },
//           ...prev,
//         ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
//       });
//     });
//     console.log('Notification subscription:', subscription);
//     notificationListener.current = subscription;
  
//     return () => {
//       if (notificationListener.current) {
//         notificationListener.current.remove();
//       }
//     };
//   }, []);
  
  
//   useEffect(() => {
//     const init = async () => {
//       await configurePushNotifications();
//       await fetchNotifications();
//       await getUserRole();
//     };
//     init();

//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       if (!notification?.request?.content) return;

//       const { title, body, data } = notification.request.content;
//       const priority = data?.priority ?? 'normal';

//       setNotifications(prev => {
//         const exists = prev.some(n => n.message === `${title ? `${title}: ` : ''}${body}`);
//         if (exists) return prev;
//         return [
//           {
//             id: Date.now().toString(),
//             message: `${title ? `${title}: ` : ''}${body}`,
//             priority,
//             created_date: new Date(),
//           },
//           ...prev,
//         ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
//       });
//     });
//     console.log('Notification subscription:', subscription);
//     notificationListener.current = subscription;

//     return () => {
//       if (notificationListener.current) {
//         notificationListener.current.remove();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!userRole) return;
  
//     let reconnectAttempts = 0;
//     const maxReconnectAttempts = 5;
//     const reconnectDelay = 3000; // 3 seconds
  
//     const connectWebSocket = () => {
//       const socket = new WebSocket(`ws://172.17.9.24:8080/app/7dknehkcdsxjflsnpmam?protocol=7&client=js&version=4.6.1`);
//       wsRef.current = socket;
//       socket.onopen = () => {
//         console.log('✅ WebSocket connected');
//         reconnectAttempts = 0; // Reset attempts on successful connection
//         socket.send(JSON.stringify({
//           event: 'pusher:subscribe',
//           data: {
//             channel: `notifications.${userRole}`,
//           },
//         }));
//       };
  
//       socket.onmessage = async (event) => {
//         try {
//           const message = JSON.parse(event.data);
//           console.log('📨 WebSocket Message:', JSON.stringify(message, null, 2));
  
//           if (message.event === '.test' && message.channel === `notifications.${userRole}`) {
//             const data = JSON.parse(message.data);
//             console.log('Notification received:', data);
  
//             await Notifications.scheduleNotificationAsync({
//               content: {
//                 title: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Alert`,
//                 body: data.message || 'New notification received',
//                 data: { priority: data.priority },
//                 sound: 'default',
//               },
//               trigger: null,
//             });
  
//             setNotifications((prev) => {
//               const exists = prev.some(n => n.message === data.message && n.priority === data.priority);
//               if (exists) return prev;
//               return [
//                 {
//                   id: Date.now().toString(),
//                   message: data.message,
//                   priority: data.priority,
//                   created_date: new Date(),
//                 },
//                 ...prev,
//               ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
//             });
  
//             fetchNotifications();
//           }
//         } catch (err) {
//           console.error('WebSocket message parse error:', err.message);
//         }
//       };
  
//       socket.onerror = (err) => {
//         console.error('❌ WebSocket error:', err.message);
//       };
  
//       socket.onclose = () => {
//         console.log('❎ WebSocket disconnected');
//         if (reconnectAttempts < maxReconnectAttempts) {
//           reconnectAttempts++;
//           console.log(`Reconnecting WebSocket (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
//           setTimeout(connectWebSocket, reconnectDelay);
//         } else {
//           console.error('Max WebSocket reconnect attempts reached');
//           Alert.alert('Error', 'Unable to connect to WebSocket server');
//         }
//       };
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, [userRole]);

//   const sendServerPush = async () => {
//     if (isSending) return;
//     if (!message.trim()) {
//       Alert.alert('Error', 'Please enter a notification message');
//       return;
//     }
//     try {
//       setIsSending(true);
//       console.log('📤 Sending notification...');
  
//       const authToken = await SecureStore.getItemAsync('userToken');
//       if (!authToken) {
//         Alert.alert('Error', 'No auth token found');
//         throw new Error('No auth token found');
//       }
  
//       const effectiveChannel = userRole === 'admin' ? channel : channelMap[userRole] || 'notifications.visitor';
//       const payload = {
//         message: message.trim(),
//         channel: effectiveChannel,
//         priority,
//       };
  
//       console.log('Sending payload:', payload);
  
//       const res = await fetch('http://172.17.9.24:8000/api/notifications', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`,
//         },
//         body: JSON.stringify(payload),
//       });
  
//       console.log('Response status:', res.status);
//       const text = await res.text();
//       console.log('Server response:', text);
  
//       let data;
//       try {
//         data = JSON.parse(text);
//         console.log('✅ Parsed response:', data);
//       } catch (error) {
//         console.error('JSON parse error:', error.message);
//         throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
//       }
  
//       if (!res.ok) {
//         console.error('Server error:', data.error || `HTTP ${res.status}`);
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }
  
//       Alert.alert('Success', 'Notification sent successfully');
//       setMessage('');
//       setPriority('normal');
//       if (userRole === 'admin') {
//         setChannel('all_channels');
//       }
  
//       await fetchNotifications();
//     } catch (error) {
//       console.error('📤 Send failed:', error.message);
//       Alert.alert('Error', `Failed to send notification: ${error.message}`);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const renderNotification = ({ item }) => (
//     <View style={styles.notificationItem}>
//       <Text style={styles.notificationText}>{item.message}</Text>
//       <Text style={styles.priorityText}>Priority: {item.priority}</Text>
//       <Text style={styles.dateText}>{new Date(item.created_date).toLocaleString()}</Text>
//     </View>
//   );

//   console.log('Notifications:', notifications);
//   console.log('Current userRole:', userRole);

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.roleText}>
//           User Role: {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Loading...'}
//         </Text>
//         <Text style={styles.text}>Notifications</Text>
//         {userRole === 'admin' ? (
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter notification message"
//               value={message}
//               onChangeText={setMessage}
//               maxLength={255}
//               multiline
//               numberOfLines={3}
//               textAlignVertical="top"
//             />
//             <Picker
//               selectedValue={channel}
//               style={styles.picker}
//               onValueChange={(itemValue) => setChannel(itemValue)}
//             >
//               <Picker.Item label="All Channels" value="all_channels" />
//               <Picker.Item label="Admin" value="notifications.admin" />
//               <Picker.Item label="Visitor" value="notifications.visitor" />
//               <Picker.Item label="Park Guide" value="notifications.guide" />
//             </Picker>
//             <Picker
//               selectedValue={priority}
//               style={styles.picker}
//               onValueChange={(itemValue) => setPriority(itemValue)}
//             >
//               <Picker.Item label="Low" value="low" />
//               <Picker.Item label="Normal" value="normal" />
//               <Picker.Item label="Medium" value="medium" />
//               <Picker.Item label="High" value="high" />
//             </Picker>
//             <Button
//               title={isSending ? 'Sending...' : 'Send Notification'}
//               onPress={sendServerPush}
//               disabled={isSending || !message.trim()}
//             />
//           </View>
//         ) : (
//           userRole && (
//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter notification message"
//                 value={message}
//                 onChangeText={setMessage}
//                 maxLength={255}
//                 multiline
//                 numberOfLines={3}
//                 textAlignVertical="top"
//               />
//               <Picker
//                 selectedValue={priority}
//                 style={styles.picker}
//                 onValueChange={(itemValue) => setPriority(itemValue)}
//               >
//                 <Picker.Item label="Low" value="low" />
//                 <Picker.Item label="Normal" value="normal" />
//                 <Picker.Item label="Medium" value="medium" />
//                 <Picker.Item label="High" value="high" />
//               </Picker>
//               <Button
//                 title={isSending ? 'Sending...' : 'Send Notification'}
//                 onPress={sendServerPush}
//                 disabled={isSending || !message.trim()}
//               />
//             </View>
//           )
//         )}
//         <FlatList
//           data={notifications}
//           renderItem={renderNotification}
//           keyExtractor={item => item.id}
//           ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
//           style={styles.flatList}
//         />
//       </ScrollView>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
//   text: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
//   roleText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2f3640',
//     marginBottom: 8,
//   },
//   inputContainer: { marginBottom: 16 },
//   input: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   picker: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   notificationItem: {
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 8,
//     marginVertical: 6,
//     elevation: 2,
//   },
//   notificationText: { fontSize: 16, color: '#2f3640' },
//   priorityText: { fontSize: 14, color: '#718093', marginTop: 4 },
//   dateText: { fontSize: 12, color: '#718093', marginTop: 2 },
//   emptyText: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' },
// });

// export default NotificationScreen;  
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from './NotificationContext';
import { API_BASE_URL } from '../api.config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationScreen = () => {
  const { notifications, setNotifications, filterRole, setFilterRole, fetchNotifications } = useNotifications();
  const [userRole, setUserRole] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(filterRole);
  const [modalVisible, setModalVisible] = useState(false);

  const availableChannels = [
    { label: 'All Roles', value: '' },
    { label: 'Admin', value: 'notifications.admin' },
    { label: 'Guide', value: 'notifications.guide' },
    { label: 'Visitor', value: 'notifications.visitor' },
    { label: 'All Channels', value: 'all_channels' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      let hasFetched = false;
  
      const fetchOnce = () => {
        if (!hasFetched) {
          console.log('Screen focused, fetching notifications ONCE');
          fetchNotifications();
          hasFetched = true;
        }
      };
  
      fetchOnce();
  
      return () => {
        hasFetched = false;
      };
    }, [])
  );

  const markAsRead = async (notificationId) => {
    try {
      const authToken = await SecureStore.getItemAsync('userToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Mark as read error:', error.message);
      Alert.alert('Error', error.response?.data?.error || `Mark as read failed: ${error.message}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('userToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length === 0) {
        Alert.alert('Info', 'No unread notifications');
        return;
      }

      for (const notification of unreadNotifications) {
        await axios.put(`${API_BASE_URL}/api/notifications/${notification.id}/read`, {}, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Mark all as read error:', error.message);
      Alert.alert('Error', error.response?.data?.error || `Failed to mark all as read: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await SecureStore.getItemAsync('userRole');
        console.log('Retrieved userRole:', storedRole);
        setUserRole(storedRole || 'visitor');
      } catch (error) {
        console.error('Error reading user role:', error.message);
        setUserRole('visitor');
      }
    };

    fetchRole();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
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
            is_read: false,
            target_channel: data?.channel || 'notifications.visitor',
          },
          ...prev,
        ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      });
    });

    return () => subscription.remove();
  }, [setNotifications]);

  useEffect(() => {
    if (!userRole) return;

    const ws = new WebSocket(`ws://172.17.2.106:8000/app/7dknehkcdsxjflsnpmam?protocol=7&client=js&version=4.6.1`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { channel: `notifications.${userRole}` },
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket Message:', message);

        if (message.event === '.notifications' && message.channel === `notifications.${userRole}`) {
          const data = JSON.parse(message.data);
          console.log('Notification received:', data);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Alert`,
              body: data.message || 'New notification',
              data: { priority: data.priority || 'normal', channel: data.channel || `notifications.${userRole}` },
              sound: 'default',
            },
            trigger: null,
          });

          setNotifications((prev) => {
            const exists = prev.some(n => n.message === data.message && n.priority === data.priority);
            if (exists) return prev;
            return [
              {
                id: Date.now().toString(),
                message: data.message || 'New notification',
                priority: data.priority || 'normal',
                created_date: new Date(),
                is_read: false,
                target_channel: data.channel || `notifications.${userRole}`,
              },
              ...prev,
            ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          });
        }
      } catch (err) {
        console.error('WebSocket parse error:', err.message);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error:', err.message);
    ws.onclose = () => console.log('WebSocket disconnected');

    return () => ws.close();
  }, [userRole, setNotifications]);

  const handleChannelChange = (value) => {
    setSelectedChannel(value);
    setFilterRole(value);
    setModalVisible(false);
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.is_read ? styles.read : styles.sent]}
      onPress={() => !item.is_read && markAsRead(item.id)}
    >
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.priorityText}>Priority: {item.priority}</Text>
      <Text style={styles.dateText}>{new Date(item.created_date).toLocaleString()}</Text>
      <Text style={styles.readStatus}>Status: {item.is_read ? 'Read' : 'Unread'}</Text>
      <Text style={styles.channelText}>Channel: {item.target_channel.replace('notifications.', '')}</Text>
    </TouchableOpacity>
  );

  console.log('Notifications:', notifications);
  console.log('UserRole:', userRole);
  console.log('Selected channel:', selectedChannel);

  return (
    <View style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.text}>Notification manager</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.buttonText}>Mark All as Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>
            Filter: {selectedChannel ? selectedChannel.replace('notifications.', '') : 'All Roles'}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Channel</Text>
            {availableChannels.map((channel) => (
              <TouchableOpacity
                key={channel.value}
                style={styles.modalButton}
                onPress={() => handleChannelChange(channel.value)}
              >
                <Text style={styles.modalButtonText}>{channel.label}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#2196F3" />
          </View>
        </View>
      </Modal>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No notifications</Text>}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  contentContainer: { padding: 16 },
  text: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#2f3640' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  markAllButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, flex: 1, marginRight: 8 },
  filterButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, flex: 1 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  modalButton: { padding: 10, marginVertical: 5, backgroundColor: '#f5f5f5', borderRadius: 5 },
  modalButtonText: { fontSize: 16, textAlign: 'center', color: '#2f3640' },
  notificationItem: { padding: 14, borderRadius: 8, marginVertical: 6, elevation: 2 },
  read: { backgroundColor: '#e0e0e0' },
  sent: { backgroundColor: '#fff' },
  notificationText: { fontSize: 16, color: '#2f3640' },
  priorityText: { fontSize: 14, color: '#718093', marginTop: 4 },
  dateText: { fontSize: 12, color: '#718093', marginTop: 2 },
  readStatus: { fontSize: 12, color: '#718093', marginTop: 2 },
  channelText: { fontSize: 12, color: '#718093', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' },
  flatList: { flexGrow: 1 },
});

export default NotificationScreen;