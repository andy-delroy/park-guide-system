import React, { useState } from 'react';
import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

export default function CoursesIndex() {
  const { courses, auth } = usePage().props;
  const { delete: destroy } = useForm();
  const [message, setMessage] = useState({ success: null, error: null });

  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin';

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      destroy(`/courses/${id}`, {
        onSuccess: () => setMessage({ success: 'Course deleted successfully.', error: null }),
        onError: () => setMessage({ success: null, error: 'Failed to delete course.' }),
      });
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Course Management</h2>}
    >
      <Head title="Courses" />

      <SectionCard>
        {message.success && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{message.success}</div>
        )}
        {message.error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{message.error}</div>
        )}

        <div className="mb-4 flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">Courses</h3>
          {isAdmin && (
            <Link
              href="/courses/create"
              className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              + Create Course
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {course.description || 'No description available.'}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Modules: {course.modules_count}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Duration: {course.duration || 'Not specified'}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      href={`/courses/${course.id}/modules`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Modules
                    </Link>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/courses/${course.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900">No courses available</h3>
              <p className="text-gray-600 mt-2">Create a course to get started.</p>
              {isAdmin && (
                <Link
                  href="/courses/create"
                  className="mt-4 inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
                >
                  Create First Course
                </Link>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}
