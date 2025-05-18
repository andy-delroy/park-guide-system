import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

export default function GuideAnalyticsDashboard() {
  const { auth } = usePage().props;

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Guide Analytics</h2>}
    >
      <Head title="Guide Analytics" />

      <SectionCard>
        <p className="text-gray-500">Guide analytics content goes here.</p>
      </SectionCard>
    </AuthenticatedLayout>
  );
}
