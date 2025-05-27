import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

export default function NotificationList({ auth, notifications = [], filterRole = '', availableRoles = [] }) {
  const role = auth?.user?.role_name ?? 'guest';
  const isAdmin = role === 'admin';
  const [selectedRole, setSelectedRole] = useState(filterRole);
  const [localNotifications, setLocalNotifications] = useState(notifications);

  // Fallback for availableRoles
  const defaultRoles = [
    'notifications.admin',
    'notifications.guide',
    'notifications.visitor',
    'all_channels',
  ];
  const derivedRoles = Array.from(new Set(notifications.map(n => n.target_channel)))
    .filter(channel => defaultRoles.includes(channel));
  const rolesToDisplay = availableRoles.length > 0 ? availableRoles : derivedRoles.length > 0 ? derivedRoles : defaultRoles;

  // Debug roles
  useEffect(() => {
    console.log('Available roles:', availableRoles);
    console.log('Derived roles:', derivedRoles);
    console.log('Roles to display:', rolesToDisplay);
    console.log('Initial notifications:', notifications);
  }, [availableRoles, notifications]);

  // Fetch notifications dynamically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/notifications', {
          params: { filter_role: selectedRole || undefined },
        });
        setLocalNotifications(response.data.notifications || []);
        setSelectedRole(response.data.filterRole || '');
        console.log('Fetched notifications:', response.data.notifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        Toastify({
          text: error.response?.data?.error || 'Failed to load notifications',
          duration: 5000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: '#ff4444',
        }).showToast();
      }
    };
    fetchNotifications();
  }, [selectedRole]);

  const markAsRead = async (id) => {
    try {
      const notification = localNotifications.find((n) => n.id === id);
      if (!notification) {
        console.warn(`Notification ${id} not found`);
        return;
      }
      await axios.put(`/notifications/${id}/mark-as-read`);
      setLocalNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_date: new Date().toISOString() } : n
        )
      );
      Toastify({
        text: 'Notification marked as read',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#4fbe87',
      }).showToast();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Toastify({
        text: error.response?.status === 404 ? 'Notification not found' : 'Failed to mark notification as read',
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#ff4444',
      }).showToast();
    }
  };

  // WebSocket listener
  useEffect(() => {
    if (!window.Echo) {
      console.warn('Echo is not initialized');
      return;
    }

    const channelName = `notifications.${role}`;
    console.log(`Subscribing to ${channelName}...`);

    const channel = window.Echo.channel(channelName);
    channel.subscribed(() => {
      console.log(`Successfully subscribed to ${channelName}`);
    });
    channel.listen('.notifications', (event) => {
      console.log('Received broadcast:', event);
      Toastify({
        text: event.message || 'New notification received',
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#4fbe87',
      }).showToast();
      // Refresh notifications
      axios.get('/notifications', { params: { filter_role: selectedRole || undefined } })
        .then((response) => {
          setLocalNotifications(response.data.notifications || []);
        })
        .catch((error) => {
          console.error('Failed to refresh notifications:', error);
        });
    });

    return () => {
      window.Echo.leave(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    };
  }, [role, selectedRole]);

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRole(value);
    // Use axios instead of router.get to avoid Inertia response issues
    axios.get('/notifications', { params: { filter_role: value || undefined } })
      .then((response) => {
        setLocalNotifications(response.data.notifications || []);
        setSelectedRole(response.data.filterRole || '');
      })
      .catch((error) => {
        console.error('Failed to fetch notifications:', error);
        Toastify({
          text: error.response?.data?.error || 'Failed to load notifications',
          duration: 5000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: '#ff4444',
        }).showToast();
      });
  };

  return (
    <>
      <Head title="Notifications" />

      <div className="space-y-4 max-w-3xl mx-auto">
        {isAdmin && (
          <div className="mb-4 flex items-center">
            <label htmlFor="role-filter" className="mr-2 text-sm font-medium text-gray-700">
              Filter by Role:
            </label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={handleRoleChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              {rolesToDisplay.map((r) => (
                <option key={r} value={r}>
                  {r === 'all_channels' ? 'All Channels' : r.replace('notifications.', '')}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
          {localNotifications.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No notifications yet.</div>
          ) : (
            localNotifications.map((n) => (
              <div key={n.id} className="border rounded-lg shadow-sm bg-white p-4 mb-4 last:mb-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-gray-800">{n.message}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(n.created_date ?? n.created_at).toLocaleString()}
                    </div>
                    {n.type && <div className="text-sm text-gray-600">Type: {n.type}</div>}
                    {n.role && (
                      <div className="text-sm text-gray-600">
                        Sent by: {n.role.replace('notifications.', '')}
                      </div>
                    )}
                    {n.target_channel && (
                      <div className="text-sm text-gray-400 italic">
                        Target: {n.target_channel === 'all_channels' ? 'All Channels' : n.target_channel.replace('notifications.', '')}
                      </div>
                    )}
                    {n.expiry_date && (
                      <div className="text-sm text-gray-500">
                        Expires: {new Date(n.expiry_date).toLocaleString()}
                      </div>
                    )}
                    {n.read_date && n.is_read && (
                      <div className="text-sm text-green-700">
                        Read at: {new Date(n.read_date).toLocaleString()}
                      </div>
                    )}
                    {n.action_url && (
                      <a
                        href={n.action_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200"
                      >
                        Open Action
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        n.priority_level === 'high'
                          ? 'bg-red-100 text-red-700'
                          : n.priority_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {n.priority_level ?? 'normal'}
                    </span>
                    <span
                      className={`text-xs ${n.is_read ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {n.is_read ? 'Read' : 'Unread'}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}