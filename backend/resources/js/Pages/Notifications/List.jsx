import React, { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

export default function NotificationList({ auth, notifications = [], filterRole, availableRoles = [] }) {
  const role = auth?.user?.role_name ?? 'guest';
  const isAdmin = role === 'admin';
  const [selectedRole, setSelectedRole] = useState(filterRole ?? '');

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/mark-as-read`);
      console.log(`Notification ${id} marked as read`);
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  useEffect(() => {
    notifications.forEach((n) => {
      if (!n.is_read) markAsRead(n.id);
    });
  }, [notifications]);

  useEffect(() => {
    const channelName = `notifications.${role}`;
    console.log(`Subscribing to ${channelName}...`);

    const channel = window.Echo.channel(channelName);
    channel.listen('.test', (event) => {
      Toastify({
        text: event.message || 'New notification received',
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#4fbe87',
      }).showToast();
    });

    return () => {
      window.Echo.leave(channelName);
    };
  }, [role]);

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRole(value);
    router.get(route('notifications.index'), { filter_role: value }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Notifications</h2>}
    >
      <Head title="Notifications" />

      <div className="p-6 space-y-4 max-w-3xl mx-auto">

        {isAdmin && (
          <div className="mb-4">
            <label htmlFor="role-filter" className="mr-2 text-sm font-medium text-gray-700">Filter by Role:</label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={handleRoleChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">All Roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r.replace('notifications.', '')}
                </option>
              ))}
            </select>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="border rounded-lg shadow-sm bg-white p-4 space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-gray-800">{n.message}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(n.created_date ?? n.created_at).toLocaleString()}
                  </div>

                  {n.type && <div className="text-sm text-gray-600">Type: {n.type}</div>}
                  {n.role && <div className="text-sm text-gray-600">Sent by: {n.role}</div>}
                  {n.target_channel && (
                    <div className="text-sm text-gray-400 italic">Target: {n.target_channel}</div>
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
                    className={`text-xs ${
                      n.is_read ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {n.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AuthenticatedLayout>
  );
}
