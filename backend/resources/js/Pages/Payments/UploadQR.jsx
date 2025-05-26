import React from 'react';
import { useForm } from '@inertiajs/react';

export default function UploadQR({ qr }) {
  const { data, setData, post, progress, errors } = useForm({
    qr_image: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.uploadqr.post'));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload New QR Code</h2>

      {qr && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Current QR:</p>
          <img
            src={`/storage/${qr.image_path}`}
            alt="Current QR"
            className="w-48 border border-gray-300 rounded"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setData('qr_image', e.target.files[0])}
          className="mb-4"
        />
        {errors.qr_image && (
          <p className="text-red-500 text-sm">{errors.qr_image}</p>
        )}
        {progress && (
          <progress value={progress.percentage} max="100">
            {progress.percentage}%
          </progress>
        )}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Upload QR
        </button>
      </form>
    </div>
  );
}
