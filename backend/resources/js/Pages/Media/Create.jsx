import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';

const Create = ({ auth }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    caption: '',
    type: 'image',
    file: null,
    park_id: '', // Add park_id if needed
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post('/media', data, {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Upload New Media
        </h2>
      }
      showBackButton={true}
      backHref="/dashboard"
    >
      <Head title="Upload Media" />

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Caption (optional)</label>
            <input
              type="text"
              name="caption"
              value={data.caption}
              onChange={(e) => setData('caption', e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
            {errors.caption && <div className="text-red-500 text-sm mt-1">{errors.caption}</div>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              name="file"
              accept={data.type === 'image' ? 'image/jpeg,image/png,image/jpg' : 'video/mp4,video/quicktime'}
              onChange={(e) => setData('file', e.target.files[0])}
              className="w-full dark:text-gray-100"
            />
            {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
          </div>

          <div className="flex space-x-2">
            <Button typeAttr="submit" disabled={processing}>
              {processing ? 'Uploading...' : 'Upload'}
            </Button>
            <Link href="/dashboard">
              <Button type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </SectionCard>
    </AuthenticatedLayout>
  );
};

export default Create;
