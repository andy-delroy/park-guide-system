import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function NotificationList({ auth, notifications }) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Notifications</h2>}
    >
      <Head title="Notifications" />
      <div className="p-6">
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="p-4 bg-gray-100 rounded shadow">
              <span>{n.message}</span>
              <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </AuthenticatedLayout>
  );
}
