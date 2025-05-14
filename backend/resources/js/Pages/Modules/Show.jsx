import React, { useState } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

export default function ModuleShow() {
  const { course, module, auth } = usePage().props;
  const [expandedResourceId, setExpandedResourceId] = useState(null);
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  const [completedResources, setCompletedResources] = useState(() => {
    const saved = localStorage.getItem(`course_${course.id}_module_${module.id}_progress`);
    return saved ? JSON.parse(saved) : [];
  });

  const markResourceCompleted = (resourceId) => {
    const newCompletedResources = completedResources.includes(resourceId)
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId];

    setCompletedResources(newCompletedResources);

    localStorage.setItem(
      `course_${course.id}_module_${module.id}_progress`,
      JSON.stringify(newCompletedResources)
    );
  };

  const calculateProgress = () => {
    if (!module.resources || module.resources.length === 0) return 0;
    return Math.round((completedResources.length / module.resources.length) * 100);
  };

  const renderPreview = (res) => {
    if (!res.url) return null;

    const resourceUrl = res.url.startsWith('http') ? res.url : `/storage/${res.url}`;
    const isYouTube = resourceUrl.includes('youtube.com') || resourceUrl.includes('youtu.be');
    const isVimeo = resourceUrl.includes('vimeo.com');
    const isPDF = resourceUrl.endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(resourceUrl);

    if (isYouTube) {
      const videoId = resourceUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return (
        <iframe
          src={embedUrl}
          title={res.title}
          className="mt-2 w-full aspect-video rounded"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    if (isVimeo) {
      const videoId = resourceUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      return (
        <iframe
          src={embedUrl}
          title={res.title}
          className="mt-2 w-full aspect-video rounded"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      );
    }

    if (isPDF) {
      const isExpanded = expandedResourceId === res.id;
      return (
        <div className="relative mt-2">
          <iframe
            src={resourceUrl}
            title={res.title}
            className={`w-full border rounded transition-all duration-300 ${isExpanded ? 'h-[80vh]' : 'h-96'}`}
          />
          <button
            onClick={() => setExpandedResourceId(isExpanded ? null : res.id)}
            className="absolute top-2 right-2 bg-white bg-opacity-80 text-sm px-3 py-1 border rounded shadow hover:bg-opacity-100 transition"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={resourceUrl}
          alt={res.title}
          className="mt-2 w-full max-w-md rounded shadow"
        />
      );
    }

    return (
      <a
        href={resourceUrl}
        className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Resource
      </a>
    );
  };

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{module.title}</h2>}
    >
      <Head title={module.title} />

      <SectionCard>
        <Link 
          href={`/courses/${course.id}/modules`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Modules
        </Link>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{module.title}</h1>
              <p className="text-sm text-gray-500 capitalize">{module.material_type}</p>
            </div>

            {isAdmin && (
              <div className="space-x-2">
                <Link
                  href={`/courses/${course.id}/modules/${module.id}/edit`}
                  className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this module?')) {
                      router.delete(`/courses/${course.id}/modules/${module.id}`, {
                        onSuccess: () => router.visit(`/courses/${course.id}/modules`)
                      });
                    }
                  }}
                  className="inline-block rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="text-gray-700 mb-6">{module.description}</div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Resources</h2>
            {module.resources && module.resources.length > 0 ? (
              <ul className="space-y-4">
                {(module.resources || []).map((res) => (
                  <li key={res.id} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">{res.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{res.type}</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={completedResources.includes(res.id)}
                            onChange={() => markResourceCompleted(res.id)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring focus:ring-indigo-200"
                          />
                          <span className="ml-2 text-sm text-gray-600">Mark as completed</span>
                        </label>
                      </div>
                    </div>
                    {renderPreview(res)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No resources added yet.</p>
            )}
          </div>
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}