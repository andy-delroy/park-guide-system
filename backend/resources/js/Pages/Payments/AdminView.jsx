import React from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminView({ auth }) {
  const { payments } = usePage().props;

  return (
    <AuthenticatedLayout
      auth={auth}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">🧾 Payment Transactions</h2>}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Course ID</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3">{payment.user?.email || 'N/A'}</td>
                    <td className="px-4 py-3">{payment.course_id}</td>
                    <td className="px-4 py-3 capitalize">{payment.method}</td>
                    <td className="px-4 py-3">{payment.status}</td>
                    <td className="px-4 py-3">{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {payment.receipt_path ? (
                        <a
                          href={`/storage/${payment.receipt_path}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
