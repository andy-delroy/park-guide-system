import React from 'react';
import { Link } from '@inertiajs/react';

export default function Sidebar({ course, activePage = 'modules' }) {
  return (
    <aside className="w-64 bg-blue-800 text-white p-6 flex-shrink-0">
      <h2 className="text-xl font-bold mb-8">{course?.title || 'Course'}</h2>
      <nav className="space-y-2">
        <Link 
          href="/courses" 
          className={`block px-4 py-2 text-sm rounded-md ${activePage === 'courses' ? 'bg-blue-900' : 'hover:bg-blue-700 transition'}`}
        >
          All Courses
        </Link>
        <Link
          href={`/courses/${course?.id}/modules`}
          className={`block px-4 py-2 text-sm rounded-md ${activePage === 'modules' ? 'bg-blue-900' : 'hover:bg-blue-700 transition'}`}
        >
          Modules
        </Link>
        <Link
          href={`/courses/${course?.id}/grades`}
          className={`block px-4 py-2 text-sm rounded-md ${activePage === 'grades' ? 'bg-blue-900' : 'hover:bg-blue-700 transition'}`}
        >
          Grades
        </Link>
        <Link
          href={`/courses/${course?.id}/progress`}
          className={`block px-4 py-2 text-sm rounded-md ${activePage === 'progress' ? 'bg-blue-900' : 'hover:bg-blue-700 transition'}`}
        >
          Progress
        </Link>
      </nav>
    </aside>
  );
}