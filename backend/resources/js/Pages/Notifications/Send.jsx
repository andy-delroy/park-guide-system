import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

export default function Send({ auth }) {
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

  const triggerBroadcast = async () => {
    try {
      await axios.get('/broadcast/test');
    } catch (err) {
      console.error('Broadcast failed:', err.response?.data ?? err.message);
    }
  };

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
              <h2 className="text-lg font-semibold mb-4">Broadcast Test</h2>
              <button
                onClick={triggerBroadcast}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}