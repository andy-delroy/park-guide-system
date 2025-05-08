import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function ModuleShow() {
  const { course, module, auth } = usePage().props;
  const [expandedResourceId, setExpandedResourceId] = useState(null);
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  // Progress tracking state
  const [completedResources, setCompletedResources] = useState(() => {
    // Try to load from localStorage if available
    const saved = localStorage.getItem(`course_${course.id}_module_${module.id}_progress`);
    return saved ? JSON.parse(saved) : [];
  });

  const markResourceCompleted = (resourceId) => {
    const newCompletedResources = completedResources.includes(resourceId) 
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId];
    
    setCompletedResources(newCompletedResources);
    
    // Save to localStorage
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
        className="text-blue-500 underline mt-2 inline-block"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Resource
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar course={course} activePage="modules" />

      <main className="flex-1 p-8">
        <Link 
          href={`/courses/${course.id}/modules`} 
          className="inline-flex items-center text-blue-600 hover:underline mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Modules
        </Link>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{module.title}</h1>
            
            <div className="flex items-center">
              <div className="mr-3 text-sm text-gray-600">Progress: {calculateProgress()}%</div>
              <div className="w-32 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
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
                        {/* Mark as completed checkbox */}
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={completedResources.includes(res.id)}
                            onChange={() => markResourceCompleted(res.id)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
      </main>
    </div>
  );
}