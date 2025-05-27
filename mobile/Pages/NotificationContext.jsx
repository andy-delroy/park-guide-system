import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../api.config';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [filterRole, setFilterRole] = useState('');

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const fetchNotifications = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('userToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        params: {
          filter_role: filterRole || undefined,
        },
      });

      console.log('Context fetch response:', response.data);

      const { notifications: data } = response.data;
      if (!Array.isArray(data)) {
        console.error('Expected notifications array, got:', data);
        setNotifications([]);
        return;
      }

      const newNotifications = data.slice(0, 50).map(notification => ({
        id: notification.id?.toString() || Date.now().toString(),
        message: notification.message || 'No message',
        priority: notification.priority_level || 'normal',
        created_date: new Date(notification.created_date || '2020-01-01'),
        is_read: notification.is_read || false,
        target_channel: notification.target_channel || 'unknown',
      }));

      setNotifications(newNotifications.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (err) {
      console.error('🌩 NotificationContext fetch error:', err.message, 'Response:', err.response?.data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, [filterRole]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, unreadCount, fetchNotifications, filterRole, setFilterRole }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);