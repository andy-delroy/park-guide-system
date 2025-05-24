import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';
import TextInput from '@/Components/TextInput';

const ManageMedia = ({ auth, media }) => {
  const [inputCaptions, setInputCaptions] = useState({});
  const handleInputChange = (id, value) => {
    setInputCaptions(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (id) => {
    const caption = inputCaptions[id] ?? '';
    router.put(`/media/${id}`, { caption }, {
      preserveScroll: true,
      onSuccess: (page) => {
        router.reload({ only: ['media'] });
        setInputCaptions(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
      onError: (errors) => {
        console.error('Update failed:', errors);
        alert('Failed to update media: ' + JSON.stringify(errors));
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this media?')) {
      router.delete(`/media/${id}`, {
        preserveScroll: true,
        onSuccess: (page) => {
          router.reload({ only: ['media'] });
          setInputCaptions(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        },
        onError: (errors) => {
          console.error('Delete failed:', errors);
          alert('Failed to delete media: ' + JSON.stringify(errors));
        }
      });
    }
  };

  const images = media.data.filter(item => item.type === 'image');
  const videos = media.data.filter(item => item.type === 'video');

  const renderMediaItem = (item) => {
    const currentInput = inputCaptions[item.id];
    const originalCaption = item.caption ?? '';
    const hasChanged = currentInput !== undefined && currentInput !== originalCaption;

    return (
      <div
        key={item.id}
        className="relative group border rounded-lg shadow hover:shadow-lg transition overflow-hidden"
      >
        <button
          onClick={() => handleDelete(item.id)}
          className="absolute top-2 right-2 z-20 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 opacity-80 group-hover:opacity-100"
          title="Delete"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {item.type === 'image' ? (
          <img
            src={item.url}
            alt="Media"
            className="w-full h-48 object-cover"
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-48 object-cover"
            muted
            autoPlay
            loop
            playsInline
          />
        )}

        <div className="p-3 bg-white dark:bg-gray-900">
          <TextInput
            value={currentInput ?? originalCaption}
            onChange={(e) => handleInputChange(item.id, e.target.value)}
            placeholder="Edit caption"
            className="w-full"
          />

          {hasChanged && (
            <div className="mt-2">
              <Button
                onClick={() => handleUpdate(item.id)}
                type="update"
                className="w-full"
              >
                Update
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Manage Media</h2>}
      showBackButton={true}
      backHref="/home"
    >
      <Head title="Manage Media" />
      <FlashMessages />
      <SectionCard>
        <h3 className="text-lg font-bold mb-4">Images</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {images.length > 0 ? images.map(renderMediaItem) : (
            <p className="text-gray-500 col-span-full">No images uploaded yet.</p>
          )}
        </div>
      </SectionCard>
      <SectionCard>
        <h3 className="text-lg font-bold mb-4">Videos</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {videos.length > 0 ? videos.map(renderMediaItem) : (
            <p className="text-gray-500 col-span-full">No videos uploaded yet.</p>
          )}
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
};

const FlashMessages = () => {
  const { flash } = usePage().props;

  if (!flash) return null;

  return (
    <>
      {flash.success && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded mb-4">
          {flash.success}
        </div>
      )}
      {flash.error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded mb-4">
          {flash.error}
        </div>
      )}
    </>
  );
};

export default ManageMedia;