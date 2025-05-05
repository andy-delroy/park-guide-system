import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

export default function AdminManageAlerts({ auth, alerts }) {
  const user = auth.user;

  const hasAccess = user.role_name === 'admin' || user.role_name === 'superadmin';

  if (!hasAccess) {
    return (
      <AuthenticatedLayout user={user}>
        <Head title="Access Denied" />
        <div className="p-6 max-w-2xl mx-auto text-center text-red-600 font-semibold text-lg border border-red-300 bg-red-50 rounded">
          Access Denied: You do not have permission to view this page.
        </div>
      </AuthenticatedLayout>
    );
  }

  const [editingId, setEditingId] = useState(null);
  const { data, setData, post, put, processing, reset } = useForm({
    message: '',
    type: 'info',
    park_id: null,
    expiry: null,
  });

  const startEdit = (alert) => {
    setEditingId(alert.id);
    setData('message', alert.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const submitEdit = (e) => {
    e.preventDefault();
    put(`/admin/alerts/${editingId}`, {
      preserveScroll: true,
      onSuccess: () => cancelEdit()
    });
  };

  const submitNew = (e) => {
    e.preventDefault();
    post('/alerts', {
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };

  const cancelAlert = (id) => {
    put(`/admin/alerts/${id}`, {
      expiry: dayjs().toISOString(),
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Manage Park Alerts</h2>}
    >
      <Head title="Manage Alerts" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">

        {/* Create Alert */}
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Create & Broadcast Alert</h3>
          <form onSubmit={submitNew} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Enter alert message"
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              required
            />

            <select
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="border px-2 py-2 rounded"
            >
              <option value="info">Info</option>
              <option value="emergency">Emergency</option>
            </select>

            <button
              type="submit"
              disabled={processing}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Send Alert
            </button>
          </form>
        </div>

        {/* 📜 Existing Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-gray-500">No alerts found.</div>
          ) : (
            alerts.map((alert) => {
              const isExpired = alert.expiry && dayjs(alert.expiry).isBefore(dayjs());

              return (
                <div key={alert.id} className="border p-4 rounded shadow-sm bg-white">
                  <div className="mb-2 text-sm text-gray-500">
                    Type: <span className="font-semibold">{alert.type}</span>
                    {' | '}
                    Expires: {alert.expiry ?? 'N/A'}{' '}
                    {isExpired && <span className="text-red-500">(expired)</span>}
                  </div>

                  {editingId === alert.id ? (
                    <form onSubmit={submitEdit} className="space-y-2">
                      <textarea
                        className="w-full border px-2 py-1 rounded"
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        required
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          disabled={processing}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-600 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-gray-800">{alert.message}</p>
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => startEdit(alert)}
                          className="text-sm text-blue-600 underline"
                        >
                          Edit
                        </button>
                        {!isExpired && (
                          <button
                            onClick={() => cancelAlert(alert.id)}
                            className="text-sm text-red-600 underline"
                          >
                            Cancel Alert
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
