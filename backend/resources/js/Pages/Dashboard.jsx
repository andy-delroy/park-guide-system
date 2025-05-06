import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export default function Dashboard({ auth }) {
  const role = auth?.user?.role_name ?? 'guest';

  const [alert, setAlert] = useState(null); // For inline alert display

  useEffect(() => {
    const notifChannel = window.Echo.channel(`notifications.${role}`);
    console.log(`Subscribing to notifications.${role}...`);

    notifChannel.listen('.test', (event) => {
      console.log(' Notification received:', event.message);
      Toastify({
        text: event.message || " New notification received",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4fbe87",
      }).showToast();
    });

    // Park alert subscription (only if NOT admin)
    if (role !== 'admin') {
      const alertChannel = window.Echo.channel('alerts.public');
      console.log('Subscribing to alerts.public...');

      alertChannel.listen('.alert.created', (e) => {
        console.log('Park alert received:', e.alert);
        console.log('📬 Recipients:', e.recipients);
        setAlert(e.alert);
      });

      return () => {
        window.Echo.leave('alerts.public');
      };
    }

    return () => {
      window.Echo.leave(`notifications.${role}`);
    };
  }, [role]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          You are logged in as: {auth.user.role_name}
        </h2>
      }
    >
      <Head title="Dashboard" />

      {}
      {alert && (
        <div className="mx-4 mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Alert:</strong>
          <span className="ml-2">{alert.message}</span>
        </div>
      )}
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              You're logged in!
              <div className="mb-4">
                <p className="text-lg">Welcome, {auth.user.full_name}!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
