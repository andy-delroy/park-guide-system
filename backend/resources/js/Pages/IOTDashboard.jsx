import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

export default function IOTDashboard() {
  const { auth } = usePage().props;
  const [message, setMessage] = useState({ success: null, error: null });

  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  return (
    <AuthenticatedLayout
      user={user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">IoT Dashboard</h2>}
    >
      <Head title="IoT Dashboard" />

      <SectionCard>
        {message.success && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{message.success}</div>
        )}
        {message.error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{message.error}</div>
        )}

        {/* 📍 Add your dashboard content below */}
        <div className="text-gray-700">
          <p>Welcome to the IoT Dashboard. Customize this section with charts, tables, or sensor data.</p>
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}
