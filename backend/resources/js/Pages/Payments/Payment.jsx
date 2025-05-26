import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function PaymentModal({ onClose }) {
  const { qr } = usePage().props;
  const user = usePage().props.auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin';

  const [activeTab, setActiveTab] = useState('card');
  const [receipt, setReceipt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = (e) => {
    setReceipt(e.target.files[0]);
  };

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value
      .replace(/[^0-9]/g, '')
      .slice(0, 4)
      .replace(/(\d{2})(\d{1,2})/, '$1/$2');
  };

  const handleCardSubmit = () => {
  const form = new FormData();
  form.append('course_id', 1); // Replace with dynamic course ID if needed
  form.append('method', 'card');

  router.post('/payments', form, {
    onSuccess: () => {
      alert('Payment recorded!');
      onClose(); // optionally close modal
    }
  });
};

  const handleBankSubmit = () => {
    if (!receipt) return alert('Please upload a receipt.');
    const form = new FormData();
    form.append('receipt', receipt);
    form.append('course_id', 1); // Replace with actual course ID
    form.append('method', 'bank');
    router.post('/payments', form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-lg p-6 border border-green-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-700">💰 Choose Payment Method</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 text-center font-medium transition border-b-2 ${
              activeTab === 'card' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            💳 Card Payment
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 text-center font-medium transition border-b-2 ${
              activeTab === 'bank' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            🏦 Bank Transfer
          </button>
        </div>

        {activeTab === 'card' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name on card"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={40}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-400"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="4111 1111 1111 1111"
              value={formData.number}
              onChange={(e) => handleChange('number', formatCardNumber(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-400"
            />
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) => handleChange('expiry', formatExpiry(e.target.value))}
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="CVV"
                value={formData.cvv}
                maxLength={4}
                onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-400"
              />
            </div>
            <button
              onClick={handleCardSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
            >
              Pay Now
            </button>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-4 text-center">
            {qr ? (
              <>
                <img
                  src={`/storage/${qr.image_path}`}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 border rounded shadow"
                />
                <p className="text-sm text-gray-600">{qr.label}</p>
              </>
            ) : (
              <p className="text-red-500">No QR code available</p>
            )}

            <div className="bg-gray-50 border p-4 rounded-lg text-left">
              <p><strong>Bank:</strong> GreenPay Bank</p>
              <p><strong>Account Name:</strong> NovaStore Solutions</p>
              <p><strong>Account No:</strong> 123-456-7890</p>
            </div>

            <div className="text-left">
              <label className="block mb-1 font-medium text-gray-700">Upload Payment Receipt</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleUpload}
                className="block w-full border border-gray-300 px-4 py-2 rounded-lg"
              />
            </div>

            <button
              onClick={handleBankSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
            >
              Submit Receipt
            </button>

            {isAdmin && (
              <Link
                href={route('admin.uploadqr')}
                className="inline-block mt-4 text-sm text-yellow-600 hover:text-yellow-700 underline"
              >
                ✏️ Edit QR Code
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
