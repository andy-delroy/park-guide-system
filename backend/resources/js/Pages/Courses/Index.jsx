import React from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';

export default function CoursesIndex() {
  const { courses, auth } = usePage().props;
  const { delete: destroy } = useForm();
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      destroy(`/courses/${id}`, {
        onSuccess: () => alert('Course deleted successfully.'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-800 text-white p-6 flex-shrink-0">
        <h2 className="text-xl font-bold mb-8">Courses</h2>
        <nav className="space-y-2">
          <Link
            href="/courses"
            className="block px-4 py-2 text-sm bg-blue-900 rounded-md"
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
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          <p className="mt-2 text-gray-600">Browse and manage your courses.</p>
          {isAdmin && (
            <Link
              href="/courses/create"
              className="mt-4 inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
            >
              + Create Course
            </Link>
          )}
        </header>

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
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{course.description || 'No description available.'}</p>
                  <p className="mt-2 text-sm text-gray-500">
                  Modules: {course.modules_count}
                  </p>
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
              <div className="text-4xl mb-4 text-blue-600"></div>
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
      </main>
    </div>
  );
}