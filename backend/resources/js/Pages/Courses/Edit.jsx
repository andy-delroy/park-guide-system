import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

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
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-800 text-white p-6 flex-shrink-0">
        <h2 className="text-xl font-bold mb-8">Courses</h2>
        <nav className="space-y-2">
          <Link
            href="/courses"
            className="block px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition"
          >
            All Courses
          </Link>
          {isAdmin && (
            <Link
              href="/courses/create"
              className="block px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition"
            >
              Create Course
            </Link>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="mt-2 text-gray-600">Update the details for {course?.title || 'course'}.</p>
        </header>

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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Update Course
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}