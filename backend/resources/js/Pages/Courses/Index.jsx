import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useForm, usePage, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';
import ButtonThin from '@/Components/ButtonThin';

export default function CoursesIndex() {
  const { courses, auth, enrolled = [] } = usePage().props;
  const { delete: destroy } = useForm();
  const [message, setMessage] = useState({ success: null, error: null });
  const [enrolledCourses, setEnrolledCourses] = useState(enrolled);
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    console.log('User role:', user?.role_name); // Debug user role
    console.log('Enrolled courses:', enrolledCourses); // Debug enrolled courses
    console.log('Initial enrolled from props:', enrolled); // Debug props
    if (user?.role_name === 'guide') {
    axios
      .get(`http://127.0.0.1:5000/recommend?guide_id=${user.id}`)
      .then((res) => {
        console.log(res.data.recommended_courses);  // Log the response to check if the data is correct
        setRecommended(res.data.recommended_courses);  // Make sure the response is an array of course objects
      })
      .catch((err) => {
        console.error("Recommendation fetch failed:", err);
      });
  }
  }, [user, enrolledCourses]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      destroy(`/courses/${id}`, {
        onSuccess: () => setMessage({ success: 'Course deleted successfully.', error: null }),
        onError: () => setMessage({ success: null, error: 'Failed to delete course.' }),
      });
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      // Optional: Check if the guide already paid for this course
      const { data } = await axios.post('/payments/check', { course_id: courseId });

      router.visit('/payment', {
        data: { course_id: courseId },
      });

      //proceed with enroll if paid
      const response = await axios.post(`/courses/${courseId}/enroll`);
      setMessage({ success: response.data.message || 'Successfully enrolled in the course!', error: null });
      setEnrolledCourses((prev) => {
        const updated = [...prev, courseId];
        console.log('Updated enrolled courses:', updated);
        return updated;
      });
      router.reload({ only: ['enrolled'] });
    } catch (error) {
      let errorMessage = 'Enrollment failed. Please try again.';
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'You are already enrolled in this course.';
        } else if (error.response.status === 403) {
          errorMessage = 'Only guides can enroll in courses.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      setMessage({ success: null, error: errorMessage });
    }
  };

  const renderCourseCard = (course, isEnrolled) => (
    <div
      key={course.id}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
    >
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center rounded-t-lg"
          style={{
            backgroundColor: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)})`,
          }}
        >
          {/* More suitable image placeholder icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm3 14l3.5-4.5 2.5 3 3.5-4.5L21 18H6z"
            />
          </svg>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {course.title}
          {isEnrolled && (
            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Enrolled
            </span>
          )}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {course.description || 'No description available.'}
        </p>
        <p className="mt-2 text-sm text-gray-500">Modules: {course.modules_count}</p>
        <p className="mt-1 text-sm text-gray-600">
          Duration: {course.duration || 'Not specified'}
        </p>

        <div className="mt-4 flex justify-between items-center">
          {(user?.role_name === 'guide' && !isEnrolled) && ( 
            <Button
              onClick={() => enrollInCourse(course.id)}
              type="create"
              typeAttr="button"
              className="w-full"
            >
              Enroll
            </Button>
          )}
          {(isAdmin || isEnrolled) && (
            <Link href={`/courses/${course.id}/modules`}>
              <ButtonThin type="detail">View Modules</ButtonThin>
            </Link>
          )}
          {isAdmin && (
            <div className="flex space-x-2">
              <Link href={`/courses/${course.id}/edit`}>
                <ButtonThin type="edit">Edit</ButtonThin>
              </Link>
              <Link
                href={`/courses/${course.id}`}
                method="delete"
                as="button"
                onClick={() => handleDelete(course.id)}
              >
                <ButtonThin type="delete">Delete</ButtonThin>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const enrolledList = courses.filter((c) => enrolledCourses.includes(c.id));
  const unenrolledList = courses.filter((c) => !enrolledCourses.includes(c.id));

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
            <Link href="/courses/create">
              <Button type="create">+ Create Course</Button>
            </Link>
          )}
        </div>

        

        {user?.role_name === 'guide' && (
          <>
            <h4 className="text-md font-semibold mb-2 text-gray-900">Your Enrolled Courses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledList.length > 0 ? (
                enrolledList.map((course) => renderCourseCard(course, true))
              ) : (
                <div className="col-span-full text-center text-gray-500">
                  You are not enrolled in any courses.
                </div>
              )}
            </div>
              {recommended.length > 0 && (
  <div className="mb-8">
    <h4 className="text-md font-semibold mt-6 mb-2 text-gray-900">Recommended Course</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommended
        .filter((course) => !enrolledCourses.includes(course.id))
        .map((course) =>
          renderCourseCard(course, false)
        )}
      {recommended.filter((course) => !enrolledCourses.includes(course.id)).length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No recommended courses available.
        </div>
      )}
    </div>
  </div>
)}

            <h4 className="text-md font-semibold mt-6 mb-2 text-gray-900">Other Available Courses</h4>
          </>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unenrolledList.length > 0 ? (
            unenrolledList.map((course) => renderCourseCard(course, false))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No other courses available.
            </div>
          )}
        </div>
        
      </SectionCard>
    </AuthenticatedLayout>
  );
}


