import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export default function NotificationList({ auth, notifications }) {
  const role = auth?.user?.role_name ?? 'guest';
  
    useEffect(() => {
      const channelName = `notifications.${role}`;
      console.log(`👂 Subscribing to ${channelName}...`);
  
      const channel = window.Echo.channel(channelName);
  
      channel.listen('.test', (event) => {
        console.log('📡 Received broadcast:', event.message);
  
        Toastify({
          text: event.message || "🔔 New notification received",
          duration: 5000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#4fbe87",
        }).showToast();
      });
  
      return () => {
        window.Echo.leave(channelName);
      };
    }, [role]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Notifications</h2>}
    >
      <Head title="Notifications" />

      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="border rounded-lg shadow-sm bg-white p-4 flex justify-between items-start gap-4"
            >
              <div>
                <div className="font-medium text-gray-800">{n.message}</div>
                <div className="text-sm text-gray-500">
                  {new Date(n.created_date ?? n.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  n.priority_level === 'high'
                    ? 'bg-red-100 text-red-700'
                    : n.priority_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {n.priority_level ?? 'info'}
                </span>

                <span className={`text-xs ${
                  n.is_read ? 'text-green-600' : 'text-red-500'
                }`}>
                  {n.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </AuthenticatedLayout>
  );
}
