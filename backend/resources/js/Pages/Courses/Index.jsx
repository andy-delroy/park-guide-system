import axios from 'axios';
import { Link, useForm, usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';
import ButtonThin from '@/Components/ButtonThin';

export default function CoursesIndex() {
  const { courses, auth } = usePage().props;
  const { delete: destroy } = useForm();
  const [message, setMessage] = useState({ success: null, error: null });

  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (user?.role_name === 'guide') {
      axios
        .get(`http://127.0.0.1:5000/recommend?guide_id=${user.id}`)
        .then((res) => {
          setRecommended(res.data);
        })
        .catch((err) => {
          console.error("Recommendation fetch failed:", err);
        });
    }
  }, [user]);

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
            >
              <Button type="create">
                + Create Course
              </Button>
            </Link>
          )}
        </div>

        {/* Recommended Courses Section */}
        {recommended.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Recommended Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((course) => (
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

                    {/* View Modules Link */}
                    <div className="mt-4 flex justify-between items-center">
                      <Link
                        href={`/courses/${course.id}/modules`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Modules
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* "Other Courses" Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Other Courses</h2>
        </div>

        {/* All Courses Section */}
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
                    >
                      <ButtonThin type="detail">
                        View Modules
                      </ButtonThin>
                    </Link>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/courses/${course.id}/edit`}
                        >
                          <ButtonThin type="edit">
                            Edit
                          </ButtonThin>
                        </Link>
                        <Link
                          href={`/courses/${course.id}`}
                          method="delete"
                          as="button"
                          onClick={(e) => {
                            if (!confirm("Are you sure you want to delete this course?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <ButtonThin type="delete">
                            Delete
                          </ButtonThin>
                        </Link>
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
            </div>
          )}
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}
