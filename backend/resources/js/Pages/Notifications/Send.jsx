import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

export default function Send({ auth }) {
  const role = auth?.user?.role_name ?? 'guest';
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('notifications.visitor');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    const channelName = `notifications.${role}`;
    console.log(`Subscribing to ${channelName}...`);

    const channel = window.Echo.channel(channelName);

    channel.listen('.test', (event) => {
      console.log('Received broadcast:', event.message);

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

  const triggerBroadcast = async () => {
    try {
      // Log CSRF token for debugging
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      console.log('CSRF Token:', csrfToken);

      const response = await axios.post('/notifications', {
        message,
        channel,
        priority,
      });
      setMessage('');
      Toastify({
        text: `Notification sent: ${message}`,
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#4fbe87',
      }).showToast();
      console.log('Broadcast successful:', response.data);
    } catch (err) {
      console.error('Broadcast failed:', err.response?.data ?? err.message);
      const errorMessage = err.response?.data?.error || 'Failed to send notification';
      Toastify({
        text: errorMessage,
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#ff4444',
      }).showToast();
    }
  };

  // Only render the form if the user is an admin
  if (role !== 'admin') {
    return (
      <AuthenticatedLayout
        user={auth.user}
        header={
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            You are logged in as: {auth.user.role_name}
          </h2>
        }
      >
        <Head title="Send Notification" />
        <div className="py-12">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <p className="text-red-600">You are not authorized to send notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          You are logged in as: {auth.user.role_name}
        </h2>
      }
    >
      <Head title="Send Notification" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Broadcast Notification</h2>

              <textarea
                className="w-full border p-2 rounded mb-4"
                rows="3"
                placeholder="Enter your broadcast message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>

              <select
                className="w-full border p-2 rounded mb-4"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="all_channels">All Channels</option>
                <option value="notifications.admin">Admin</option>
                <option value="notifications.visitor">Visitor</option>
                <option value="notifications.guide">Park Guide</option>
              </select>

              <select
                className="w-full border p-2 rounded mb-4"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                onClick={triggerBroadcast}
                disabled={!message.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}