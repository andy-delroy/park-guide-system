import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationTest() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (typeof window.Echo !== 'undefined') {
      console.log('✅ Echo available, subscribing...');
      window.Echo.channel('notifications')
        .listen('.notification.sent', (event) => {
          console.log('📥 Received:', event);
          setMessages(prev => [`🔔 ${event.message}`, ...prev]);
        });
    } else {
      console.warn('❌ Echo not available');
    }
  }, []);

  const sendNotification = async () => {
    try {
      const response = await axios.post('/send-notification', {
        message: 'This is a test notification!',
      }, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });
      console.log(response.data);
    } catch (err) {
      console.error('❌ Failed to send notification:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📡 Notifications</h1>

      <button
        onClick={sendNotification}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        🚀 Send Notification
      </button>

      <ul className="mt-4 space-y-2">
        {messages.map((msg, i) => (
          <li key={i} className="bg-gray-100 p-2 rounded shadow">{msg}</li>
        ))}
      </ul>
    </div>
  );
}
