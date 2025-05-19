import React, { useState } from 'react';
import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';

export default function EditCourse() {
  const { course, auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  const [preview, setPreview] = useState(course?.thumbnail || null);

  const { data, setData, post, processing, errors } = useForm({
    title: course?.title || '',
    description: course?.description || '',
    duration: course?.duration || '',
    thumbnail: null,
    _method: 'PUT',
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('thumbnail', file);
      setPreview(URL.createObjectURL(file));
    } else {
      setData('thumbnail', null);
      setPreview(course?.thumbnail || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', data); // Debug form data
    if (!course?.id) {
      alert('Error: Course ID is missing.');
      return;
    }
    post(`/courses/${course.id}`, {
      forceFormData: true,
      onSuccess: () => {
        console.log('Update successful');
        alert('Course updated successfully.');
      },
      onError: (errors) => {
        console.error('Update failed:', errors);
        alert('Failed to update course. Check console for details.');
      },
    });
  };

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Course</h2>}
      showBackButton={true}
      backHref="/courses"
    >
      <Head title="Edit Course" />

      <SectionCard>
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {Object.values(errors)[0]}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Update the details for {course?.title || 'course'}.
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows="4"
              />
              {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (e.g., 3 hours)
              </label>
              <input
                id="duration"
                type="text"
                value={data.duration}
                onChange={(e) => setData('duration', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
              {errors.duration && <p className="mt-2 text-sm text-red-600">{errors.duration}</p>}
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                Thumbnail
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Thumbnail preview"
                  className="mt-4 w-full max-w-xs rounded-md border border-gray-200"
                />
              )}
              {errors.thumbnail && <p className="mt-2 text-sm text-red-600">{errors.thumbnail}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/courses"
              >
                <Button type="cancel">
                  Cancel
                </Button>
              </Link>
              <Button
                type="update"
                typeAttr="submit"
                disabled={processing}
              >
                Update Course
              </Button>
            </div>
          </form>
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}