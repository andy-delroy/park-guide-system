import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function ModuleShow() {
  const { course, module } = usePage().props;
  const [expandedResourceId, setExpandedResourceId] = useState(null);

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
    <div className="p-8">
      <Link href={`/courses/${course.id}/modules`} className="text-blue-600 underline">
        ← Back to Modules
      </Link>

      <h1 className="text-2xl font-bold mt-4">{module.title}</h1>
      <p className="mt-2 text-gray-700">{module.description}</p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Resources</h2>
        {module.resources.length === 0 ? (
          <p className="text-gray-500">No resources added yet.</p>
        ) : (
          <ul className="mt-2 space-y-4">
            {module.resources.map((res) => (
              <li key={res.id} className="border p-4 rounded bg-gray-50">
                <h3 className="font-medium">{res.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{res.type}</p>
                {renderPreview(res)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
