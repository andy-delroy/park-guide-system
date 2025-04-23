import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export default function Dashboard({auth}) {
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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    You are logged in as: {auth.user.role_name}
                </h2>
            }
        >
            <Head title="Dashboard" />

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
