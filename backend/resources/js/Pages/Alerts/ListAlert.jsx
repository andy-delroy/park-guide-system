import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

export default function ListAlerts({ auth, alerts }) {
  const [showModal, setShowModal] = useState(false);

  const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
    id: null,
    message: '',
    type: 'info',
    park_id: null,
    expiry: null,
  });

  const selectAlertForEdit = (alert) => {
    setData({
      id: alert.id,
      message: alert.message,
      type: alert.type,
      park_id: alert.park_id,
      expiry: alert.expiry,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const submitAlert = (e) => {
    e.preventDefault();
    post('/alerts', {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
      },
      onError: () => {
        // Optional error handler
      },
    });
  };

  const deleteAlert = (id) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      destroy(`/admin/alerts/${id}`, {
        preserveScroll: true,
        onSuccess: () => console.log('Deleted'),
      });
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Manage Park Alerts</h2>}>
      <Head title="List Alerts" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        {/* Alerts List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Existing Alerts</h3>
          {alerts.length === 0 ? (
            <div className="text-gray-500 text-center">No alerts found.</div>
          ) : (
            alerts.map((alert) => {
              const isExpired = alert.expiry && dayjs(alert.expiry).isBefore(dayjs());

              return (
                <div key={alert.id} className="border p-4 rounded shadow-sm bg-white">
                  <div className="mb-2 text-sm text-gray-500">
                    Type: <span className="font-semibold">{alert.type}</span> |{' '}
                    Expires: {alert.expiry ? dayjs(alert.expiry).format('YYYY-MM-DD HH:mm') : 'N/A'}
                    {isExpired && <span className="text-red-500"> (expired)</span>}
                  </div>
                  <p className="text-gray-800">{alert.message}</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => selectAlertForEdit(alert)}
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-sm text-red-600 underline hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">Edit Alert</h3>
            <form onSubmit={submitAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  required
                />
                {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData('type', e.target.value)}
                  className="w-full border px-2 py-2 rounded"
                >
                  <option value="info">Info</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry</label>
                <input
                  type="datetime-local"
                  className="w-full border px-2 py-1 rounded"
                  value={data.expiry ? dayjs(data.expiry).format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => setData('expiry', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Park ID</label>
                <input
                  type="number"
                  className="w-full border px-2 py-1 rounded"
                  value={data.park_id || ''}
                  onChange={(e) => setData('park_id', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={processing || !data.id}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
